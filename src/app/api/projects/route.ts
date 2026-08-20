import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';

export async function GET() {
  try {
    const projects = await db.project.findMany({
      where: {
        published: true,
        archived: false,
      },
      orderBy: { order: 'asc' },
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

    return withPublicCache(NextResponse.json(projects));
  } catch (error) {
    console.error('[API /projects] Failed to fetch projects:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    ));
  }
}
