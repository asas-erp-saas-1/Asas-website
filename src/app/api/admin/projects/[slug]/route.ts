import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

/** GET /api/admin/projects/[slug] */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdminAuth(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const { slug } = await params;
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        buildings: { orderBy: { order: 'asc' }, include: { _count: { select: { apartments: true } } } },
        apartments: {
          orderBy: { order: 'asc' },
          include: {
            building: { select: { id: true, name: true, code: true } },
            imagesRelation: { orderBy: { order: 'asc' } },
          },
        },
        imagesRelation: { orderBy: { order: 'asc' } },
        amenities: { orderBy: { name: 'asc' } },
        developer: true,
      },
    });
    if (!project) return withSecurityHeaders(NextResponse.json({ error: 'Project not found' }, { status: 404 }));
    return withSecurityHeaders(NextResponse.json({ data: project }));
  } catch (error) {
    console.error('[API /admin/projects/[slug]] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 }));
  }
}

/** PUT /api/admin/projects/[slug] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await verifyAdminAuth(request);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const { slug } = await params;
    const body = await request.json();
    const existing = await db.project.findUnique({ where: { slug } });
    if (!existing) return withSecurityHeaders(NextResponse.json({ error: 'Project not found' }, { status: 404 }));

    const validProjectStatuses = ['AVAILABLE', 'COMING_SOON', 'SOLD_OUT', 'DRAFT'];
    if (body.status && !validProjectStatuses.includes(body.status)) {
      return withSecurityHeaders(NextResponse.json({ error: `Invalid status. Valid values: ${validProjectStatuses.join(', ')}` }, { status: 400 }));
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'nameAr', 'tagline', 'taglineAr', 'description', 'descriptionAr', 'city', 'cityAr', 'district', 'districtAr', 'address', 'addressAr', 'latitude', 'longitude', 'projectType', 'status', 'apartmentTypes', 'minSurface', 'maxSurface', 'deliveryYear', 'deliveryQuarter', 'hasParking', 'hasElevator', 'hasGarden', 'hasPool', 'hasSecurity', 'hasClim', 'startingPrice', 'priceOnRequest', 'developerId', 'published', 'featured', 'order', 'seoTitle', 'seoDescription', 'seoKeywords', 'canonicalUrl', 'ogImage', 'robotsIndex'];
    for (const field of allowedFields) if (body[field] !== undefined) updateData[field] = body[field];

    const project = await db.project.update({ where: { id: existing.id }, data: updateData });
    const keyFields = ['name', 'status', 'published', 'featured', 'startingPrice', 'priceOnRequest'];
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    for (const f of keyFields) if (body[f] !== undefined) {
      before[f] = (existing as unknown as Record<string, unknown>)[f];
      after[f] = (project as unknown as Record<string, unknown>)[f];
    }
    const priceChanged = body.startingPrice !== undefined && body.startingPrice !== existing.startingPrice;
    await logAudit({ request, session, action: priceChanged ? 'PRICE_CHANGE' : 'UPDATE_PROJECT', entityType: 'Project', entityId: project.id, entitySlug: project.slug, before: Object.keys(before).length ? before : undefined, after: Object.keys(after).length ? after : undefined });
    return withSecurityHeaders(NextResponse.json({ data: project }));
  } catch (error) {
    console.error('[API /admin/projects/[slug]] PUT error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update project' }, { status: 500 }));
  }
}

/** DELETE /api/admin/projects/[slug] — archive, never hard-delete */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await verifyAdminAuth(request);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!sessionHasRole(session, ['ADMIN'])) return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants. Réservé aux administrateurs.' }, { status: 403 }));
  try {
    const { slug } = await params;
    const existing = await db.project.findUnique({ where: { slug } });
    if (!existing) return withSecurityHeaders(NextResponse.json({ error: 'Project not found' }, { status: 404 }));
    const project = await db.project.update({ where: { id: existing.id }, data: { archived: true, published: false } });
    await logAudit({ request, session, action: 'ARCHIVE_PROJECT', entityType: 'Project', entityId: project.id, entitySlug: project.slug, before: { name: existing.name, slug: existing.slug, published: existing.published, archived: existing.archived }, after: { name: project.name, slug: project.slug, published: project.published, archived: project.archived } });
    return withSecurityHeaders(NextResponse.json({ data: project }));
  } catch (error) {
    console.error('[API /admin/projects/[slug]] DELETE error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to archive project' }, { status: 500 }));
  }
}