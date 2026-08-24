import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('projectId') ?? undefined;
    const projectSlug = searchParams.get('projectSlug') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const publishedStr = searchParams.get('published');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const where: Record<string, unknown> = { archived: false };
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (type) where.apartmentType = type;
    if (publishedStr) where.published = publishedStr === 'true';
    if (projectSlug) where.project = { slug: projectSlug };
    const skip = (page - 1) * limit;
    const [apartments, total] = await Promise.all([
      db.apartment.findMany({
        where, orderBy: { order: 'asc' }, skip, take: limit,
        include: {
          building: { select: { id: true, name: true, code: true } },
          project: { select: { id: true, slug: true, name: true, district: true, city: true } },
          imagesRelation: { where: { type: 'hero' }, take: 1 },
        },
      }),
      db.apartment.count({ where }),
    ]);
    const result = apartments.map((a) => ({
      id: a.id, slug: a.slug, apartmentNumber: a.apartmentNumber, unitNumber: a.unitNumber,
      apartmentType: a.apartmentType, typeName: a.typeName, surface: a.surface, floor: a.floor,
      orientation: a.orientation, bedrooms: a.bedrooms, bathrooms: a.bathrooms,
      hasParking: a.hasParking ?? a.parking, parkingSpots: a.parkingSpots, status: a.status,
      price: a.price, priceOnRequest: a.priceOnRequest, published: a.published, order: a.order,
      building: a.building, project: a.project, heroImage: a.imagesRelation[0]?.url ?? null,
      createdAt: a.createdAt, updatedAt: a.updatedAt,
    }));
    return withSecurityHeaders(NextResponse.json({ data: result, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
  } catch (error) {
    console.error('[API /admin/apartments] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 }));
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' }, { status: 403 }));
  try {
    const body = await request.json();
    if (!body.slug || !body.projectId || !body.apartmentNumber || !body.typeName || body.surface == null || body.bedrooms === undefined) {
      return withSecurityHeaders(NextResponse.json({ error: 'Missing required fields: slug, projectId, apartmentNumber, typeName, surface, bedrooms' }, { status: 400 }));
    }
    const existing = await db.apartment.findFirst({ where: { projectId: body.projectId, slug: body.slug } });
    if (existing) return withSecurityHeaders(NextResponse.json({ error: 'An apartment with this slug already exists in this project' }, { status: 409 }));
    const apartment = await db.apartment.create({
      data: {
        slug: body.slug, projectId: body.projectId, apartmentNumber: body.apartmentNumber,
        buildingId: body.buildingId ?? null, unitNumber: body.unitNumber ?? null,
        apartmentType: body.apartmentType ?? 'F3', typeName: body.typeName, typeNameAr: body.typeNameAr ?? null,
        surface: body.surface, floor: body.floor ?? null, totalFloors: body.totalFloors ?? null,
        orientation: body.orientation ?? null, bedrooms: body.bedrooms, bathrooms: body.bathrooms ?? null,
        balconies: body.balconies ?? null, balconySurface: body.balconySurface ?? null,
        hasParking: body.hasParking ?? false, parkingSpots: body.parkingSpots ?? null,
        hasTerrace: body.hasTerrace ?? false, terraceSurface: body.terraceSurface ?? null,
        hasGarden: body.hasGarden ?? false, gardenSurface: body.gardenSurface ?? null,
        status: body.status ? String(body.status).toUpperCase() : 'AVAILABLE',
        price: body.price ?? null, priceOnRequest: body.priceOnRequest ?? false,
        paymentPlan: body.paymentPlan ?? null, paymentPlanAr: body.paymentPlanAr ?? null,
        rooms: body.rooms ?? null, description: body.description ?? null, descriptionAr: body.descriptionAr ?? null,
        features: body.features ?? null, featuresAr: body.featuresAr ?? null,
        published: body.published ?? false, order: body.order ?? 0,
      },
    });
    return withSecurityHeaders(NextResponse.json({ data: apartment }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/apartments] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create apartment' }, { status: 500 }));
  }
}