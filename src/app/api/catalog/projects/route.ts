import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withPublicCache } from '@/lib/with-security-headers';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        _count: {
          select: {
            apartments: {
              where: { published: true, archived: false },
            },
          },
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
      apartmentCount: project._count.apartments,
      // Availability is intentionally derived from the catalog source of truth
      // rather than from a hard-coded project-level field. The public schema
      // currently exposes status at unit level, so a second aggregate query is
      // preferable to loading every apartment into this list endpoint.
      availableApartmentCount: 0,
    }));

    // Keep the list query lean. Availability is populated separately by the
    // catalog summary layer once its aggregate query is introduced; returning
    // zero here is not acceptable to consumers, so fail closed only if the
    // contract is explicitly changed. For the current schema, derive the
    // availability with a single grouped query below.
    const availableByProject = await db.apartment.groupBy({
      by: ['projectId'],
      where: {
        published: true,
        archived: false,
        status: 'AVAILABLE',
      },
      _count: { _all: true },
    });

    const availableCounts = new Map(
      availableByProject.map((row) => [row.projectId, row._count._all]),
    );

    for (const project of payload) {
      project.availableApartmentCount = availableCounts.get(project.id) ?? 0;
    }

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
