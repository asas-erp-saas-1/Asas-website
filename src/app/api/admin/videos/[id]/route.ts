import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from "@/lib/admin-auth";
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

/**
 * /api/admin/videos/[id]
 *   PATCH  - update video fields. ADMIN/EDITOR only. Audit-logged.
 *   DELETE - remove video. ADMIN only. Audit-logged.
 */

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  type: z.enum(['HERO', 'GALLERY', 'WALKTHROUGH', 'INTERVIEW']).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' },
      { status: 403 },
    ));
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      ));
    }
    // Snapshot the BEFORE state for audit (only fields in the schema).
    const before = await db.video.findUnique({ where: { id } });
    if (!before) {
      return withSecurityHeaders(NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 }));
    }
    const updated = await db.video.update({ where: { id }, data: parsed.data });
    await logAudit({
      request, session,
      action: 'UPDATE_VIDEO',
      entityType: 'Video',
      entityId: id,
      entitySlug: before.url ?? undefined,
      before: { title: before.title, type: before.type, featured: before.featured, published: before.published },
      after: { title: updated.title, type: updated.type, featured: updated.featured, published: updated.published },
    });
    return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
  } catch (error) {
    console.error('[API /admin/videos/[id]] PATCH error:', error instanceof Error ? error.message : error);
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
    const before = await db.video.findUnique({ where: { id } });
    if (!before) {
      return withSecurityHeaders(NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 }));
    }
    await db.video.delete({ where: { id } });
    await logAudit({
      request, session,
      action: 'DELETE_VIDEO',
      entityType: 'Video',
      entityId: id,
      entitySlug: before.url ?? undefined,
      before: { title: before.title, projectId: before.projectId, apartmentId: before.apartmentId, url: before.url },
    });
    return withSecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('[API /admin/videos/[id]] DELETE error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de suppression' }, { status: 500 }));
  }
}
