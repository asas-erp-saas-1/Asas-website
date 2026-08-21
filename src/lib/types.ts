// Domain Types for ASAS Real Estate Platform

// ─── Structured Image Types ────────────────────────────────────────
export interface ProjectImage {
  id: string;
  projectId: string;
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
  apartmentId: string;
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
  buildings?: Building[];
  apartments?: Apartment[];
  amenities?: ProjectAmenity[];
  images?: ProjectImage[];
  developer?: Developer;

  /** Public catalog counters carried by the lightweight list DTO adapter. */
  apartmentCount?: number;
  availableApartmentCount?: number;
  reservedApartmentCount?: number;
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
  rooms?: string;
  description?: string;
  descriptionAr?: string;
  features?: string;
  featuresAr?: string;
  published: boolean;
  archived: boolean;
  order: number;
  building?: Building;
  project?: Project;
  images?: ApartmentImage[];
}

export interface ProjectAmenity {
  id: string;
  projectId: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  descriptionAr?: string;
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
  projects?: Project[];
}

// ─── Lead ──────────────────────────────────────────────────────────
export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  preferredContact?: string;
  intent: string;
  message?: string;
  projectId?: string;
  projectName?: string;
  apartmentId?: string;
  apartmentName?: string;
  pageUrl?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}
