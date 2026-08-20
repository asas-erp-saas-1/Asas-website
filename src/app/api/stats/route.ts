import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

export async function GET() {
  try {
    // Count published, non-archived projects
    const projectsCount = await db.project.count({
      where: { published: true, archived: false },
    });

    // Count published, non-archived apartments
    const apartmentsCount = await db.apartment.count({
      where: { published: true, archived: false },
    });

    // Count available apartments
    const availableCount = await db.apartment.count({
      where: {
        published: true,
        archived: false,
        status: 'AVAILABLE',
      },
    });

    // Count distinct cities among published projects
    const citiesResult = await db.project.findMany({
      where: { published: true, archived: false },
      select: { city: true },
      distinct: ['city'],
    });
    const citiesCount = citiesResult.length;

    // Count distinct districts among published projects
    const districtsResult = await db.project.findMany({
      where: { published: true, archived: false },
      select: { district: true },
      distinct: ['district'],
    });
    const districtsCount = districtsResult.length;

    const stats = {
      projectsCount,
      apartmentsCount,
      availableCount,
      citiesCount,
      districtsCount,
    };

    return withPublicCache(NextResponse.json(stats));
  } catch (error) {
    console.error('[API /stats] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    ));
  }
}
