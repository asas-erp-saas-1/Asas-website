import type { Metadata } from 'next';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import { getPublicProject } from '@/lib/catalog-server';
import { absoluteUrl } from '@/lib/site-config';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  if (!project) return { title: 'Projet introuvable | ASAS', robots: { index: false, follow: false } };

  const title = project.tagline ? `${project.name} — ${project.tagline}` : project.name;
  const description = project.description?.trim() || `Découvrez ${project.name} à ${project.district}, ${project.city}. Consultez les appartements disponibles et contactez ASAS.`;
  const image = project.images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${encodeURIComponent(project.slug)}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/projects/${project.slug}`),
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProjectRoute({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  if (!project) return <ProjectDetailPage projectSlug={decodeURIComponent(slug)} />;

  return (
    <ProjectDetailPage
      projectSlug={decodeURIComponent(slug)}
      initialProject={project}
    />
  );
}
