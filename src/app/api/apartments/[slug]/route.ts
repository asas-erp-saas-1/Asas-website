import { NextRequest, NextResponse } from 'next/server';
import { withPublicCache } from '@/lib/with-security-headers';
import { getPublicApartment } from '@/lib/catalog-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });

    const apartment = await getPublicApartment(slug);
    if (!apartment) {
      return withPublicCache(NextResponse.json({ error: 'Apartment not found' }, { status: 404 }));
    }

    return withPublicCache(NextResponse.json(apartment));
  } catch (error) {
    console.error('[API /apartments/[slug]] Error:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json({ error: 'Failed to fetch apartment' }, { status: 500 }));
  }
}
