import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * GET /api/admin/users
 *   List all admin users. ADMIN only.
 *
 * POST /api/admin/users
 *   Create a new admin user. ADMIN only.
 *   Body: { email, name, password, role, active }
 */

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('VIEWER'),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  // All admin roles can list users (sensitive info is hidden)
  const users = await db.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, role: true, active: true,
      createdAt: true, updatedAt: true,
      // passwordHash intentionally excluded
    },
  });
  return withSecurityHeaders(NextResponse.json({ data: users }));
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  // Only ADMIN can create users
  if (!sessionHasRole(session, ['ADMIN'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs.' },
      { status: 403 }
    ));
  }
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      ));
    }
    const { email, name, password, role, active } = parsed.data;

    // Check email uniqueness
    const existing = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      ));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.adminUser.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
        active,
      },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });

    // Audit log
    await logAudit({
      request, session,
      action: 'CREATE_USER',
      entityType: 'AdminUser',
      entityId: user.id,
      entitySlug: user.email,
      after: { email: user.email, name: user.name, role: user.role, active: user.active },
    });

    return withSecurityHeaders(NextResponse.json({ success: true, data: user }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/users] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de création' }, { status: 500 }));
  }
}
