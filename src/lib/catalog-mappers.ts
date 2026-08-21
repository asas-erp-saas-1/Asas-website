import type {
  PublicAmenity,
  PublicApartmentDetail,
  PublicApartmentImage,
  PublicBuilding,
  PublicDeveloper,
  PublicProjectDetail,
  PublicProjectImage,
} from '@/lib/catalog-contracts';

function jsonString(value: unknown): string {
  if (value == null) return '[]';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return '[]'; }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function toPublicProjectImage(image: Record<string, unknown>): PublicProjectImage {
  return {
    id: String(image.id), url: String(image.url), alt: optionalString(image.alt), altAr: optionalString(image.altAr),
    caption: optionalString(image.caption), captionAr: optionalString(image.captionAr), type: String(image.type ?? 'gallery'),
    order: Number(image.order ?? 0), width: typeof image.width === 'number' ? image.width : undefined,
    height: typeof image.height === 'number' ? image.height : undefined,
  };
}

export function toPublicApartmentImage(image: Record<string, unknown>): PublicApartmentImage {
  return {
    id: String(image.id), url: String(image.url), alt: optionalString(image.alt), altAr: optionalString(image.altAr),
    caption: optionalString(image.caption), captionAr: optionalString(image.captionAr), type: String(image.type ?? 'gallery'),
    order: Number(image.order ?? 0), width: typeof image.width === 'number' ? image.width : undefined,
    height: typeof image.height === 'number' ? image.height : undefined,
  };
}

export function toPublicBuilding(building: Record<string, unknown>): PublicBuilding {
  return {
    id: String(building.id), slug: String(building.slug), projectId: String(building.projectId), name: String(building.name),
    nameAr: optionalString(building.nameAr), code: String(building.code), floors: Number(building.floors),
    hasElevator: Boolean(building.hasElevator), order: Number(building.order ?? 0),
  };
}

function toPublicAmenity(amenity: Record<string, unknown>): PublicAmenity {
  return {
    id: String(amenity.id), name: String(amenity.name), nameAr: optionalString(amenity.nameAr), icon: optionalString(amenity.icon),
    description: optionalString(amenity.description), descriptionAr: optionalString(amenity.descriptionAr),
  };
}

function toPublicDeveloper(developer: Record<string, unknown>): PublicDeveloper {
  return {
    id: String(developer.id), slug: String(developer.slug), name: String(developer.name), nameAr: optionalString(developer.nameAr),
    description: optionalString(developer.description), descriptionAr: optionalString(developer.descriptionAr),
    logo: optionalString(developer.logo), website: optionalString(developer.website),
  };
}

function toPublicApartmentProjectSummary(project: Record<string, unknown>) {
  return {
    id: String(project.id), slug: String(project.slug), name: String(project.name), city: String(project.city),
    district: String(project.district), hasElevator: Boolean(project.hasElevator), hasSecurity: Boolean(project.hasSecurity),
  };
}

