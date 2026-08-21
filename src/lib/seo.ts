import { ASAS } from './constants';
import { absoluteUrl } from './site-config';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: ASAS.fullName,
  description: 'Agence de commercialisation immobilière spécialisée dans la vente de projets neufs à Alger et ses environs.',
  url: absoluteUrl('/'),
  telephone: ASAS.phone,
  email: ASAS.email,
  address: { '@type': 'PostalAddress', addressLocality: ASAS.city, addressCountry: 'DZ' },
  areaServed: [
    { '@type': 'City', name: 'Alger' },
    { '@type': 'AdministrativeArea', name: 'Chéraga' },
    { '@type': 'AdministrativeArea', name: 'Dar El Beïda' },
    { '@type': 'AdministrativeArea', name: 'Bordj El Bahri' },
    { '@type': 'AdministrativeArea', name: 'Hussein Dey' },
  ],
  knowsAbout: ['Commercialisation immobilière', 'Marketing immobilier', "Vente d'appartements neufs"],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: ASAS.fullName,
  url: absoluteUrl('/'),
  inLanguage: 'fr-DZ',
  publisher: { '@type': 'Organization', name: ASAS.fullName },
};

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })),
  };
}

export function projectSchema(project: {
  name: string; description?: string; district: string; city: string; address?: string;
  latitude?: number; longitude?: number; startingPrice?: number; priceOnRequest?: boolean;
  deliveryYear?: number; deliveryQuarter?: string; apartmentTypes?: string; heroImage?: string;
  amenities?: string[]; slug?: string;
}) {
  const offers = project.priceOnRequest ? undefined : project.startingPrice != null ? {
    '@type': 'AggregateOffer', priceCurrency: 'DZD', lowPrice: project.startingPrice.toString(), availability: 'https://schema.org/InStock',
  } : undefined;
  const geo = project.latitude != null && project.longitude != null ? { '@type': 'GeoCoordinates', latitude: project.latitude, longitude: project.longitude } : undefined;
  return {
    '@context': 'https://schema.org', '@type': 'Residence', name: project.name,
    description: project.description || '', url: absoluteUrl(`/projects/${project.slug ?? ''}`),
    image: project.heroImage ? absoluteUrl(project.heroImage) : undefined,
    address: { '@type': 'PostalAddress', streetAddress: project.address ?? project.district, addressLocality: project.city, addressRegion: project.district, addressCountry: 'DZ' },
    ...(geo ? { geo } : {}), ...(offers ? { offers } : {}),
    ...(project.amenities?.length ? { amenityFeature: project.amenities.map(name => ({ '@type': 'LocationFeatureSpecification', name, value: true })) } : {}),
    ...(project.deliveryYear ? { dateCreated: `${project.deliveryYear}-${quarterToMonth(project.deliveryQuarter)}` } : {}),
  };
}

function quarterToMonth(quarter?: string): string {
  switch (quarter) { case 'Q1': return '01'; case 'Q2': return '04'; case 'Q3': return '07'; case 'Q4': return '10'; default: return '01'; }
}

export function apartmentSchema(apt: {
  typeName: string; surface: number; bedrooms: number; bathrooms?: number; balconies?: number; floor?: number;
  orientation?: string; price?: number; priceOnRequest?: boolean; status: string; paymentPlan?: string;
  renderImage?: string; project?: { name: string; district: string; city: string; slug?: string }; slug?: string;
}) {
  const statusMap: Record<string, string> = {
    AVAILABLE: 'https://schema.org/InStock', RESERVED: 'https://schema.org/PreOrder', SOLD: 'https://schema.org/SoldOut', COMING_SOON: 'https://schema.org/PreOrder',
  };
  const offers = apt.priceOnRequest ? undefined : apt.price != null ? {
    '@type': 'Offer', price: apt.price.toString(), priceCurrency: 'DZD', availability: statusMap[apt.status] ?? 'https://schema.org/InStock', ...(apt.paymentPlan ? { description: apt.paymentPlan } : {}),
  } : undefined;
  return {
    '@context': 'https://schema.org', '@type': 'Apartment', name: apt.typeName,
    ...(apt.renderImage ? { image: absoluteUrl(apt.renderImage) } : {}),
    floorSize: { '@type': 'QuantitativeValue', value: apt.surface, unitCode: 'MTK' },
    numberOfRooms: apt.bedrooms + 1, numberOfBedrooms: apt.bedrooms,
    ...(apt.bathrooms != null ? { numberOfBathroomsTotal: apt.bathrooms } : {}),
    ...(apt.balconies != null ? { numberOfAccommodationUnits: apt.balconies } : {}),
    ...(apt.floor != null ? { floor: { '@type': 'Text', value: apt.floor.toString() } } : {}),
    ...(apt.orientation ? { additionalProperty: { '@type': 'PropertyValue', name: 'orientation', value: apt.orientation } } : {}),
    ...(apt.project ? { containedInPlace: { '@type': 'Residence', name: apt.project.name, url: apt.project.slug ? absoluteUrl(`/projects/${apt.project.slug}`) : undefined, address: { '@type': 'PostalAddress', addressLocality: apt.project.city, addressRegion: apt.project.district, addressCountry: 'DZ' } } } : {}),
    ...(offers ? { offers } : {}),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
}
