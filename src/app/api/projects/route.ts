import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

function jsonString(value: unknown): string {
  if (value == null) return '[]';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return '[]'; }
}

function normalizeApartment<T extends Record<string, unknown>>(apartment: T) {
  return {
    ...apartment,
    rooms: jsonString(apartment.rooms),
    features: jsonString(apartment.features),
    featuresAr: jsonString(apartment.featuresAr),
  };
}

function normalizeProject<T extends Record<string, any>>(project: T) {
  return {
    ...project,
    // Prisma returns Json columns as native arrays/objects. The existing UI
    // contract expects serialized JSON strings, so normalize at the API boundary.
    apartmentTypes: jsonString(project.apartmentTypes),
    apartments: (project.apartments ?? []).map(normalizeApartment),
    buildings: (project.buildings ?? []).map((building: any) => ({
      ...building,
      apartments: (building.apartments ?? []).map(normalizeApartment),
    })),
  };
}

export async function GET() {
  try {
    const projects = await db.project.findMany({
      where: { published: true, archived: false },
      orderBy: { order: 'asc' },
      include: {
        buildings: {
          orderBy: { order: 'asc' },
          include: {
            apartments: {
              where: { published: true, archived: false },
              orderBy: { order: 'asc' },
              include: { images: { orderBy: { order: 'asc' } } },
            },
          },
        },
        apartments: {
          where: { published: true, archived: false },
          orderBy: { order: 'asc' },
          include: { images: { orderBy: { order: 'asc' } } },
        },
        images: { orderBy: { order: 'asc' } },
        amenities: { orderBy: { name: 'asc' } },
        developer: true,
      },
    });

    return withPublicCache(NextResponse.json(projects.map(normalizeProject)));
  } catch (error) {
    console.error('[API /projects] Failed to fetch projects:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    ));
  }
}
