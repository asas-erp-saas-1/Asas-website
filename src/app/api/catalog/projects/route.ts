import { NextResponse } from 'next/server';
import { getPublicProjectCards } from '@/lib/catalog-server';
import { withPublicCache } from '@/lib/with-security-headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPublicProjectCards();
    return withPublicCache(NextResponse.json(payload));
  } catch (error) {
    console.error(
      '[API /catalog/projects] Failed to fetch catalog:',
      error instanceof Error ? error.message : error,
    );
    return withPublicCache(
      NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 }),
    );
  }
}
