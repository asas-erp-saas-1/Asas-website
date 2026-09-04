import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('projectId') ?? undefined;
    const search = searchParams.get('search')?.trim() ?? '';
    const rawPage = Number(searchParams.get('page') ?? '1');
    const rawLimit = Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT));
    const page = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
    const limit = Number.isSafeInteger(rawLimit) && rawLimit >= 1 ? Math.min(MAX_LIMIT, rawLimit) : DEFAULT_LIMIT;

    const where = {
      ...(projectId ? { projectId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { nameAr: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
              { project: { name: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const total = await db.building.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const effectivePage = Math.min(page, totalPages);

    const buildings = await db.building.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }, { id: 'asc' }],
        skip: (effectivePage - 1) * limit,
        take: limit,
        include: {
          project: { select: { id: true, slug: true, name: true } },
          _count: { select: { apartments: true } },
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

    return withSecurityHeaders(
      NextResponse.json({
        data: result,
        meta: { page: effectivePage, limit, total, totalPages },
      }),
    );
  } catch (error) {
    console.error('[API /admin/buildings] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 }));
  }
}

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
        { status: 400 },
      ));
    }

    const existing = await db.building.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'A building with this slug already exists' },
        { status: 409 },
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
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create building' }, { status: 500 }));
  }
}
