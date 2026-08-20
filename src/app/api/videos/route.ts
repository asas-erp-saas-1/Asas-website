import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

/**
 * GET /api/videos?projectId=...&apartmentId=...
 *   Returns only published videos for a given project or apartment.
 *   Public endpoint (no auth).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const apartmentId = searchParams.get('apartmentId');

  if (!projectId && !apartmentId) {
    return withPublicCache(NextResponse.json(
      { error: 'projectId ou apartmentId requis' },
      { status: 400 }
    ));
  }

  const where: { projectId?: string; apartmentId?: string; published: boolean } = { published: true };
  if (projectId) where.projectId = projectId;
  if (apartmentId) where.apartmentId = apartmentId;

  const data = await db.video.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      url: true,
      storagePath: true,
      thumbnailUrl: true,
      title: true,
      description: true,
      type: true,
      featured: true,
      order: true,
    },
  });
  return withPublicCache(NextResponse.json({ data }));
}
