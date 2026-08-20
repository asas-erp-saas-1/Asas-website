import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

/**
 * GET /api/apartments
 *
 * Query params:
 *   project     – filter by project slug
 *   type        – filter by apartmentType (F2, F3, F4, F5, Duplex, Studio, Villa)
 *   minPrice    – minimum price (inclusive)
 *   maxPrice    – maximum price (inclusive)
 *   minSurface  – minimum surface in m² (inclusive)
 *   maxSurface  – maximum surface in m² (inclusive)
 *   bedrooms    – exact number of bedrooms
 *   status      – filter by status (AVAILABLE, RESERVED, SOLD, COMING_SOON, OFF_MARKET)
 *   district    – filter by project district
 *   page        – page number (default 1)
 *   limit       – items per page (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const projectSlug = searchParams.get('project') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minSurface = searchParams.get('minSurface');
    const maxSurface = searchParams.get('maxSurface');
    const bedrooms = searchParams.get('bedrooms');
    const status = searchParams.get('status') ?? undefined;
    const district = searchParams.get('district') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    // Build the where clause dynamically based on filters
    const where: Record<string, unknown> = {
      published: true,
      archived: false,
    };

    if (type) where.apartmentType = type;
    if (status) where.status = status;
    if (bedrooms) where.bedrooms = parseInt(bedrooms, 10);

    // Price range
    if (minPrice || maxPrice) {
      const priceFilter: { gte?: number; lte?: number } = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice, 10);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice, 10);
      where.price = priceFilter;
    }

    // Surface range
    if (minSurface || maxSurface) {
      const surfaceFilter: { gte?: number; lte?: number } = {};
      if (minSurface) surfaceFilter.gte = parseInt(minSurface, 10);
      if (maxSurface) surfaceFilter.lte = parseInt(maxSurface, 10);
      where.surface = surfaceFilter;
    }

    // Project-related filters (project slug or district)
    if (projectSlug || district) {
      const projectFilter: { published: boolean; archived: boolean; slug?: string; district?: string } = {
        published: true,
        archived: false,
      };
      if (projectSlug) projectFilter.slug = projectSlug;
      if (district) projectFilter.district = district;
      where.project = projectFilter;
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
          images: {
            orderBy: { order: 'asc' },
          },
          project: {
            select: {
              id: true,
              slug: true,
              name: true,
              nameAr: true,
              city: true,
              cityAr: true,
              district: true,
              districtAr: true,
              startingPrice: true,
              priceOnRequest: true,
            },
          },
        },
      }),
      db.apartment.count({ where }),
    ]);

    return withPublicCache(NextResponse.json({
      data: apartments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }));
  } catch (error) {
    console.error('[API /apartments] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    ));
  }
}
