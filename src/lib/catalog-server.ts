import 'server-only';

import { db } from '@/lib/db';
import type { PublicApartmentDetail, PublicProjectCard, PublicProjectDetail } from '@/lib/catalog-contracts';
import { toPublicApartmentDetail, toPublicProjectCard, toPublicProjectDetail } from '@/lib/catalog-mappers';

export async function getPublicProjectCards(): Promise<PublicProjectCard[]> {
  const projects = await db.project.findMany({
    where: { published: true, archived: false },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { name: 'asc' }],
    select: {
      id: true, slug: true, name: true, tagline: true, city: true, district: true,
      projectType: true, status: true, latitude: true, longitude: true,
      startingPrice: true, priceOnRequest: true, minSurface: true, maxSurface: true,
      deliveryYear: true, deliveryQuarter: true, apartmentTypes: true,
      hasParking: true, hasElevator: true, hasGarden: true, hasPool: true, featured: true,
      imagesRelation: { orderBy: { order: 'asc' }, take: 1, select: { id: true, url: true, alt: true, type: true } },
      _count: { select: { apartments: { where: { published: true, archived: false } } } },
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
    if (['available', 'AVAILABLE', 'COMING_SOON'].includes(row.status)) current.available += row._count._all;
    if (['reserved', 'RESERVED'].includes(row.status)) current.reserved += row._count._all;
    counts.set(row.projectId, current);
  }

  return projects.map((project) => toPublicProjectCard({ ...project, images: project.imagesRelation }, counts.get(project.id) ?? { available: 0, reserved: 0 }));
}

export async function getPublicProject(slug: string): Promise<PublicProjectDetail | null> {
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      buildings: { orderBy: { order: 'asc' } },
      apartments: {
        where: { published: true, archived: false },
        orderBy: { order: 'asc' },
        include: { imagesRelation: { orderBy: { order: 'asc' } }, building: true },
      },
      imagesRelation: { orderBy: { order: 'asc' } },
      amenities: { orderBy: { name: 'asc' } },
      developer: true,
    },
  });
  if (!project || !project.published || project.archived) return null;
  return toPublicProjectDetail({
    ...project,
    images: project.imagesRelation,
    apartments: project.apartments.map((apartment) => ({ ...apartment, images: apartment.imagesRelation })),
  });
}

/**
 * Apartment URLs are project-scoped because the database enforces
 * UNIQUE(project_id, slug), not global slug uniqueness.
 * The optional projectSlug keeps the legacy API compatible while all
 * canonical site routes pass the project slug explicitly.
 */
export async function getPublicApartment(apartmentSlug: string, projectSlug?: string): Promise<PublicApartmentDetail | null> {
  const apartment = projectSlug
    ? await db.apartment.findFirst({
        where: { slug: apartmentSlug, project: { slug: projectSlug } },
        include: {
          project: { select: { id: true, slug: true, name: true, city: true, district: true, hasElevator: true, hasSecurity: true, published: true, archived: true } },
          building: true,
          imagesRelation: { orderBy: { order: 'asc' } },
        },
      })
    : await db.apartment.findFirst({
        where: { slug: apartmentSlug },
        include: {
          project: { select: { id: true, slug: true, name: true, city: true, district: true, hasElevator: true, hasSecurity: true, published: true, archived: true } },
          building: true,
          imagesRelation: { orderBy: { order: 'asc' } },
        },
      });

  if (!apartment || !apartment.published || apartment.archived || !apartment.project || !apartment.project.published || apartment.project.archived) return null;
  return toPublicApartmentDetail({ ...apartment, images: apartment.imagesRelation });
}