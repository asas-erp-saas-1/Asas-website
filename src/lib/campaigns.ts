// ASAS Campaign Landing Pages — data and types
// Each campaign is a high-converting landing page reachable at #/lp/[campaign-slug]

export interface Campaign {
  slug: string;
  title: string;
  subtitle: string;
  headline: string;
  subheadline: string;
  projectName?: string; // optional: link to a specific project
  apartmentSlug?: string; // optional: link to a specific apartment
  offer?: string; // e.g. "Prix spécial lancement"
  urgencyText?: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  features: string[];
  image: string;
  gradient: string; // tailwind gradient classes
}

export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'f3-cheraga-special',
    title: 'F3 à Chéraga',
    subtitle: 'Offre de lancement',
    headline: 'F3 92m² à Chéraga',
    subheadline:
      "Appartement familial avec parking, balcon et prestations de qualité. Livraison Q4 2026.",
    projectName: 'Les Oliviers',
    apartmentSlug: 'f3-familial-95m2',
    offer: 'À partir de 12 500 000 DA',
    urgencyText: "Plus que 3 appartements disponibles à ce prix",
    ctaPrimary: 'Recevoir les informations',
    ctaSecondary: 'Voir le plan',
    features: [
      '92 à 95 m² de surface habitable',
      '2 chambres + salon spacieux',
      'Balcon de 12 m² orienté Sud',
      'Parking souterrain inclus',
      'Ascenseur et sécurité 24h/24',
      'Livraison Q4 2026',
    ],
    image: '/images/projects/les-oliviers-hero.jpg',
    gradient: 'from-forest to-forest-dark',
  },
  {
    slug: 'investissement-el-borj',
    title: 'Investissement El Borj',
    subtitle: "Opportunité d'investissement",
    headline: 'Investissez à Bordj El Bahri',
    subheadline:
      'Résidence moderne vue mer, idéale pour investissement ou résidence principale.',
    projectName: 'El Borj',
    offer: 'Rendement locatif estimé 6-8%',
    urgencyText: 'Phase de pré-commercialisation - prix avantageux',
    ctaPrimary: 'Demander une visite',
    ctaSecondary: 'Parler à un conseiller',
    features: [
      '110 à 195 m² de surface',
      'Vue mer pour les étages élevés',
      'F3, F4 et Duplex disponibles',
      'Quartier en forte valorisation',
      'Livraison Q2 2027',
      'Plan de paiement échelonné',
    ],
    image: '/images/projects/el-borj-hero.jpg',
    gradient: 'from-charcoal to-forest-dark',
  },
  {
    slug: 'premiere-accueil-dar-saida',
    title: 'Premier achat - Dar Saïda',
    subtitle: 'Spécial premier achat',
    headline: 'Premier appartement à Dar El Beïda',
    subheadline:
      'F2 et F3 accessibles, parfaits pour les jeunes familles et primo-accédants.',
    projectName: 'Dar Saïda',
    offer: 'À partir de 5 500 000 DA',
    urgencyText: 'Pré-commercialisation - réservez votre lot',
    ctaPrimary: 'Réserver une visite',
    ctaSecondary: 'Recevoir le brochure',
    features: [
      '55 à 85 m² - idéal premier achat',
      'F2 et F3 disponibles',
      'Quartier familial et bien desservi',
      'Plan de paiement adapté',
      'Livraison Q2 2026',
      'Accompagnement complet ASAS',
    ],
    image: '/images/projects/dar-saida-hero.jpg',
    gradient: 'from-forest-dark to-charcoal',
  },
];

export function getCampaign(slug: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.slug === slug);
}
