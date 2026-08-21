import type { Metadata } from 'next';
import ProjectsPage from '@/components/pages/ProjectsPage';

export const metadata: Metadata = {
  title: 'Projets immobiliers | ASAS',
  description: 'Découvrez les projets immobiliers sélectionnés et commercialisés par ASAS en Algérie.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsRoute() {
  return <ProjectsPage />;
}
