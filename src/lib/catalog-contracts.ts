import type { Apartment, Project } from '@/lib/types';

/** Stable public catalog DTO. Keep this smaller than the internal Prisma model. */
export interface PublicProjectCard {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  city: string;
  district: string;
  projectType: string;
  status: string;
  latitude?: number;
  longitude?: number;
  startingPrice?: number;
  priceOnRequest: boolean;
  minSurface?: number;
  maxSurface?: number;
  hasParking: boolean;
  hasElevator: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  featured: boolean;
  image?: { id: string; url: string; alt?: string; type: string };
  apartmentCount: number;
  availableApartmentCount: number;
}

export interface PublicProjectDetail extends Project {}
export interface PublicApartmentDetail extends Apartment {}
