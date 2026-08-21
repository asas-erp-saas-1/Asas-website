import type { PublicProjectCard } from '@/lib/catalog-contracts';
import type { Project } from '@/lib/types';

/**
 * Temporary compatibility boundary for components that have not yet migrated
 * to PublicProjectCard. Keep all legacy -> public conversion here so legacy
 * domain models cannot leak into the public UI architecture.
 */
export function legacyProjectToPublicCard(project: Project): PublicProjectCard {
  const apartments = project.apartments ?? [];
  const hero = project.images?.find((image) => image.type === 'hero')
    ?? project.images?.find((image) => image.type === 'gallery')
    ?? project.images?.[0];

  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    city: project.city,
    district: project.district,
    projectType: project.projectType,
    status: project.status,
    latitude: project.latitude,
    longitude: project.longitude,
    startingPrice: project.startingPrice,
    priceOnRequest: project.priceOnRequest,
    minSurface: project.minSurface,
    maxSurface: project.maxSurface,
    deliveryYear: project.deliveryYear,
    deliveryQuarter: project.deliveryQuarter,
    apartmentTypes: project.apartmentTypes,
    hasParking: project.hasParking,
    hasElevator: project.hasElevator,
    hasGarden: project.hasGarden,
    hasPool: project.hasPool,
    featured: project.featured,
    image: hero ? { id: hero.id, url: hero.url, alt: hero.alt, type: hero.type } : undefined,
    apartmentCount: apartments.length,
    availableApartmentCount: apartments.filter((apartment) => apartment.status === 'AVAILABLE' || apartment.status === 'COMING_SOON').length,
    reservedApartmentCount: apartments.filter((apartment) => apartment.status === 'RESERVED').length,
  };
}
