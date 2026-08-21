import type { Metadata } from 'next';
import ApartmentDetailPage from '@/components/pages/ApartmentDetailPage';

interface Props { params: Promise<{ slug: string; apartmentSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, apartmentSlug } = await params;
  return {
    title: `${decodeURIComponent(apartmentSlug)} | ${decodeURIComponent(slug)} | ASAS`,
    alternates: {
      canonical: `/projects/${encodeURIComponent(slug)}/apartments/${encodeURIComponent(apartmentSlug)}`,
    },
  };
}

export default async function ApartmentRoute({ params }: Props) {
  const { slug, apartmentSlug } = await params;
  return (
    <ApartmentDetailPage
      projectSlug={decodeURIComponent(slug)}
      apartmentSlug={decodeURIComponent(apartmentSlug)}
    />
  );
}
