import 'server-only';

import { db } from '@/lib/db';
import type { PublicApartmentDetail, PublicProjectDetail } from '@/lib/catalog-contracts';
import { toPublicApartmentDetail, toPublicProjectDetail } from '@/lib/catalog-mappers';

/**
 * Server-only public catalog access.
 *
 * Publication rules live here so Server Components and API routes consume the
 * same source of truth. Prisma/domain objects are mapped before crossing the
 * server boundary.
 */
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
