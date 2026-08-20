import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logger } from '@/lib/logger';

/**
 * POST /api/leads
 *
 * Public lead submission endpoint. The lead pipeline entry point.
 *
 * Defense-in-depth (Phase 2 directive §26):
 *   1. Rate limiting — 10 submissions per IP per 60s.
 *   2. Honeypot — `website` field must be empty (bots auto-fill all fields).
 *   3. Server-side validation — Zod schema + Algerian phone regex.
 *   4. Duplicate detection — same phone within 5 minutes = 200 + idempotent
 *      response (so retries don't create duplicate leads).
 *   5. DB persistence BEFORE any notification attempt.
 *   6. Notification is fire-and-forget — failures never block persistence.
 *
 * Note: Rate limiting is per-instance (in-memory Map). On Vercel's
 * multi-instance serverless, this is approximately N× the configured limit
 * where N = concurrent lambda instances. For strict limits, wire Upstash
 * Redis REST (see docs/PRODUCTION_DEPLOYMENT.md).
 */

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 1000) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// Algerian phone: +213 or 0 prefix, then [5-7] (mobile), then 8 digits.
// Server-side re-application (don't trust the client regex).
const ALGERIAN_PHONE = /^(\+213|0)[5-7]\d{8}$/;

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(120),
  phone: z.string().trim().min(1, 'Le téléphone est requis')
    .refine((v) => ALGERIAN_PHONE.test(v.replace(/[\s.-]/g, '')), 'Téléphone invalide'),
  email: z.string().email().optional().or(z.literal('')),
  // Honeypot — bots auto-fill this; real users never see it.
  website: z.string().optional(),
  preferredContact: z.string().optional(),
  intent: z.string().min(1, "L'intention est requise"),
  message: z.string().max(2000).optional(),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  apartmentId: z.string().optional(),
  apartmentName: z.string().optional(),
  pageUrl: z.string().max(500).optional(),
  landingPage: z.string().max(200).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  gclid: z.string().max(200).optional(),
  fbclid: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
  source: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      ));
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      ));
    }

    const result = leadSchema.safeParse(body);
    if (!result.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Données invalides', details: result.error.flatten() },
        { status: 400 }
      ));
    }

    const validated = result.data;

    // ─── Honeypot: reject if the hidden `website` field is filled ──────
    if (validated.website && validated.website.trim() !== '') {
      // Log the bot hit for observability, but return a fake "success"
      // response so the bot doesn't retry with different payloads.
      logger.warn('Lead honeypot triggered', { ip, name: validated.name.slice(0, 60) });
      return withSecurityHeaders(NextResponse.json(
        { success: true, id: 'hp-blocked' },
        { status: 201 }
      ));
    }

    // ─── Duplicate detection: same phone within 5 minutes ─────────────
    // Idempotent response — return the existing lead ID so retries don't
    // create duplicates in the CRM pipeline.
    const recentDuplicate = await db.lead.findFirst({
      where: {
        phone: validated.phone,
        createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });
    if (recentDuplicate) {
      logger.info('Lead duplicate (within dedup window) — returning existing ID', {
        phone: validated.phone.slice(0, 4) + '••••',
        leadId: recentDuplicate.id,
      });
      return withSecurityHeaders(NextResponse.json(
        { success: true, id: recentDuplicate.id, duplicate: true },
        { status: 200 }
      ));
    }

    // ─── Persist BEFORE any notification attempt (directive §26) ──────
    // If a notification layer is added later (email/Slack webhook), it
    // MUST be fire-and-forget: wrap in a try/catch that swallows errors
    // and logs them, so a flaky provider never causes lead loss.
    const lead = await db.lead.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email ?? null,
        preferredContact: validated.preferredContact ?? null,
        intent: validated.intent,
        message: validated.message ?? null,
        projectId: validated.projectId ?? null,
        projectName: validated.projectName ?? null,
        apartmentId: validated.apartmentId ?? null,
        apartmentName: validated.apartmentName ?? null,
        pageUrl: validated.pageUrl ?? null,
        landingPage: validated.landingPage ?? null,
        utmSource: validated.utmSource ?? null,
        utmMedium: validated.utmMedium ?? null,
        utmCampaign: validated.utmCampaign ?? null,
        utmContent: validated.utmContent ?? null,
        utmTerm: validated.utmTerm ?? null,
        gclid: validated.gclid ?? null,
        fbclid: validated.fbclid ?? null,
        referrer: validated.referrer ?? null,
        source: validated.source ?? 'WEBSITE',
        status: 'NEW',
      },
    });

    logger.info('Lead created', { leadId: lead.id, intent: validated.intent, projectId: validated.projectId ?? null });

    return withSecurityHeaders(NextResponse.json({ success: true, id: lead.id }, { status: 201 }));
  } catch (error) {
    logger.error('Lead submission failed', error instanceof Error ? error : { message: String(error) });
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    ));
  }
}
