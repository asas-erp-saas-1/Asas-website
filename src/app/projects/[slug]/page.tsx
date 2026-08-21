import type { Metadata } from 'next';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${decodeURIComponent(slug)} | ASAS`,
    alternates: { canonical: `/projects/${encodeURIComponent(slug)}` },
  };
}

export default async function ProjectRoute({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetailPage projectSlug={decodeURIComponent(slug)} />;
}
