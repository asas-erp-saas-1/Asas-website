import type { Metadata } from 'next';
import ApartmentDetailPage from '@/components/pages/ApartmentDetailPage';
import { getPublicApartment } from '@/lib/catalog-server';
import { absoluteUrl } from '@/lib/site-config';

interface Props { params: Promise<{ slug: string; apartmentSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, apartmentSlug } = await params;
  const apartment = await getPublicApartment(apartmentSlug);

  if (!apartment || apartment.project?.slug !== slug) {
    return { title: 'Appartement introuvable | ASAS', robots: { index: false, follow: false } };
  }

  const projectName = apartment.project?.name ?? decodeURIComponent(slug);
  const title = `${apartment.typeName} ${apartment.surface} m² — ${projectName}`;
  const description = apartment.description?.trim() || `${apartment.typeName} de ${apartment.surface} m² à ${projectName}. Consultez les détails, le plan et les disponibilités auprès d'ASAS.`;
  const image = apartment.images?.find((item) => item.type === 'hero')?.url ?? apartment.images?.[0]?.url;
  const path = `/projects/${slug}/apartments/${apartment.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ApartmentRoute({ params }: Props) {
  const { slug, apartmentSlug } = await params;
  return <ApartmentDetailPage projectSlug={decodeURIComponent(slug)} apartmentSlug={decodeURIComponent(apartmentSlug)} />;
}
