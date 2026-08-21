import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

export async function GET() {
  try {
    const projects = await db.project.findMany({
      where: { published: true, archived: false },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        city: true,
        district: true,
        projectType: true,
        status: true,
        latitude: true,
        longitude: true,
        startingPrice: true,
        priceOnRequest: true,
        minSurface: true,
        maxSurface: true,
        hasParking: true,
        hasElevator: true,
        hasGarden: true,
        hasPool: true,
        featured: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { id: true, url: true, alt: true, type: true },
        },
        apartments: {
          where: { published: true, archived: false },
          select: { id: true, status: true },
        },
      },
    });

    const payload: PublicProjectCard[] = projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      name: project.name,
      tagline: project.tagline ?? undefined,
      city: project.city,
      district: project.district,
      projectType: project.projectType,
      status: project.status,
      latitude: project.latitude ?? undefined,
      longitude: project.longitude ?? undefined,
      startingPrice: project.startingPrice ?? undefined,
      priceOnRequest: project.priceOnRequest,
      minSurface: project.minSurface ?? undefined,
      maxSurface: project.maxSurface ?? undefined,
      hasParking: project.hasParking,
      hasElevator: project.hasElevator,
      hasGarden: project.hasGarden,
      hasPool: project.hasPool,
      featured: project.featured,
      image: project.images[0]
        ? {
            id: project.images[0].id,
            url: project.images[0].url,
            alt: project.images[0].alt ?? undefined,
            type: project.images[0].type,
          }
        : undefined,
      apartmentCount: project.apartments.length,
      availableApartmentCount: project.apartments.filter((a) => a.status === 'AVAILABLE').length,
    }));

    return withPublicCache(NextResponse.json(payload));
  } catch (error) {
    console.error('[API /catalog/projects] Failed to fetch catalog:', error instanceof Error ? error.message : error);
    return withPublicCache(NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 }));
  }
}
