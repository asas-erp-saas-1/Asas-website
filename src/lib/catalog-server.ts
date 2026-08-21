import 'server-only';

import { db } from '@/lib/db';
import type { PublicApartmentDetail, PublicProjectDetail } from '@/lib/catalog-contracts';
import { toPublicApartmentDetail, toPublicProjectDetail } from '@/lib/catalog-mappers';

/**
 * Server-only catalog access. Prisma results are mapped to explicit public
 * contracts before they can cross an API/page boundary.
 */
export async function getPublicProjects(): Promise<PublicProjectDetail[]> {
  const projects = await db.project.findMany({
    where: { published: true, archived: false },
    orderBy: { order: 'asc' },
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

  return projects.map((project) => toPublicProjectDetail(project as unknown as Record<string, unknown>));
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
  return toPublicProjectDetail(project as unknown as Record<string, unknown>);
}

export async function getPublicApartment(slug: string): Promise<PublicApartmentDetail | null> {
  const apartment = await db.apartment.findUnique({
    where: { slug },
    include: {
      project: true,
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

  return toPublicApartmentDetail(apartment as unknown as Record<string, unknown>);
}
