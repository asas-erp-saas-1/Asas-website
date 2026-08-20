import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { withSecurityHeaders } from '@/lib/with-security-headers';

const unsubscribeSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return withSecurityHeaders(NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 }));
    }

    const parsed = unsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'E-mail invalide' },
        { status: 400 }
      ));
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Use upsert for atomic operation (avoids race condition)
    await db.newsletterSubscription.upsert({
      where: { email },
      update: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
      create: {
        email,
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        source: 'WEBSITE',
        locale: 'fr',
      },
    });

    return withSecurityHeaders(NextResponse.json(
      { success: true, message: 'Vous êtes désinscrit.' },
      { status: 200 }
    ));
  } catch (error) {
    console.error('[API /newsletter/unsubscribe] Error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Échec de la désinscription.' },
      { status: 500 }
    ));
  }
}
