import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';
import { toPublicApartmentDetail } from '@/lib/catalog-mappers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });

    const apartment = await db.apartment.findUnique({
      where: { slug },
      include: {
        building: true,
        images: { orderBy: { order: 'asc' } },
        project: {
          select: {
            id: true,
            slug: true,
            name: true,
            city: true,
            district: true,
            hasElevator: true,
            hasSecurity: true,
            published: true,
            archived: true,
          },
        },
      },
    });

    if (
      !apartment ||
      !apartment.published ||
      apartment.archived ||
      !apartment.project ||
      !apartment.project.published ||
      apartment.project.archived
    ) {
      return withPublicCache(
        NextResponse.json({ error: 'Apartment not found' }, { status: 404 }),
      );
    }

    return withPublicCache(
      NextResponse.json(toPublicApartmentDetail(apartment as unknown as Record<string, unknown>)),
    );
  } catch (error) {
    console.error('[API /apartments/[slug]] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(
      NextResponse.json({ error: 'Failed to fetch apartment' }, { status: 500 }),
    );
  }
}
