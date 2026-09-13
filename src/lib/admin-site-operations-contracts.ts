/**
 * ASAS Site Operations — content model for project/apartment editors.
 *
 * This metadata describes the operational editing contract. It intentionally
 * mirrors the current persisted model without changing the database schema.
 * It is used to keep future forms complete, grouped, and predictable.
 */
export const PROJECT_EDITOR_SECTIONS = [
  {
    id: 'identity',
    label: 'Identité',
    fields: ['name', 'nameAr', 'slug', 'tagline', 'taglineAr', 'projectType', 'developerId'],
  },
  {
    id: 'location',
    label: 'Localisation',
    fields: ['city', 'cityAr', 'district', 'districtAr', 'address', 'addressAr', 'latitude', 'longitude'],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    fields: ['startingPrice', 'priceOnRequest', 'apartmentTypes', 'minSurface', 'maxSurface', 'status'],
  },
  {
    id: 'delivery',
    label: 'Livraison',
    fields: ['deliveryDate', 'deliveryYear', 'deliveryQuarter'],
  },
  {
    id: 'amenities',
    label: 'Équipements',
    fields: ['hasParking', 'hasElevator', 'hasGarden', 'hasPool', 'hasSecurity', 'hasClim', 'amenities'],
  },
  {
    id: 'content',
    label: 'Contenu éditorial',
    fields: ['description', 'descriptionAr', 'heroMediaId', 'heroImage', 'images', 'videos'],
  },
  {
    id: 'seo',
    label: 'SEO & Publication',
    fields: ['published', 'archived', 'seoTitle', 'seoDescription', 'seoKeywords', 'canonicalUrl', 'ogImage', 'robotsIndex', 'order'],
  },
] as const;

export const APARTMENT_EDITOR_SECTIONS = [
  {
    id: 'identity',
    label: 'Identité de l’unité',
    fields: ['projectId', 'buildingId', 'apartmentNumber', 'unitNumber', 'slug', 'type', 'apartmentType', 'typeName', 'typeNameAr'],
  },
  {
    id: 'physical',
    label: 'Caractéristiques',
    fields: ['surface', 'floor', 'totalFloors', 'orientation', 'bedrooms', 'bathrooms', 'rooms'],
  },
  {
    id: 'outdoor',
    label: 'Extérieurs & stationnement',
    fields: ['balcony', 'balconies', 'balconySurface', 'hasParking', 'parkingSpots', 'hasTerrace', 'terraceSurface', 'hasGarden', 'gardenSurface'],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    fields: ['status', 'price', 'priceOnRequest', 'paymentPlan', 'paymentPlanAr'],
  },
  {
    id: 'media',
    label: 'Plans & médias',
    fields: ['floorPlanImage', 'furnishedPlanImage', 'renderImage', 'images', 'imagesRelation', 'videos'],
  },
  {
    id: 'content',
    label: 'Contenu éditorial',
    fields: ['description', 'descriptionAr', 'features', 'featuresAr'],
  },
  {
    id: 'seo',
    label: 'SEO & Publication',
    fields: ['published', 'archived', 'seoTitle', 'seoDescription', 'seoKeywords', 'canonicalUrl', 'ogImage', 'robotsIndex', 'order'],
  },
] as const;

export const SITE_ENTITY_WORKFLOW = {
  project: ['draft', 'content-complete', 'review', 'published', 'archived'],
  building: ['draft', 'active', 'archived'],
  apartment: ['draft', 'available', 'reserved', 'sold', 'off-market', 'archived'],
} as const;

export const APARTMENT_DETAIL_PRIORITY = {
  mobilePrimary: ['apartmentNumber', 'typeName', 'surface', 'floor', 'price', 'status'],
  mobileSecondary: ['building', 'orientation', 'bedrooms', 'bathrooms', 'parking', 'balcony'],
  desktopPrimary: ['apartmentNumber', 'project', 'building', 'typeName', 'surface', 'floor', 'price', 'status', 'published'],
} as const;

export const PROJECT_DETAIL_PRIORITY = {
  mobilePrimary: ['name', 'city', 'district', 'status', 'startingPrice', 'apartmentCount', 'published'],
  mobileSecondary: ['developer', 'deliveryDate', 'apartmentTypes', 'minSurface', 'maxSurface'],
  desktopPrimary: ['name', 'location', 'status', 'apartmentCount', 'startingPrice', 'deliveryDate', 'published'],
} as const;
