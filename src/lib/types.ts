// Domain Types for ASAS Real Estate Platform

// ─── Structured Image Types ────────────────────────────────────────
export interface ProjectImage {
  id: string;
  /** Present on persisted/admin records; omitted by the public catalog projection. */
  projectId?: string;
  url: string;
  alt?: string;
  altAr?: string;
  caption?: string;
  captionAr?: string;
  type: string;
  order: number;
  width?: number;
  height?: number;
}

export interface ApartmentImage {
  id: string;
  /** Present on persisted/admin records; omitted by the public catalog projection. */
  apartmentId?: string;
  url: string;
  alt?: string;
  altAr?: string;
  caption?: string;
  captionAr?: string;
  type: string;
  order: number;
  width?: number;
  height?: number;
}

export interface Building {
  id: string;
  slug: string;
  projectId: string;
  name: string;
  nameAr?: string;
  code: string;
  floors: number;
  hasElevator: boolean;
  order: number;
  apartments?: Apartment[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  tagline?: string;
  taglineAr?: string;
  description?: string;
  descriptionAr?: string;
  city: string;
  cityAr?: string;
  district: string;
  districtAr?: string;
  address?: string;
  addressAr?: string;
  latitude?: number;
  longitude?: number;
  projectType: string;
  status: string;
  apartmentTypes: string;
  minSurface?: number;
  maxSurface?: number;
  deliveryYear?: number;
  deliveryQuarter?: string;
  hasParking: boolean;
  hasElevator: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasSecurity: boolean;
  hasClim: boolean;
  startingPrice?: number;
  priceOnRequest: boolean;
  developerId?: string;
  published: boolean;
  archived: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  developer?: Developer;
  buildings?: Building[];
  apartments?: Apartment[];
  images?: ProjectImage[];
  amenities?: Amenity[];
}

export interface Developer {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  website?: string;
}

export interface Amenity {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  descriptionAr?: string;
}

export interface Apartment {
  id: string;
  slug: string;
  projectId: string;
  buildingId?: string;
  unitNumber?: string;
  apartmentType: string;
  typeName: string;
  typeNameAr?: string;
  surface: number;
  floor?: number;
  totalFloors?: number;
  orientation?: string;
  bedrooms: number;
  bathrooms?: number;
  balconies?: number;
  balconySurface?: number;
  hasParking: boolean;
  parkingSpots?: number;
  hasTerrace: boolean;
  terraceSurface?: number;
  hasGarden: boolean;
  gardenSurface?: number;
  status: string;
  price?: number;
  priceOnRequest: boolean;
  paymentPlan?: string;
  paymentPlanAr?: string;
  rooms: string;
  description?: string;
  descriptionAr?: string;
  features: string;
  featuresAr: string;
  published: boolean;
  archived: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  building?: Building;
  images?: ApartmentImage[];
}

export interface SiteStats {
  projects: number;
  apartments: number;
  availableApartments: number;
  soldApartments: number;
}

/**
 * Backward-compatible export for legacy form consumers.
 * Canonical transport contract lives in ./lead-contracts.ts.
 */
export type { Lead } from './lead-contracts';
