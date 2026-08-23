import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toPublicApartmentCard } from '@/lib/catalog-mappers';
import type { PublicApartmentCard } from '@/lib/catalog-contracts';
import { withPublicCache } from '@/lib/with-security-headers';

/** Public apartment catalogue/search endpoint. Returns a lean public DTO, never a Prisma/domain record. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ids = searchParams.getAll('id').filter(Boolean);
    const projectSlug = searchParams.get('project') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minSurface = searchParams.get('minSurface');
    const maxSurface = searchParams.get('maxSurface');
    const bedrooms = searchParams.get('bedrooms');
    const status = searchParams.get('status') ?? undefined;
    const district = searchParams.get('district') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20));

    const where: Record<string, unknown> = { published: true, archived: false };
    if (ids.length) where.id = { in: ids };
    if (type) where.apartmentType = type;
    if (status) where.status = status;
    if (bedrooms) where.bedrooms = parseInt(bedrooms, 10);
    if (minPrice || maxPrice) {
      const price: { gte?: number; lte?: number } = {};
      if (minPrice) price.gte = parseInt(minPrice, 10);
      if (maxPrice) price.lte = parseInt(maxPrice, 10);
      where.price = price;
    }
    if (minSurface || maxSurface) {
      const surface: { gte?: number; lte?: number } = {};
      if (minSurface) surface.gte = parseInt(minSurface, 10);
      if (maxSurface) surface.lte = parseInt(maxSurface, 10);
      where.surface = surface;
    }
    if (projectSlug || district) {
      where.project = {
        published: true,
        archived: false,
        ...(projectSlug ? { slug: projectSlug } : {}),
        ...(district ? { district } : {}),
      };
    }

    const skip = (page - 1) * limit;
    const [apartments, total] = await Promise.all([
      db.apartment.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
        include: {
          building: true,
          project: { select: { id: true, slug: true, name: true, city: true, district: true, hasElevator: true, hasSecurity: true } },
        },
      }),
      db.apartment.count({ where }),
    ]);

    const data: PublicApartmentCard[] = apartments.map(toPublicApartmentCard);
    return withPublicCache(NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
  } catch (error) {
    console.error('[API /apartments] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 }));
  }
}
