import type { PublicProjectCard } from '@/lib/catalog-contracts';
import type { Project } from '@/lib/types';

/** Temporary compatibility boundary for unmigrated internal consumers. */
export function legacyProjectToPublicCard(project: Project): PublicProjectCard {
  const apartments = project.apartments ?? [];
  const hero = project.images?.find((image) => image.type === 'hero')
    ?? project.images?.find((image) => image.type === 'gallery')
    ?? project.images?.[0];

  return {
    id: project.id, slug: project.slug, name: project.name, tagline: project.tagline,
    city: project.city, district: project.district, projectType: project.projectType,
    status: project.status, latitude: project.latitude, longitude: project.longitude,
    startingPrice: project.startingPrice, priceOnRequest: project.priceOnRequest,
    minSurface: project.minSurface, maxSurface: project.maxSurface,
    deliveryYear: project.deliveryYear, deliveryQuarter: project.deliveryQuarter,
    apartmentTypes: project.apartmentTypes, hasParking: project.hasParking,
    hasElevator: project.hasElevator, hasGarden: project.hasGarden, hasPool: project.hasPool,
    featured: project.featured,
    image: hero ? { id: hero.id, url: hero.url, alt: hero.alt, type: hero.type } : undefined,
    apartmentCount: apartments.length,
    availableApartmentCount: apartments.filter((a) => a.status === 'AVAILABLE' || a.status === 'COMING_SOON').length,
    reservedApartmentCount: apartments.filter((a) => a.status === 'RESERVED').length,
  };
}

/** Transitional adapter for pages still typed against the legacy Project model. */
export function publicCardToLegacyProject(card: PublicProjectCard): Project {
  const image = card.image ? [{
    id: card.image.id, projectId: card.id, url: card.image.url,
    alt: card.image.alt, type: card.image.type, order: 0,
  }] : [];

  return {
    id: card.id, slug: card.slug, name: card.name, tagline: card.tagline,
    city: card.city, district: card.district, latitude: card.latitude, longitude: card.longitude,
    projectType: card.projectType, status: card.status, apartmentTypes: card.apartmentTypes,
    minSurface: card.minSurface, maxSurface: card.maxSurface,
    deliveryYear: card.deliveryYear, deliveryQuarter: card.deliveryQuarter,
    hasParking: card.hasParking, hasElevator: card.hasElevator, hasGarden: card.hasGarden,
    hasPool: card.hasPool, hasSecurity: false, hasClim: false,
    startingPrice: card.startingPrice, priceOnRequest: card.priceOnRequest,
    published: true, archived: false, featured: card.featured, order: 0,
    images: image, apartments: [], buildings: [], amenities: [],
  };
}