export function toPublicApartmentDetail(apartment: Record<string, unknown>): PublicApartmentDetail {
  return {
    id: String(apartment.id), slug: String(apartment.slug), projectId: String(apartment.projectId),
    buildingId: optionalString(apartment.buildingId), unitNumber: optionalString(apartment.unitNumber),
    apartmentType: String(apartment.apartmentType), typeName: String(apartment.typeName), typeNameAr: optionalString(apartment.typeNameAr),
    surface: Number(apartment.surface), floor: typeof apartment.floor === 'number' ? apartment.floor : undefined,
    totalFloors: typeof apartment.totalFloors === 'number' ? apartment.totalFloors : undefined,
    orientation: optionalString(apartment.orientation), bedrooms: Number(apartment.bedrooms),
    bathrooms: typeof apartment.bathrooms === 'number' ? apartment.bathrooms : undefined,
    balconies: typeof apartment.balconies === 'number' ? apartment.balconies : undefined,
    balconySurface: typeof apartment.balconySurface === 'number' ? apartment.balconySurface : undefined,
    hasParking: Boolean(apartment.hasParking), parkingSpots: typeof apartment.parkingSpots === 'number' ? apartment.parkingSpots : undefined,
    hasTerrace: Boolean(apartment.hasTerrace), terraceSurface: typeof apartment.terraceSurface === 'number' ? apartment.terraceSurface : undefined,
    hasGarden: Boolean(apartment.hasGarden), gardenSurface: typeof apartment.gardenSurface === 'number' ? apartment.gardenSurface : undefined,
    status: String(apartment.status), price: typeof apartment.price === 'number' ? apartment.price : undefined,
    priceOnRequest: Boolean(apartment.priceOnRequest), paymentPlan: optionalString(apartment.paymentPlan), paymentPlanAr: optionalString(apartment.paymentPlanAr),
    rooms: jsonString(apartment.rooms), description: optionalString(apartment.description), descriptionAr: optionalString(apartment.descriptionAr),
    features: jsonString(apartment.features), featuresAr: jsonString(apartment.featuresAr), published: Boolean(apartment.published),
    archived: Boolean(apartment.archived), order: Number(apartment.order ?? 0),
    project: apartment.project && typeof apartment.project === 'object'
      ? toPublicApartmentProjectSummary(apartment.project as Record<string, unknown>) : undefined,
    building: apartment.building && typeof apartment.building === 'object'
      ? toPublicBuilding(apartment.building as Record<string, unknown>) : undefined,
    images: Array.isArray(apartment.images) ? apartment.images.map((image) => toPublicApartmentImage(image as Record<string, unknown>)) : [],
  };
}

export function toPublicProjectDetail(project: Record<string, unknown>): PublicProjectDetail {
  return {
    id: String(project.id), slug: String(project.slug), name: String(project.name), nameAr: optionalString(project.nameAr),
    tagline: optionalString(project.tagline), taglineAr: optionalString(project.taglineAr), description: optionalString(project.description),
    descriptionAr: optionalString(project.descriptionAr), city: String(project.city), cityAr: optionalString(project.cityAr),
    district: String(project.district), districtAr: optionalString(project.districtAr), address: optionalString(project.address),
    addressAr: optionalString(project.addressAr), latitude: typeof project.latitude === 'number' ? project.latitude : undefined,
    longitude: typeof project.longitude === 'number' ? project.longitude : undefined, projectType: String(project.projectType),
    status: String(project.status), apartmentTypes: jsonString(project.apartmentTypes), minSurface: typeof project.minSurface === 'number' ? project.minSurface : undefined,
    maxSurface: typeof project.maxSurface === 'number' ? project.maxSurface : undefined, deliveryYear: typeof project.deliveryYear === 'number' ? project.deliveryYear : undefined,
    deliveryQuarter: optionalString(project.deliveryQuarter), hasParking: Boolean(project.hasParking), hasElevator: Boolean(project.hasElevator),
    hasGarden: Boolean(project.hasGarden), hasPool: Boolean(project.hasPool), hasSecurity: Boolean(project.hasSecurity), hasClim: Boolean(project.hasClim),
    startingPrice: typeof project.startingPrice === 'number' ? project.startingPrice : undefined, priceOnRequest: Boolean(project.priceOnRequest),
    featured: Boolean(project.featured), order: Number(project.order ?? 0),
    buildings: Array.isArray(project.buildings) ? project.buildings.map((building) => toPublicBuilding(building as Record<string, unknown>)) : [],
    apartments: Array.isArray(project.apartments) ? project.apartments.map((apartment) => toPublicApartmentDetail(apartment as Record<string, unknown>)) : [],
    amenities: Array.isArray(project.amenities) ? project.amenities.map((amenity) => toPublicAmenity(amenity as Record<string, unknown>)) : [],
    images: Array.isArray(project.images) ? project.images.map((image) => toPublicProjectImage(image as Record<string, unknown>)) : [],
    developer: project.developer && typeof project.developer === 'object' ? toPublicDeveloper(project.developer as Record<string, unknown>) : undefined,
  };
}
