import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from "@/lib/admin-auth";
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { deleteBlob } from '@/lib/storage';

/**
 * /api/admin/media/[id]
 *
 * GET    - fetch a single media item (by id, both project + apartment tables)
 * PATCH  - update alt, caption, type, order. ADMIN/EDITOR only. Audit-logged.
 * DELETE - delete the media row + remove the file from disk. ADMIN only.
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function findMedia(id: string) {
  const projectImg = await db.projectImage.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true, slug: true } } },
  });
  if (projectImg) {
    return { kind: 'project' as const, img: projectImg };
  }
  const aptImg = await db.apartmentImage.findUnique({
    where: { id },
    include: {
      apartment: {
        select: {
          id: true, slug: true, typeName: true,
          project: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
  if (aptImg) {
    return { kind: 'apartment' as const, img: aptImg };
  }
  return null;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminAuth(request))) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  const { id } = await params;
  const found = await findMedia(id);
  if (!found) {
    return withSecurityHeaders(NextResponse.json({ error: 'Média introuvable' }, { status: 404 }));
  }
  return withSecurityHeaders(NextResponse.json({ data: found }));
}

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
  const body = await request.json().catch(() => ({}));

  const found = await findMedia(id);
  if (!found) {
    return withSecurityHeaders(NextResponse.json({ error: 'Média introuvable' }, { status: 404 }));
  }

  // Build update payload — only whitelisted fields are accepted.
  const data: Record<string, unknown> = {};
  if (typeof body.alt === 'string') data.alt = body.alt || null;
  if (typeof body.caption === 'string') data.caption = body.caption || null;
  if (typeof body.type === 'string' && body.type) data.type = body.type;
  if (typeof body.order === 'number') data.order = body.order;

  try {
    // Snapshot the BEFORE state for audit.
    const before = {
      alt: found.img.alt,
      caption: found.img.caption,
      type: found.img.type,
      order: found.img.order,
    };

    if (found.kind === 'project') {
      const updated = await db.projectImage.update({ where: { id }, data });
      await logAudit({
        request, session,
        action: 'UPDATE_MEDIA',
        entityType: 'ProjectImage',
        entityId: id,
        entitySlug: found.img.url,
        before,
        after: { alt: updated.alt, caption: updated.caption, type: updated.type, order: updated.order },
      });
      return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
    } else {
      const updated = await db.apartmentImage.update({ where: { id }, data });
      await logAudit({
        request, session,
        action: 'UPDATE_MEDIA',
        entityType: 'ApartmentImage',
        entityId: id,
        entitySlug: found.img.url,
        before,
        after: { alt: updated.alt, caption: updated.caption, type: updated.type, order: updated.order },
      });
      return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
    }
  } catch (error) {
    console.error('[API /admin/media/[id]] PATCH error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 }));
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
  const found = await findMedia(id);
  if (!found) {
    return withSecurityHeaders(NextResponse.json({ error: 'Média introuvable' }, { status: 404 }));
  }

  try {
    // Remove file from storage (best-effort — DB row is the source of truth).
    // deleteBlob() is jail-safe: it will refuse to delete anything outside
    // /public/uploads.
    await deleteBlob(found.img.url);
    // Audit log BEFORE deleting the row (need before values)
    await logAudit({
      request, session,
      action: 'DELETE_MEDIA',
      entityType: found.kind === 'project' ? 'ProjectImage' : 'ApartmentImage',
      entityId: id,
      entitySlug: found.img.url,
      before: { url: found.img.url, type: found.img.type, alt: found.img.alt },
    });
    // Delete the DB row
    if (found.kind === 'project') {
      await db.projectImage.delete({ where: { id } });
    } else {
      await db.apartmentImage.delete({ where: { id } });
    }
    return withSecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('[API /admin/media/[id]] DELETE error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de la suppression' }, { status: 500 }));
  }
}
