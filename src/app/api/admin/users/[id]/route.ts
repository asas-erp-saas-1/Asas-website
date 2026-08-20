import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * /api/admin/users/[id]
 *
 * PATCH  — update name, role, active, or reset password. ADMIN only.
 *          Cannot deactivate yourself (prevent self-lockout).
 *          Cannot change your own role (prevent privilege escalation/loss).
 * DELETE — deactivate user (set active=false). ADMIN only.
 *          Hard-delete not supported — would break audit log referential integrity.
 */

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
  active: z.boolean().optional(),
  // Optional password reset — if provided, must be >= 8 chars
  newPassword: z.string().min(8).optional(),
});

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  const { id } = await params;
  const user = await db.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, updatedAt: true },
  });
  if (!user) {
    return withSecurityHeaders(NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 }));
  }
  return withSecurityHeaders(NextResponse.json({ data: user }));
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  if (!sessionHasRole(session, ['ADMIN'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs.' },
      { status: 403 }
    ));
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      ));
    }

    const existing = await db.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return withSecurityHeaders(NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 }));
    }

    // Self-protection: cannot change own role or deactivate yourself
    if (existing.email === session.email) {
      if (parsed.data.role !== undefined && parsed.data.role !== existing.role) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Vous ne pouvez pas modifier votre propre rôle' },
          { status: 400 }
        ));
      }
      if (parsed.data.active === false) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Vous ne pouvez pas désactiver votre propre compte' },
          { status: 400 }
        ));
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
    if (parsed.data.active !== undefined) updateData.active = parsed.data.active;
    if (parsed.data.newPassword) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    }

    const updated = await db.adminUser.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, active: true, updatedAt: true },
    });

    // Audit log
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    if (parsed.data.role !== undefined) { before.role = existing.role; after.role = updated.role; }
    if (parsed.data.active !== undefined) { before.active = existing.active; after.active = updated.active; }
    if (parsed.data.name !== undefined) { before.name = existing.name; after.name = updated.name; }
    await logAudit({
      request, session,
      action: parsed.data.active === false ? 'DEACTIVATE_USER' : 'UPDATE_USER',
      entityType: 'AdminUser',
      entityId: updated.id,
      entitySlug: updated.email,
      before: Object.keys(before).length ? before : undefined,
      after: Object.keys(after).length ? after : undefined,
    });

    return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
  } catch (error) {
    console.error('[API /admin/users/[id]] PATCH error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de mise à jour' }, { status: 500 }));
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  if (!sessionHasRole(session, ['ADMIN'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs.' },
      { status: 403 }
    ));
  }
  const { id } = await params;
  try {
    const existing = await db.adminUser.findUnique({ where: { id } });
    if (!existing) {
      return withSecurityHeaders(NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 }));
    }
    if (existing.email === session.email) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      ));
    }

    // Soft-delete: set active=false (preserve referential integrity for audit logs)
    const updated = await db.adminUser.update({
      where: { id },
      data: { active: false },
      select: { id: true, email: true, name: true, role: true, active: true },
    });

    await logAudit({
      request, session,
      action: 'DEACTIVATE_USER',
      entityType: 'AdminUser',
      entityId: updated.id,
      entitySlug: updated.email,
      before: { email: existing.email, role: existing.role, active: existing.active },
      after: { email: updated.email, role: updated.role, active: updated.active },
    });

    return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
  } catch (error) {
    console.error('[API /admin/users/[id]] DELETE error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de suppression' }, { status: 500 }));
  }
}
