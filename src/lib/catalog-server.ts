import 'server-only';

import { db } from '@/lib/db';
import type { Apartment, Project } from '@/lib/types';

function jsonString(value: unknown): string {
  if (value == null) return '[]';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return '[]';
  }
}

function normalizeApartment<T extends Record<string, unknown>>(apartment: T): Apartment {
  return {
    ...apartment,
    rooms: jsonString(apartment.rooms),
    features: jsonString(apartment.features),
    featuresAr: jsonString(apartment.featuresAr),
  } as Apartment;
}

export function normalizeProject<T extends Record<string, unknown>>(project: T): Project {
  return {
    ...project,
    apartmentTypes: jsonString(project.apartmentTypes),
    apartments: Array.isArray(project.apartments)
      ? project.apartments.map((apartment) => normalizeApartment(apartment as Record<string, unknown>))
      : [],
    buildings: Array.isArray(project.buildings)
      ? project.buildings.map((building) => ({
          ...building,
          apartments: Array.isArray((building as Record<string, unknown>).apartments)
            ? ((building as Record<string, unknown>).apartments as Record<string, unknown>[]).map(normalizeApartment)
            : [],
        }))
      : [],
  } as Project;
}

export async function getPublicProjects(): Promise<Project[]> {
  const projects = await db.project.findMany({
    where: { published: true, archived: false },
    orderBy: { order: 'asc' },
    include: {
      buildings: {
        orderBy: { order: 'asc' },
        include: {
          apartments: {
            where: { published: true, archived: false },
            orderBy: { order: 'asc' },
            include: { images: { orderBy: { order: 'asc' } } },
          },
        },
      },
      apartments: {
        where: { published: true, archived: false },
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } },
      },
      images: { orderBy: { order: 'asc' } },
      amenities: { orderBy: { name: 'asc' } },
      developer: true,
    },
  });

  return projects.map((project) => normalizeProject(project as Record<string, unknown>));
}

export async function getPublicProject(slug: string): Promise<Project | null> {
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      buildings: {
        orderBy: { order: 'asc' },
        include: {
          apartments: {
            where: { published: true, archived: false },
            orderBy: { order: 'asc' },
            include: { images: { orderBy: { order: 'asc' } } },
          },
        },
      },
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
  return normalizeProject(project as Record<string, unknown>);
}

export async function getPublicApartment(slug: string): Promise<Apartment | null> {
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

  return normalizeApartment(apartment as unknown as Record<string, unknown>);
}
