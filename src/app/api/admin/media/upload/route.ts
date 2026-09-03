import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { sessionHasRole, verifyAdminAuth } from '@/lib/admin-auth';
import { saveBlob, deleteBlob } from '@/lib/storage';
import { withSecurityHeaders } from '@/lib/with-security-headers';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_ALT_LENGTH = 500;
const MAX_CAPTION_LENGTH = 1000;
const MEDIA_TYPES = new Set(['hero', 'gallery', 'floor-plan', '3d-plan', 'render', 'interior', 'exterior', 'amenity']);
const MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

type EntityType = 'project' | 'apartment';

function errorResponse(message: string, status: number) {
  return withSecurityHeaders(NextResponse.json({ error: message }, { status }));
}

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'entity';
}

function extensionForMime(mime: string) {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/avif': return 'avif';
    case 'image/gif': return 'gif';
    default: return null;
  }
}

function magicBytesMatch(bytes: Uint8Array, mime: string) {
  const ascii = (start: number, length: number) => new TextDecoder().decode(bytes.slice(start, start + length));
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  if (mime === 'image/webp') return bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
  if (mime === 'image/gif') return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a';
  if (mime === 'image/avif') return bytes.length >= 12 && ascii(4, 4) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 4));
  return false;
}

async function getEntity(entityType: EntityType, entityId: string) {
  if (entityType === 'project') {
    return db.project.findUnique({ where: { id: entityId }, select: { id: true, slug: true, name: true } });
  }
  return db.apartment.findUnique({ where: { id: entityId }, select: { id: true, slug: true, typeName: true } });
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) return errorResponse('Non autorisé', 401);
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) return errorResponse('Privilèges insuffisants', 403);

  try {
    const formData = await request.formData();
    const fileValue = formData.get('file');
    const entityTypeValue = formData.get('entityType');
    const entityIdValue = formData.get('entityId');
    const typeValue = formData.get('type');
    const altValue = formData.get('alt');
    const captionValue = formData.get('caption');

    if (!(fileValue instanceof File)) return errorResponse('Aucun fichier valide fourni', 400);
    if (entityTypeValue !== 'project' && entityTypeValue !== 'apartment') return errorResponse('Cible média invalide', 400);
    if (typeof entityIdValue !== 'string' || !entityIdValue.trim()) return errorResponse('Cible média manquante', 400);
    if (typeof typeValue !== 'string' || !MEDIA_TYPES.has(typeValue)) return errorResponse('Type de média non supporté', 400);
    if (typeof altValue !== 'string' || !altValue.trim()) return errorResponse('Le texte alt est obligatoire', 400);
    if (altValue.trim().length > MAX_ALT_LENGTH) return errorResponse(`Le texte alt ne peut pas dépasser ${MAX_ALT_LENGTH} caractères`, 400);
    if (typeof captionValue !== 'string') return errorResponse('Légende invalide', 400);
    if (captionValue.length > MAX_CAPTION_LENGTH) return errorResponse(`La légende ne peut pas dépasser ${MAX_CAPTION_LENGTH} caractères`, 400);
    if (!MIME_TYPES.has(fileValue.type)) return errorResponse('Type MIME non supporté', 415);
    if (fileValue.size <= 0) return errorResponse('Le fichier est vide', 400);
    if (fileValue.size > MAX_FILE_SIZE) return errorResponse('Le fichier dépasse la limite de 8 Mo', 413);

    const entityType = entityTypeValue as EntityType;
    const entityId = entityIdValue.trim();
    const entity = await getEntity(entityType, entityId);
    if (!entity) return errorResponse(entityType === 'project' ? 'Projet introuvable' : 'Appartement introuvable', 404);

    const extension = extensionForMime(fileValue.type);
    if (!extension) return errorResponse('Extension de média non supportée', 415);

    const bytes = new Uint8Array(await fileValue.arrayBuffer());
    if (!magicBytesMatch(bytes, fileValue.type)) return errorResponse('Le contenu du fichier ne correspond pas à son type déclaré', 415);

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(bytes, { failOn: 'error' }).metadata();
    } catch {
      return errorResponse('Le fichier image est illisible ou corrompu', 415);
    }
    if (!metadata.format || !['jpeg', 'png', 'webp', 'avif', 'gif'].includes(metadata.format)) return errorResponse('Format image non supporté', 415);

    const slug = safeSlug(entity.slug);
    const timestamp = Date.now();
    const random = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const relativePath = `${entityType}s/${slug}/${slug}-${typeValue}-${timestamp}-${random}.${extension}`;

    const maxOrder = entityType === 'project'
      ? await db.projectImage.aggregate({ where: { projectId: entity.id }, _max: { order: true } })
      : await db.apartmentImage.aggregate({ where: { apartmentId: entity.id }, _max: { order: true } });
    const order = (maxOrder._max.order ?? -1) + 1;

    const publicUrl = await saveBlob(bytes, relativePath, fileValue.type);
    try {
      const created = entityType === 'project'
        ? await db.projectImage.create({
            data: { projectId: entity.id, url: publicUrl, alt: altValue.trim(), caption: captionValue.trim() || null, type: typeValue, order, width: metadata.width ?? null, height: metadata.height ?? null },
            select: { id: true, url: true, alt: true, caption: true, type: true, order: true, width: true, height: true, createdAt: true },
          })
        : await db.apartmentImage.create({
            data: { apartmentId: entity.id, url: publicUrl, alt: altValue.trim(), caption: captionValue.trim() || null, type: typeValue, order, width: metadata.width ?? null, height: metadata.height ?? null },
            select: { id: true, url: true, alt: true, caption: true, type: true, order: true, width: true, height: true, createdAt: true },
          });

      await logAudit({ request, session, action: 'media.upload', entityType: entityType === 'project' ? 'ProjectImage' : 'ApartmentImage', entityId: created.id, before: null, after: { entityId: entity.id, type: created.type, alt: created.alt, width: created.width, height: created.height } });
      return withSecurityHeaders(NextResponse.json({ data: { ...created, entity: entityType, entityId: entity.id, entityName: 'name' in entity ? entity.name : entity.typeName, entitySlug: entity.slug } }, { status: 201 }));
    } catch (error) {
      await deleteBlob(publicUrl);
      throw error;
    }
  } catch (error) {
    console.error('[API /admin/media/upload] POST error:', error instanceof Error ? error.message : error);
    return errorResponse('Échec du téléversement du média', 500);
  }
}
