import { ASAS } from './constants';

/**
 * Organization / RealEstateAgent structured data — describes ASAS as a business
 * for search engines (Google rich results, knowledge graph).
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: ASAS.fullName,
  description:
    "Agence de commercialisation immobilière spécialisée dans la vente de projets neufs à Alger et ses environs.",
  url: 'https://asas.dz',
  telephone: ASAS.phone,
  email: ASAS.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: ASAS.city,
    addressCountry: 'DZ',
  },
  areaServed: [
    { '@type': 'City', name: 'Alger' },
    { '@type': 'AdministrativeArea', name: 'Chéraga' },
    { '@type': 'AdministrativeArea', name: 'Dar El Beïda' },
    { '@type': 'AdministrativeArea', name: 'Bordj El Bahri' },
    { '@type': 'AdministrativeArea', name: 'Hussein Dey' },
  ],
  knowsAbout: [
    'Commercialisation immobilière',
    'Marketing immobilier',
    "Vente d'appartements neufs",
  ],
};

/**
 * WebSite structured data — describes the site itself.
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: ASAS.fullName,
  url: 'https://asas.dz',
  inLanguage: 'fr-DZ',
  publisher: { '@type': 'Organization', name: ASAS.fullName },
};

/**
 * BreadcrumbList structured data — for breadcrumb navigation rich results.
 */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Residence structured data — for individual project pages.
 * Enhanced with offers, geo, and amenity features for richer Google results.
 */
export function projectSchema(project: {
  name: string;
  description?: string;
  district: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startingPrice?: number;
  priceOnRequest?: boolean;
  deliveryYear?: number;
  deliveryQuarter?: string;
  apartmentTypes?: string;
  heroImage?: string;
  amenities?: string[];
}) {
  const offers = project.priceOnRequest
    ? undefined
    : project.startingPrice != null
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'DZD',
          lowPrice: project.startingPrice.toString(),
          availability: 'https://schema.org/InStock',
        }
      : undefined;

  const geo =
    project.latitude != null && project.longitude != null
      ? {
          '@type': 'GeoCoordinates',
          latitude: project.latitude,
          longitude: project.longitude,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: project.name,
    description: project.description || '',
    url: `https://asas.dz/#/projects/${(project as { slug?: string }).slug ?? ''}`,
    image: project.heroImage ? `https://asas.dz${project.heroImage}` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: project.address ?? project.district,
      addressLocality: project.city,
      addressRegion: project.district,
      addressCountry: 'DZ',
    },
    ...(geo ? { geo } : {}),
    ...(offers ? { offers } : {}),
    ...(project.amenities && project.amenities.length > 0
      ? { amenityFeature: project.amenities.map(name => ({ '@type': 'LocationFeatureSpecification', name, value: true })) }
      : {}),
    ...(project.deliveryYear
      ? {
          dateCreated: `${project.deliveryYear}-${quarterToMonth(project.deliveryQuarter)}`,
        }
      : {}),
  };
}

function quarterToMonth(quarter?: string): string {
  // Convert Q1->01, Q2->04, Q3->07, Q4->10 (first month of the quarter)
  switch (quarter) {
    case 'Q1': return '01';
    case 'Q2': return '04';
    case 'Q3': return '07';
    case 'Q4': return '10';
    default: return '01';
  }
}

/**
 * Apartment structured data — for individual apartment pages.
 * Enhanced with full offer, location, and accommodation details.
 */
export function apartmentSchema(apt: {
  typeName: string;
  surface: number;
  bedrooms: number;
  bathrooms?: number;
  balconies?: number;
  floor?: number;
  orientation?: string;
  price?: number;
  priceOnRequest?: boolean;
  status: string;
  paymentPlan?: string;
  renderImage?: string;
  project?: {
    name: string;
    district: string;
    city: string;
    slug?: string;
  };
}) {
  const statusMap: Record<string, string> = {
    AVAILABLE: 'https://schema.org/InStock',
    RESERVED: 'https://schema.org/PreOrder',
    SOLD: 'https://schema.org/SoldOut',
    COMING_SOON: 'https://schema.org/PreOrder',
  };

  const offers = apt.priceOnRequest
    ? undefined
    : apt.price != null
      ? {
          '@type': 'Offer',
          price: apt.price.toString(),
          priceCurrency: 'DZD',
          availability: statusMap[apt.status] ?? 'https://schema.org/InStock',
          ...(apt.paymentPlan ? { description: apt.paymentPlan } : {}),
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name: apt.typeName,
    ...(apt.renderImage ? { image: `https://asas.dz${apt.renderImage}` } : {}),
    floorSize: { '@type': 'QuantitativeValue', value: apt.surface, unitCode: 'MTK' },
    numberOfRooms: apt.bedrooms + 1, // living + bedrooms
    numberOfBedrooms: apt.bedrooms,
    ...(apt.bathrooms != null ? { numberOfBathroomsTotal: apt.bathrooms } : {}),
    ...(apt.balconies != null ? { numberOfAccommodationUnits: apt.balconies } : {}),
    ...(apt.floor != null ? { floor: { '@type': 'Text', value: apt.floor.toString() } } : {}),
    ...(apt.orientation ? { additionalProperty: { '@type': 'PropertyValue', name: 'orientation', value: apt.orientation } } : {}),
    ...(apt.project
      ? {
          containedInPlace: {
            '@type': 'Residence',
            name: apt.project.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: apt.project.city,
              addressRegion: apt.project.district,
              addressCountry: 'DZ',
            },
          },
        }
      : {}),
    ...(offers ? { offers } : {}),
  };
}

/**
 * FAQPage structured data — for FAQ sections (rich results in search).
 */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
