import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const PROJECT_STATUSES = ['AVAILABLE', 'COMING_SOON', 'SOLD_OUT', 'DRAFT'] as const;

const optionalNullableString = z.string().trim().max(500).nullable().optional();
const optionalNullableText = z.string().max(10000).nullable().optional();

const projectUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  nameAr: optionalNullableString,
  tagline: optionalNullableString,
  taglineAr: optionalNullableString,
  description: optionalNullableText,
  descriptionAr: optionalNullableText,
  city: optionalNullableString,
  cityAr: optionalNullableString,
  district: optionalNullableString,
  districtAr: optionalNullableString,
  address: optionalNullableString,
  addressAr: optionalNullableString,
  latitude: z.number().finite().min(-90).max(90).nullable().optional(),
  longitude: z.number().finite().min(-180).max(180).nullable().optional(),
  projectType: z.string().trim().min(1).max(100).nullable().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  apartmentTypes: z.any().optional(),
  minSurface: z.number().int().nonnegative().nullable().optional(),
  maxSurface: z.number().int().nonnegative().nullable().optional(),
  deliveryYear: z.number().int().min(1900).max(2200).nullable().optional(),
  deliveryQuarter: z.string().trim().max(20).nullable().optional(),
  hasParking: z.boolean().nullable().optional(),
  hasElevator: z.boolean().nullable().optional(),
  hasGarden: z.boolean().nullable().optional(),
  hasPool: z.boolean().nullable().optional(),
  hasSecurity: z.boolean().nullable().optional(),
  hasClim: z.boolean().nullable().optional(),
  startingPrice: z.number().finite().nonnegative().nullable().optional(),
  priceOnRequest: z.boolean().nullable().optional(),
  developerId: z.string().uuid().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
  seoTitle: optionalNullableString,
  seoDescription: optionalNullableText,
  seoKeywords: optionalNullableText,
  canonicalUrl: z.string().trim().url().max(1000).nullable().optional(),
  ogImage: z.string().trim().max(1000).nullable().optional(),
  robotsIndex: z.boolean().optional(),
}).strict();

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
            imagesRelation: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }] },
          },
        },
        imagesRelation: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }] },
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
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' }, { status: 403 }));
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ error: 'Données de projet invalides', details: parsed.error.flatten() }, { status: 400 }));
    }

    const existing = await db.project.findUnique({ where: { slug } });
    if (!existing) return withSecurityHeaders(NextResponse.json({ error: 'Project not found' }, { status: 404 }));

    const updateData = parsed.data;
    if (updateData.published === true && existing.archived) {
      return withSecurityHeaders(NextResponse.json({ error: 'Un projet archivé ne peut pas être publié.' }, { status: 409 }));
    }

    const resultingMinSurface = updateData.minSurface !== undefined ? updateData.minSurface : existing.minSurface;
    const resultingMaxSurface = updateData.maxSurface !== undefined ? updateData.maxSurface : existing.maxSurface;
    if (resultingMinSurface !== null && resultingMaxSurface !== null && resultingMinSurface > resultingMaxSurface) {
      return withSecurityHeaders(NextResponse.json({ error: 'La surface minimale ne peut pas dépasser la surface maximale.' }, { status: 400 }));
    }

    const priceFieldsChanged = updateData.priceOnRequest !== undefined || updateData.startingPrice !== undefined;
    const resultingPriceOnRequest = updateData.priceOnRequest !== undefined ? updateData.priceOnRequest : existing.priceOnRequest;
    const resultingStartingPrice = updateData.startingPrice !== undefined ? updateData.startingPrice : existing.startingPrice;
    if (priceFieldsChanged && resultingPriceOnRequest !== true && resultingStartingPrice === null) {
      return withSecurityHeaders(NextResponse.json({ error: 'Un prix de départ ou l’option « prix sur demande » est requis.' }, { status: 400 }));
    }

    const project = await db.project.update({ where: { id: existing.id }, data: updateData });
    const keyFields = ['name', 'status', 'published', 'featured', 'startingPrice', 'priceOnRequest'];
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    for (const field of keyFields) {
      if (body[field] !== undefined) {
        before[field] = (existing as unknown as Record<string, unknown>)[field];
        after[field] = (project as unknown as Record<string, unknown>)[field];
      }
    }
    const priceChanged = body.startingPrice !== undefined && body.startingPrice !== existing.startingPrice;
    const publicationChanged = body.published !== undefined && body.published !== existing.published;
    const action = priceChanged ? 'PRICE_CHANGE' : publicationChanged ? (body.published ? 'PUBLISH_PROJECT' : 'UNPUBLISH_PROJECT') : 'UPDATE_PROJECT';
    await logAudit({
      request,
      session,
      action,
      entityType: 'Project',
      entityId: project.id,
      entitySlug: project.slug,
      before: Object.keys(before).length ? before : undefined,
      after: Object.keys(after).length ? after : undefined,
    });
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
