/**
 * Public catalog contracts.
 *
 * Deliberately independent from Prisma/domain types. Internal fields must
 * never become public API fields merely because the database model grows.
 */

export interface PublicProjectImage {
  id: string;
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

export interface PublicApartmentImage {
  id: string;
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

export interface PublicBuilding {
  id: string;
  slug: string;
  projectId: string;
  name: string;
  nameAr?: string;
  code: string;
  floors: number;
  hasElevator: boolean;
  order: number;
}

export interface PublicAmenity {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  descriptionAr?: string;
}

export interface PublicDeveloper {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  website?: string;
}

export interface PublicApartmentProjectSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  district: string;
  hasElevator: boolean;
  hasSecurity: boolean;
}

export interface PublicApartmentDetail {
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
  project?: PublicApartmentProjectSummary;
  building?: PublicBuilding;
  images?: PublicApartmentImage[];
}

/** Lightweight, list-only public contract. Never contains apartment rows. */
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
  deliveryYear?: number;
  deliveryQuarter?: string;
  apartmentTypes: string;
  hasParking: boolean;
  hasElevator: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  featured: boolean;
  image?: { id: string; url: string; alt?: string; type: string };
  apartmentCount: number;
  availableApartmentCount: number;
  reservedApartmentCount: number;
}

export interface PublicProjectDetail {
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
  featured: boolean;
  order: number;
  buildings: PublicBuilding[];
  apartments: PublicApartmentDetail[];
  amenities: PublicAmenity[];
  images: PublicProjectImage[];
  developer?: PublicDeveloper;
}
