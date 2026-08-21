import 'server-only';

import { db } from '@/lib/db';
import type {
  PublicApartmentDetail,
  PublicProjectCard,
  PublicProjectDetail,
} from '@/lib/catalog-contracts';
import {
  toPublicApartmentDetail,
  toPublicProjectCard,
  toPublicProjectDetail,
} from '@/lib/catalog-mappers';

/**
 * Server-only public catalog access.
 *
 * Publication rules live here so Server Components and API routes consume the
 * same source of truth. Prisma/domain objects are mapped before crossing the
 * server boundary.
 */
export async function getPublicProjectCards(): Promise<PublicProjectCard[]> {
  const projects = await db.project.findMany({
    where: { published: true, archived: false },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { name: 'asc' }],
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
      deliveryYear: true,
      deliveryQuarter: true,
      apartmentTypes: true,
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
          apartments: { where: { published: true, archived: false } },
        },
      },
    },
  });

  const availableByProject = await db.apartment.groupBy({
    by: ['projectId', 'status'],
    where: { published: true, archived: false },
    _count: { _all: true },
  });

  const counts = new Map<string, { available: number; reserved: number }>();
  for (const row of availableByProject) {
    const current = counts.get(row.projectId) ?? { available: 0, reserved: 0 };
    if (row.status === 'AVAILABLE' || row.status === 'COMING_SOON') current.available += row._count._all;
    if (row.status === 'RESERVED') current.reserved += row._count._all;
    counts.set(row.projectId, current);
  }

  return projects.map((project) =>
    toPublicProjectCard(project, counts.get(project.id) ?? { available: 0, reserved: 0 }),
  );
}

export async function getPublicProject(slug: string): Promise<PublicProjectDetail | null> {
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      buildings: { orderBy: { order: 'asc' } },
      apartments: {
        where: { published: true, archived: false },
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } }, building: true },
      },
      images: { orderBy: { order: 'asc' } },
      amenities: { orderBy: { name: 'asc' } },
      developer: true,
    },
  });

  if (!project || !project.published || project.archived) return null;
  return toPublicProjectDetail(project);
}

export async function getPublicApartment(slug: string): Promise<PublicApartmentDetail | null> {
  const apartment = await db.apartment.findUnique({
    where: { slug },
    include: {
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
      building: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  if (
    !apartment ||
    !apartment.published ||
    apartment.archived ||
    !apartment.project ||
    !apartment.project.published ||
    apartment.project.archived
  ) return null;

  return toPublicApartmentDetail(apartment);
}
