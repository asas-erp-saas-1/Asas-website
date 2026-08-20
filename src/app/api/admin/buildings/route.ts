import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

/**
 * GET /api/admin/buildings
 * List buildings (filter by projectId)
 *
 * Query params:
 *   projectId – filter by project ID
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('projectId') ?? undefined;

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const buildings = await db.building.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        project: {
          select: { id: true, slug: true, name: true },
        },
        _count: {
          select: { apartments: true },
        },
      },
    });

    const result = buildings.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      nameAr: b.nameAr,
      code: b.code,
      floors: b.floors,
      hasElevator: b.hasElevator,
      order: b.order,
      project: b.project,
      apartmentCount: b._count.apartments,
    }));

    return withSecurityHeaders(NextResponse.json({ data: result }));
  } catch (error) {
    console.error('[API /admin/buildings] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch buildings' },
      { status: 500 }
    ));
  }
}

/**
 * POST /api/admin/buildings
 * Create a new building
 * Authorization: ADMIN or EDITOR. VIEWER gets 403. Audit-logged.
 */
export async function POST(request: NextRequest) {
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
  try {
    const body = await request.json();

    if (!body.slug || !body.projectId || !body.name || !body.code || !body.floors) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Missing required fields: slug, projectId, name, code, floors' },
        { status: 400 }
      ));
    }

    const existing = await db.building.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'A building with this slug already exists' },
        { status: 409 }
      ));
    }

    const building = await db.building.create({
      data: {
        slug: body.slug,
        projectId: body.projectId,
        name: body.name,
        nameAr: body.nameAr ?? null,
        code: body.code,
        floors: body.floors,
        hasElevator: body.hasElevator ?? false,
        order: body.order ?? 0,
      },
    });

    // Audit log the creation.
    await logAudit({
      request,
      session,
      action: 'CREATE_BUILDING',
      entityType: 'Building',
      entityId: building.id,
      entitySlug: building.slug,
      before: null,
      after: { slug: building.slug, name: building.name, projectId: building.projectId, floors: building.floors },
    });

    return withSecurityHeaders(NextResponse.json({ data: building }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/buildings] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to create building' },
      { status: 500 }
    ));
  }
}
