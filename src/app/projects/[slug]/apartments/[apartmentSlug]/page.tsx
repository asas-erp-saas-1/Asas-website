import type { Metadata } from 'next';
import ApartmentDetailPage from '@/components/pages/ApartmentDetailPage';
import { getPublicApartment } from '@/lib/catalog-server';
import { absoluteUrl } from '@/lib/site-config';

interface Props { params: Promise<{ slug: string; apartmentSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, apartmentSlug } = await params;
  const projectSlug = decodeURIComponent(slug);
  const apartment = await getPublicApartment(decodeURIComponent(apartmentSlug), projectSlug);

  if (!apartment) {
    return { title: 'Appartement introuvable | ASAS', robots: { index: false, follow: false } };
  }

  const projectName = apartment.project?.name ?? projectSlug;
  const title = `${apartment.typeName} ${apartment.surface} m² — ${projectName}`;
  const description = apartment.description?.trim() || `${apartment.typeName} de ${apartment.surface} m² à ${projectName}. Consultez les détails, le plan et les disponibilités auprès d'ASAS.`;
  const image = apartment.images?.find((item) => item.type === 'hero')?.url ?? apartment.images?.[0]?.url;
  const path = `/projects/${projectSlug}/apartments/${apartment.slug}`;

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