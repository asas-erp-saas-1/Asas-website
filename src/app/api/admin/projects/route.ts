import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

/**
 * GET /api/admin/projects
 * List all projects (including DRAFT/unpublished) with apartment counts
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const projects = await db.project.findMany({
      where: { archived: false },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { apartments: true },
        },
        developer: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          where: { type: 'hero' },
          take: 1,
        },
      },
    });

    const result = projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      nameAr: p.nameAr,
      city: p.city,
      district: p.district,
      projectType: p.projectType,
      status: p.status,
      published: p.published,
      featured: p.featured,
      startingPrice: p.startingPrice,
      priceOnRequest: p.priceOnRequest,
      deliveryYear: p.deliveryYear,
      deliveryQuarter: p.deliveryQuarter,
      apartmentCount: p._count.apartments,
      heroImage: p.images[0]?.url ?? null,
      developer: p.developer,
      order: p.order,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return withSecurityHeaders(NextResponse.json({ data: result }));
  } catch (error) {
    console.error('[API /admin/projects] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    ));
  }
}

/**
 * POST /api/admin/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  // VIEWER cannot create projects
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' },
      { status: 403 }
    ));
  }
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.city || !body.district) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Missing required fields: name, slug, city, district' },
        { status: 400 }
      ));
    }

    // Check slug uniqueness
    const existing = await db.project.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 409 }
      ));
    }

    const project = await db.project.create({
      data: {
        slug: body.slug,
        name: body.name,
        nameAr: body.nameAr ?? null,
        tagline: body.tagline ?? null,
        taglineAr: body.taglineAr ?? null,
        description: body.description ?? null,
        descriptionAr: body.descriptionAr ?? null,
        city: body.city,
        cityAr: body.cityAr ?? null,
        district: body.district,
        districtAr: body.districtAr ?? null,
        address: body.address ?? null,
        addressAr: body.addressAr ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        projectType: body.projectType ?? 'RESIDENTIAL',
        status: body.status ?? 'DRAFT',
        apartmentTypes: body.apartmentTypes ?? '[]',
        minSurface: body.minSurface ?? null,
        maxSurface: body.maxSurface ?? null,
        deliveryYear: body.deliveryYear ?? null,
        deliveryQuarter: body.deliveryQuarter ?? null,
        hasParking: body.hasParking ?? false,
        hasElevator: body.hasElevator ?? false,
        hasGarden: body.hasGarden ?? false,
        hasPool: body.hasPool ?? false,
        hasSecurity: body.hasSecurity ?? false,
        hasClim: body.hasClim ?? false,
        startingPrice: body.startingPrice ?? null,
        priceOnRequest: body.priceOnRequest ?? false,
        developerId: body.developerId ?? null,
        published: body.published ?? false,
        featured: body.featured ?? false,
        order: body.order ?? 0,
      },
    });

    // Audit log
    await logAudit({
      request, session,
      action: 'CREATE_PROJECT',
      entityType: 'Project',
      entityId: project.id,
      entitySlug: project.slug,
      after: { name: project.name, slug: project.slug, status: project.status, published: project.published },
    });

    return withSecurityHeaders(NextResponse.json({ data: project }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/projects] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    ));
  }
}
