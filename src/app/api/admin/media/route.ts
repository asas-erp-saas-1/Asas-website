import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';

/**
 * GET /api/admin/media
 * List all media (project + apartment images) with filtering.
 *
 * Query params:
 *   - projectId  : filter by project
 *   - apartmentId : filter by apartment
 *   - type      : filter by image type (hero, gallery, floor-plan, etc.)
 *   - q         : search alt text / caption
 *
 * Returns: { data: MediaItem[] }
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    ));
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const apartmentId = searchParams.get('apartmentId');
    const type = searchParams.get('type');
    const q = searchParams.get('q')?.trim();

    const projectWhere: Record<string, unknown> = {};
    if (projectId) projectWhere.projectId = projectId;
    if (type) projectWhere.type = type;
    if (q) {
      projectWhere.OR = [
        { alt: { contains: q } },
        { caption: { contains: q } },
      ];
    }

    const apartmentWhere: Record<string, unknown> = {};
    if (apartmentId) apartmentWhere.apartmentId = apartmentId;
    if (type) apartmentWhere.type = type;
    if (q) {
      apartmentWhere.OR = [
        { alt: { contains: q } },
        { caption: { contains: q } },
      ];
    }

    const [projectImages, apartmentImages] = await Promise.all([
      db.projectImage.findMany({
        where: projectWhere,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: { project: { select: { id: true, name: true, slug: true } } },
      }),
      db.apartmentImage.findMany({
        where: apartmentWhere,
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        include: {
          apartment: {
            select: {
              id: true, slug: true, typeName: true,
              project: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
    ]);

    // Normalize into a single list
    const data = [
      ...projectImages.map((img) => ({
        id: img.id,
        entity: 'project' as const,
        entityId: img.projectId,
        entityName: img.project?.name ?? null,
        entitySlug: img.project?.slug ?? null,
        url: img.url,
        alt: img.alt ?? '',
        caption: img.caption ?? '',
        type: img.type,
        order: img.order,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
      })),
      ...apartmentImages.map((img) => ({
        id: img.id,
        entity: 'apartment' as const,
        entityId: img.apartmentId,
        entityName: img.apartment
          ? `${img.apartment.typeName}${img.apartment.project ? ` (${img.apartment.project.name})` : ''}`
          : null,
        entitySlug: img.apartment?.slug ?? null,
        url: img.url,
        alt: img.alt ?? '',
        caption: img.caption ?? '',
        type: img.type,
        order: img.order,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
      })),
    ];

    // Sort: most recently created first
    data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return withSecurityHeaders(NextResponse.json({ data, total: data.length }));
  } catch (error) {
    console.error('[API /admin/media] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Échec de récupération des médias' },
      { status: 500 }
    ));
  }
}
