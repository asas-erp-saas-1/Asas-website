import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { withSecurityHeaders } from '@/lib/with-security-headers';

const EMAIL_SCHEMA = z.string().email("Adresse e-mail invalide");

const subscribeSchema = z.object({
  email: EMAIL_SCHEMA,
  source: z.string().max(50).optional(),
  locale: z.string().max(8).optional(),
  pageUrl: z.string().max(500).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  // Honeypot — bots auto-fill this; real users never see it.
  website: z.string().optional(),
});

// Simple in-memory rate limiting per IP (per process — fine for low traffic)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 subs per minute per IP
const rateLimit = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimit.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429 }
      ));
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return withSecurityHeaders(NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }));
    }

    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return withSecurityHeaders(NextResponse.json(
        { error: firstError?.message ?? 'Adresse e-mail invalide' },
        { status: 400 }
      ));
    }

    const { email, source, locale, pageUrl, utmSource, utmMedium, utmCampaign, website } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // ─── Honeypot: bots auto-fill all fields; real users never see `website` ──
    if (website && website.trim() !== '') {
      // Log + return fake success so the bot doesn't retry.
      console.warn('[newsletter] honeypot triggered', { ip });
      return withSecurityHeaders(NextResponse.json(
        { success: true, message: 'Inscription réussie. Merci !' },
        { status: 201 }
      ));
    }

    // Use upsert for atomic operation (avoids race condition between findUnique + create/update)
    const subscriber = await db.newsletterSubscription.upsert({
      where: { email: normalizedEmail },
      update: {
        status: 'SUBSCRIBED',
        source: source ?? 'WEBSITE',
        unsubscribedAt: null,
        confirmedAt: new Date(),
      },
      create: {
        email: normalizedEmail,
        source: source ?? 'WEBSITE',
        locale: locale ?? 'fr',
        pageUrl: pageUrl ?? null,
        utmSource: utmSource ?? null,
        utmMedium: utmMedium ?? null,
        utmCampaign: utmCampaign ?? null,
        status: 'SUBSCRIBED',
        confirmedAt: new Date(),
      },
    });

    // Return appropriate response based on whether this is a new subscription or reactivation
    if (subscriber.confirmedAt && subscriber.createdAt < subscriber.updatedAt) {
      return withSecurityHeaders(NextResponse.json(
        { success: true, reactivated: true, message: 'Votre inscription a été réactivée.' },
        { status: 200 }
      ));
    }

    return withSecurityHeaders(NextResponse.json(
      { success: true, message: 'Inscription réussie. Merci !' },
      { status: 201 }
    ));
  } catch (error) {
    console.error('[API /newsletter/subscribe] Error:', error);
    return withSecurityHeaders(NextResponse.json(
      { error: "Échec de l'inscription. Réessayez plus tard." },
      { status: 500 }
    ));
  }
}
