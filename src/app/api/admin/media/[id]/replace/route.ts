import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { saveBlob, deleteBlob } from '@/lib/storage';

/**
 * POST /api/admin/media/[id]/replace
 * Replace the physical file for an existing media record.
 * KEEPS: media ID, metadata, entity relation, order, SEO metadata, caption, alt.
 * CHANGES: physical asset (file on disk) + url.
 * Records the change in audit log.
 */

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif',
};

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants.' }, { status: 403 }));
  }
  const { id } = await params;
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) return withSecurityHeaders(NextResponse.json({ error: 'Fichier manquant' }, { status: 400 }));
    const declaredMime = file.type;
    if (!ALLOWED_MIME[declaredMime]) return withSecurityHeaders(NextResponse.json({ error: `Type MIME non supporté: ${declaredMime}` }, { status: 415 }));
    if (file.size > MAX_SIZE) return withSecurityHeaders(NextResponse.json({ error: `Fichier trop volumineux. Max: 8 MB.` }, { status: 413 }));
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const ext = verifyMagicBytes(bytes, declaredMime);
    if (!ext) return withSecurityHeaders(NextResponse.json({ error: 'MIME mismatch' }, { status: 415 }));

    // Find existing media
    let existing = await db.projectImage.findUnique({ where: { id } });
    let kind: 'project' | 'apartment' = 'project';
    if (!existing) { existing = await db.apartmentImage.findUnique({ where: { id } }) as typeof existing; kind = 'apartment'; }
    if (!existing) return withSecurityHeaders(NextResponse.json({ error: 'Média introuvable' }, { status: 404 }));

    const oldUrl = existing.url;
    // Derive the new relative path from the old URL — this keeps the file
    // in the same folder/project slug, which preserves the directory layout.
    const lastSlash = oldUrl.lastIndexOf('/');
    const dirPrefix = oldUrl.substring(0, lastSlash + 1); // includes leading "/uploads/projects/slug/"
    const filename = `replaced-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const newRelativePath = dirPrefix.replace(/^\/uploads\//, '') + filename;
    const newPublicUrl = await saveBlob(bytes, newRelativePath, declaredMime);
    // Delete the old file (best-effort — jail-safe).
    await deleteBlob(oldUrl);
    // Update DB
    if (kind === 'project') await db.projectImage.update({ where: { id }, data: { url: newPublicUrl } });
    else await db.apartmentImage.update({ where: { id }, data: { url: newPublicUrl } });
    // Audit
    await logAudit({ request, session, action: 'UPDATE_MEDIA', entityType: kind === 'project' ? 'ProjectImage' : 'ApartmentImage', entityId: id, entitySlug: oldUrl, before: { url: oldUrl }, after: { url: newPublicUrl } });
    return withSecurityHeaders(NextResponse.json({ success: true, id, url: newPublicUrl }));
  } catch (error) {
    console.error('[API /admin/media/replace] error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec du remplacement' }, { status: 500 }));
  }
}

function verifyMagicBytes(bytes: Uint8Array, declaredMime: string): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return declaredMime === 'image/jpeg' ? 'jpg' : null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return declaredMime === 'image/png' ? 'png' : null;
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return declaredMime === 'image/gif' ? 'gif' : null;
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return declaredMime === 'image/webp' ? 'webp' : null;
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70 && ((bytes[8] === 0x61 && bytes[9] === 0x76 && bytes[10] === 0x69 && bytes[11] === 0x66) || (bytes[8] === 0x61 && bytes[9] === 0x76 && bytes[10] === 0x69 && bytes[11] === 0x73))) return declaredMime === 'image/avif' ? 'avif' : null;
  return null;
}
