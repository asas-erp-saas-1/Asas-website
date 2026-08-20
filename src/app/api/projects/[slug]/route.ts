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

    const project = await db.project.findUnique({
      where: { slug },
      include: {
        buildings: {
          orderBy: { order: 'asc' },
          include: {
            apartments: {
              where: {
                published: true,
                archived: false,
              },
              orderBy: { order: 'asc' },
              include: {
                images: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
        apartments: {
          where: {
            published: true,
            archived: false,
          },
          orderBy: { order: 'asc' },
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            building: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        amenities: {
          orderBy: { name: 'asc' },
        },
        developer: true,
      },
    });

    if (!project || !project.published || project.archived) {
      return withPublicCache(NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      ));
    }

    return withPublicCache(NextResponse.json(project));
  } catch (error) {
    console.error('[API /projects/[slug]] Failed to fetch project:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    ));
  }
}
