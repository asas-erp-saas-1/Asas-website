// ASAS Campaign Landing Pages — editorial campaign definitions.
// Commercial facts such as price, availability and timing must come from the live catalog/API,
// not from hardcoded campaign copy.

export interface Campaign {
  slug: string;
  title: string;
  subtitle: string;
  headline: string;
  subheadline: string;
  projectName?: string;
  apartmentSlug?: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  features: string[];
  image: string;
}

export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'f3-cheraga-special',
    title: 'F3 à Chéraga',
    subtitle: 'Sélection ASAS',
    headline: 'Découvrez les logements disponibles à Chéraga',
    subheadline: 'Consultez les informations publiées par ASAS et demandez les détails correspondant à votre recherche.',
    projectName: 'Les Oliviers',
    apartmentSlug: 'f3-familial-95m2',
    ctaPrimary: 'Recevoir les informations',
    ctaSecondary: 'Voir le logement',
    features: [
      'Informations du logement publiées par ASAS',
      'Caractéristiques et surface selon les données disponibles',
      'Plans et visuels lorsqu’ils sont publiés',
      'Disponibilité à confirmer auprès d’ASAS',
      'Accompagnement par un conseiller',
    ],
    image: '/images/projects/les-oliviers-hero.jpg',
  },
  {
    slug: 'investissement-el-borj',
    title: 'Investissement El Borj',
    subtitle: 'Sélection immobilière',
    headline: 'Découvrez le projet El Borj',
    subheadline: 'Explorez les informations publiées sur le programme et échangez avec ASAS pour évaluer votre projet.',
    projectName: 'El Borj',
    ctaPrimary: 'Demander des informations',
    ctaSecondary: 'Voir le projet',
    features: [
      'Présentation du programme',
      'Typologies et caractéristiques publiées',
      'Disponibilités à vérifier selon l’inventaire actuel',
      'Informations de commercialisation disponibles auprès d’ASAS',
    ],
    image: '/images/projects/el-borj-hero.jpg',
  },
  {
    slug: 'premiere-accueil-dar-saida',
    title: 'Premier achat — Dar Saïda',
    subtitle: 'Sélection ASAS',
    headline: 'Découvrez les logements disponibles à Dar El Beïda',
    subheadline: 'Consultez les informations du programme et demandez à ASAS les éléments nécessaires à votre décision.',
    projectName: 'Dar Saïda',
    ctaPrimary: 'Recevoir les informations',
    ctaSecondary: 'Voir le projet',
    features: [
      'Informations du programme publiées par ASAS',
      'Typologies et surfaces selon les données disponibles',
      'Plans et visuels lorsqu’ils sont publiés',
      'Disponibilités à confirmer auprès d’ASAS',
      'Accompagnement commercial ASAS',
    ],
    image: '/images/projects/dar-saida-hero.jpg',
  },
];

export function getCampaign(slug: string): Campaign | undefined {
  return CAMPAIGNS.find((campaign) => campaign.slug === slug);
}
