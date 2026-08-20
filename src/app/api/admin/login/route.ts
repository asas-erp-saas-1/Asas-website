import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { createHash } from 'node:crypto';
import { db } from '@/lib/db';

/**
 * POST /api/admin/login
 * Authenticate admin against the database and set a session cookie.
 *
 * Body: { email: string, password: string }
 *
 * Returns: { success: true, user: { id, email, name, role } } on success.
 * Returns: 400 if email/password missing, 401 on bad credentials, 429 if rate limited.
 */

// ─── Rate limiting (DB-backed; safe across Vercel instances) ───────────
const MAX_ATTEMPTS_PER_MINUTE = 5;
const MAX_FAILED_BEFORE_LOCKOUT = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const WINDOW_MS = 60 * 1000;

function rateLimitKey(ip: string): string {
  return createHash('sha256').update(`asas-login:${ip}`).digest('hex');
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = rateLimitKey(ip);
  const now = new Date();
  const row = await db.loginRateLimit.findUnique({ where: { key } });

  if (!row) return { allowed: true };

  if (row.lockedUntil && row.lockedUntil.getTime() > now.getTime()) {
    return { allowed: false, retryAfter: Math.ceil((row.lockedUntil.getTime() - now.getTime()) / 1000) };
  }

  if (row.windowStart.getTime() <= now.getTime() - WINDOW_MS) {
    return { allowed: true };
  }

  if (row.count >= MAX_ATTEMPTS_PER_MINUTE) {
    return { allowed: false, retryAfter: Math.ceil((row.windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000) };
  }

  return { allowed: true };
}

async function recordFailedAttempt(ip: string): Promise<void> {
  const key = rateLimitKey(ip);
  const now = new Date();
  const existing = await db.loginRateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart.getTime() <= now.getTime() - WINDOW_MS) {
    await db.loginRateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now, lockedUntil: null },
    });
    return;
  }

  const count = existing.count + 1;
  await db.loginRateLimit.update({
    where: { key },
    data: {
      count,
      lockedUntil: count >= MAX_FAILED_BEFORE_LOCKOUT
        ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
        : existing.lockedUntil,
    },
  });
}

async function clearFailedAttempts(ip: string): Promise<void> {
  await db.loginRateLimit.deleteMany({ where: { key: rateLimitKey(ip) } });
}

function getClientIP(request: NextRequest): string {
  // Vercel's x-forwarded-for is trusted here because the endpoint is behind
  // Vercel's edge proxy; use the first hop as the originating client IP.
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
}

export async function POST(request: NextRequest) {
  // ─── Rate limiting check ───
  const clientIP = getClientIP(request);
  const rateCheck = await checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    return withSecurityHeaders(NextResponse.json(
      {
        error: rateCheck.retryAfter && rateCheck.retryAfter > 60
          ? `Trop de tentatives. Réessayez dans ${Math.ceil(rateCheck.retryAfter / 60)} minutes.`
          : 'Trop de tentatives. Réessayez dans 1 minute.',
        retryAfter: rateCheck.retryAfter,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfter ?? 60) },
      }
    ));
  }

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      ));
    }

    const result = await authenticateAdmin(email, password);

    if (!result) {
      // Record failed attempt for rate limiting
      await recordFailedAttempt(clientIP);
      // Slight delay to mitigate timing attacks on email enumeration
      await new Promise(r => setTimeout(r, 200));
      // Audit: failed login attempt
      await logAudit({
        request,
        action: 'LOGIN_FAILED',
        entityType: 'AdminUser',
        entitySlug: email,
      });
      return withSecurityHeaders(NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      ));
    }

    // Clear rate limit attempts on successful login
    await clearFailedAttempts(clientIP);
    // Audit: successful login
    await logAudit({
      request,
      session: { token: result.token, userId: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role, expiresAt: Date.now() + 8 * 3600 * 1000 },
      action: 'LOGIN',
      entityType: 'AdminUser',
      entityId: result.user.id,
      entitySlug: result.user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    });
    response.cookies.set('admin-session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return withSecurityHeaders(response);
  } catch (error) {
    console.error('[API /admin/login] Error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Échec de connexion' },
      { status: 500 }
    ));
  }
}
