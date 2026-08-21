import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

// Admin API routes are runtime-only. Never execute database reads during
// `next build`; DATABASE_URL is a runtime secret configured in Vercel.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/apartments/[slug]
 * Get single apartment with images and building
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const { slug } = await params;
    const apartment = await db.apartment.findUnique({
      where: { slug },
      include: {
        building: true,
        project: {
          select: {
            id: true,
            slug: true,
            name: true,
            city: true,
            district: true,
          },
        },
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!apartment) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      ));
    }

    return withSecurityHeaders(NextResponse.json({ data: apartment }));
  } catch (error) {
    console.error('[API /admin/apartments/[slug]] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch apartment' },
      { status: 500 }
    ));
  }
}

/**
 * PUT /api/admin/apartments/[slug]
 * Update apartment (status, price, description, features, published, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const { slug } = await params;
    const body = await request.json();

    const existing = await db.apartment.findUnique({ where: { slug } });
    if (!existing) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      ));
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'unitNumber', 'apartmentType', 'typeName', 'typeNameAr',
      'surface', 'floor', 'totalFloors', 'orientation',
      'bedrooms', 'bathrooms', 'balconies', 'balconySurface',
      'hasParking', 'parkingSpots', 'hasTerrace', 'terraceSurface',
      'hasGarden', 'gardenSurface',
      'status', 'price', 'priceOnRequest', 'paymentPlan', 'paymentPlanAr',
      'rooms', 'description', 'descriptionAr', 'features', 'featuresAr',
      'published', 'buildingId', 'order',
      'seoTitle', 'seoDescription', 'seoKeywords', 'canonicalUrl', 'ogImage', 'robotsIndex',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const apartment = await db.apartment.update({ where: { slug }, data: updateData });

    const keyFields = ['price', 'status', 'published', 'surface'];
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    for (const f of keyFields) {
      if (body[f] !== undefined) {
        before[f] = (existing as Record<string, unknown>)[f];
        after[f] = (apartment as Record<string, unknown>)[f];
      }
    }
    const priceChanged = body.price !== undefined && body.price !== existing.price;
    const statusChanged = body.status !== undefined && body.status !== existing.status;
    let action = 'UPDATE_APARTMENT';
    if (priceChanged) action = 'PRICE_CHANGE';
    else if (statusChanged) action = 'UPDATE_APARTMENT_STATUS';
    await logAudit({
      request, session,
      action,
      entityType: 'Apartment',
      entityId: apartment.id,
      entitySlug: apartment.slug,
      before: Object.keys(before).length ? before : undefined,
      after: Object.keys(after).length ? after : undefined,
    });

    return withSecurityHeaders(NextResponse.json({ data: apartment }));
  } catch (error) {
    console.error('[API /admin/apartments/[slug]] PUT error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to update apartment' },
      { status: 500 }
    ));
  }
}

/** DELETE /api/admin/apartments/[slug] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!sessionHasRole(session, ['ADMIN'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs.' }, { status: 403 }
    ));
  }
  try {
    const { slug } = await params;
    const existing = await db.apartment.findUnique({ where: { slug } });
    if (!existing) return withSecurityHeaders(NextResponse.json({ error: 'Apartment not found' }, { status: 404 }));
    const apartment = await db.apartment.update({
      where: { slug },
      data: { archived: true, published: false },
    });
    await logAudit({
      request, session,
      action: 'ARCHIVE_APARTMENT',
      entityType: 'Apartment',
      entityId: apartment.id,
      entitySlug: apartment.slug,
      before: { typeName: existing.typeName, slug: existing.slug, published: existing.published, archived: existing.archived },
      after: { typeName: apartment.typeName, slug: apartment.slug, published: apartment.published, archived: apartment.archived },
    });
    return withSecurityHeaders(NextResponse.json({ data: apartment }));
  } catch (error) {
    console.error('[API /admin/apartments/[slug]] DELETE error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to archive apartment' }, { status: 500 }));
  }
}
