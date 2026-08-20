// ASAS Business Constants
export const ASAS = {
  name: 'ASAS',
  fullName: 'ASAS — Agence de Commercialisation Immobilière',
  tagline: 'L\'immobilier de qualité, commercialisé avec excellence',
  phone: '+213 770 51 82 88',
  phoneRaw: '+213770518288',
  whatsapp: '+213770518288',
  email: 'asas.agency.dz@gmail.com',
  city: 'Alger',
  country: 'Algérie',
} as const;

export const WHATSAPP_BASE_URL = `https://wa.me/${ASAS.whatsapp.replace('+', '')}`;

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT: (slug: string) => `/projects/${slug}`,
  APARTMENTS: (projectSlug: string) => `/projects/${projectSlug}/apartments`,
  APARTMENT: (projectSlug: string, apartmentSlug: string) => `/projects/${projectSlug}/apartments/${apartmentSlug}`,
  SERVICES: '/services',
  ABOUT: '/about',
  FOR_DEVELOPERS: '/for-developers',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const APARTMENT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  COMING_SOON: 'COMING_SOON',
  OFF_MARKET: 'OFF_MARKET',
} as const;

export const APARTMENT_STATUS_LABELS: Record<string, { fr: string; color: string }> = {
  AVAILABLE: { fr: 'Disponible', color: 'status-available' },
  RESERVED: { fr: 'Réservé', color: 'status-reserved' },
  SOLD: { fr: 'Vendu', color: 'status-sold' },
  COMING_SOON: { fr: 'Bientôt disponible', color: 'status-coming-soon' },
  OFF_MARKET: { fr: 'Retiré du marché', color: 'status-off-market' },
};

export const PROJECT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  COMING_SOON: 'COMING_SOON',
  SOLD_OUT: 'SOLD_OUT',
} as const;

export const PROJECT_STATUS_LABELS: Record<string, { fr: string }> = {
  AVAILABLE: { fr: 'En commercialisation' },
  COMING_SOON: { fr: 'Bientôt disponible' },
  SOLD_OUT: { fr: 'Épuisé' },
};

export const LEAD_INTENTS = {
  REQUEST_INFORMATION: 'REQUEST_INFORMATION',
  REQUEST_PRICE: 'REQUEST_PRICE',
  REQUEST_FLOOR_PLAN: 'REQUEST_FLOOR_PLAN',
  BOOK_VISIT: 'BOOK_VISIT',
  WHATSAPP: 'WHATSAPP',
  CALL: 'CALL',
  RESERVATION: 'RESERVATION',
} as const;

export const LEAD_INTENT_LABELS: Record<string, string> = {
  REQUEST_INFORMATION: 'Recevoir les informations',
  REQUEST_PRICE: 'Demander le prix',
  REQUEST_FLOOR_PLAN: 'Recevoir le plan',
  BOOK_VISIT: 'Planifier une visite',
  WHATSAPP: 'Contacter via WhatsApp',
  CALL: 'Être rappelé(e)',
  RESERVATION: 'Réserver',
};

export const ALGERIAN_DISTRICTS = [
  'Chéraga',
  'Dar El Beïda',
  'Bordj El Bahri',
  'Hussein Dey',
  'Bab El Oued',
  'El Biar',
  'Bir Mourad Raïs',
  'Draria',
  'Birkhadem',
  'Mohammadia',
  'Oued Smar',
  'Reghaia',
  'Rouiba',
  'Ain Taya',
  'Bordj El Kiffan',
  'El Harrach',
  'Kouba',
  'Bachdjerrah',
] as const;

export function formatPrice(price: number | null | undefined): string {
  if (price == null || price <= 0) return 'Prix sur demande';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' DA';
}

export function formatSurface(surface: number): string {
  return `${surface} m²`;
}

export function getWhatsAppUrl(message: string): string {
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

export function getPhoneUrl(): string {
  return `tel:${ASAS.phoneRaw}`;
}
