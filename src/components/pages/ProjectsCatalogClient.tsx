'use client';

import ProjectsPage from '@/components/pages/ProjectsPage';
import type { Project } from '@/lib/types';

export default function ProjectsCatalogClient({ initialProjects }: { initialProjects: Project[] }) {
  return <ProjectsPage initialProjects={initialProjects} />;
}
