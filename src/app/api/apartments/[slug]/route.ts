import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });
    }

    const apartment = await db.apartment.findUnique({
      where: { slug },
      include: {
        building: true,
        images: {
          orderBy: { order: 'asc' },
        },
        project: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            amenities: {
              orderBy: { name: 'asc' },
            },
            buildings: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!apartment || !apartment.published || apartment.archived) {
      return withPublicCache(NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      ));
    }

    return withPublicCache(NextResponse.json(apartment));
  } catch (error) {
    console.error('[API /apartments/[slug]] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json(
      { error: 'Failed to fetch apartment' },
      { status: 500 }
    ));
  }
}
