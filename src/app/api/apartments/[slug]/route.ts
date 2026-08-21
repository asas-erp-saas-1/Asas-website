import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

function jsonString(value: unknown): string { if (value == null) return '[]'; if (typeof value === 'string') return value; try { return JSON.stringify(value); } catch { return '[]'; } }
function normalizeApartment<T extends Record<string, any>>(a: T) { return { ...a, rooms: jsonString(a.rooms), features: jsonString(a.features), featuresAr: jsonString(a.featuresAr), project: a.project ? { ...a.project, apartmentTypes: jsonString(a.project.apartmentTypes) } : a.project }; }

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });
    const apartment = await db.apartment.findUnique({ where: { slug }, include: {
      building: true,
      images: { orderBy: { order: 'asc' } },
      project: { include: { images: { orderBy: { order: 'asc' } }, amenities: { orderBy: { name: 'asc' } }, buildings: { orderBy: { order: 'asc' } } } },
    } });
    if (!apartment || !apartment.published || apartment.archived || !apartment.project?.published || apartment.project.archived) return withPublicCache(NextResponse.json({ error: 'Apartment not found' }, { status: 404 }));
    return withPublicCache(NextResponse.json(normalizeApartment(apartment)));
  } catch (error) {
    console.error('[API /apartments/[slug]] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json({ error: 'Failed to fetch apartment' }, { status: 500 }));
  }
}
