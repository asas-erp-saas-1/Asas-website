import type { Metadata } from 'next';
import PublicProjectsCatalogPage from '@/components/pages/PublicProjectsCatalogPage';

export const metadata: Metadata = {
  title: 'Projets immobiliers | ASAS',
  description: 'Découvrez les projets immobiliers sélectionnés et commercialisés par ASAS en Algérie.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsRoute() {
  return <PublicProjectsCatalogPage />;
}
