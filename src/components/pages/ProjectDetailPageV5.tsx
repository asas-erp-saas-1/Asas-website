'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  Check,
  Compass,
  Expand,
  Home,
  Layers3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  TreePine,
  Waves,
} from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useProject } from '@/lib/api';
import { formatPrice, getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LeadForm } from '@/components/shared/LeadForm';
import { ProjectMap } from '@/components/shared/ProjectMap';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { projectSchema } from '@/lib/seo';
import type { ProjectImage } from '@/lib/types';

interface ProjectDetailPageProps {
  projectSlug: string;
}

type Amenity = {
  label: string;
  detail: string;
  icon: typeof Car;
};

function safeParseArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function ProjectDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <div className="h-[620px] animate-pulse bg-[#17232a]" />
      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
        <div className="grid gap-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </main>
  );
}

function GalleryTile({
  image,
  projectName,
  className = '',
  label,
  onOpen,
}: {
  image?: ProjectImage;
  projectName: string;
  className?: string;
  label?: string;
  onOpen: () => void;
}) {
  if (!image?.url) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-[#e4e1d8] bg-[#eeeae0] ${className}`}>
        <div className="flex h-full min-h-40 items-center justify-center px-6 text-center text-sm font-medium text-[#74766f]">
          Visuel du projet à venir
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative block h-full w-full overflow-hidden rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a56b] focus-visible:ring-offset-2 ${className}`}
      aria-label={`Agrandir le visuel de ${projectName}`}
    >
      <img
        src={image.url}
        alt={image.alt || projectName}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {label}
        </span>
      )}
      <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg bg-black/55 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
        <Expand className="size-4" />
      </span>
    </button>
  );
}

export default function ProjectDetailPageV5({ projectSlug }: ProjectDetailPageProps) {
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectSlug);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const galleryImages = useMemo<ProjectImage[]>(() => {
    if (!project) return [];
    return (project.images ?? [])
      .filter((image) => ['gallery', 'exterior', 'interior', 'amenity', 'architecture'].includes(image.type) && Boolean(image.url))
      .sort((a, b) => a.order - b.order);
  }, [project]);

  if (isLoading) return <ProjectDetailSkeleton />;

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-[#17232a]">Projet introuvable</h1>
          <p className="mt-3 text-sm leading-6 text-[#73766f]">Le projet demandé n'est pas disponible.</p>
          <Button className="mt-6 bg-[#17232a] text-white hover:bg-[#263740]" onClick={() => router.goProjects()}>
            <ArrowLeft className="size-4" />
            Retour aux projets
          </Button>
        </div>
      </main>
    );
  }

  const apartments = project.apartments ?? [];
  const available = apartments.filter((apartment) => apartment.status === 'AVAILABLE' || apartment.status === 'COMING_SOON');
  const apartmentTypes = (() => {
    const fromProject = safeParseArray(project.apartmentTypes);
    return fromProject.length
      ? fromProject
      : [...new Set(available.map((apartment) => apartment.apartmentType).filter(Boolean))];
  })();
  const filteredApartments = typeFilter
    ? available.filter((apartment) => apartment.apartmentType === typeFilter)
    : available;

  const heroImage = project.images?.find((image) => image.type === 'hero' && image.url)?.url
    ?? galleryImages[0]?.url
    ?? '';

  const amenities: Amenity[] = [
    project.hasSecurity ? { label: 'Résidence sécurisée', detail: 'Accès contrôlé', icon: ShieldCheck } : null,
    project.hasGarden ? { label: 'Espaces verts', detail: 'Cadre extérieur soigné', icon: TreePine } : null,
    project.hasParking ? { label: 'Parking', detail: 'Sous-sol et extérieur', icon: Car } : null,
    project.hasPool ? { label: 'Piscine', detail: 'Espace commun', icon: Waves } : null,
    project.hasElevator ? { label: 'Accès facilité', detail: 'Ascenseur', icon: Building2 } : null,
  ].filter((item): item is Amenity => Boolean(item));

  const mapReady = typeof project.latitude === 'number' && typeof project.longitude === 'number';
  const mapProject = mapReady
    ? [{
        slug: project.slug,
        name: project.name,
        status: project.status,
        district: project.district,
        city: project.city,
        latitude: project.latitude as number,
        longitude: project.longitude as number,
      }]
    : [];

  const whatsappMessage = `Bonjour, je suis intéressé(e) par le projet ${project.name} à ${project.district}. Je souhaite connaître les disponibilités.`;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.name, text: `Découvrez ${project.name}`, url });
      } catch {
        // User cancelled native sharing.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable in restricted browser contexts.
    }
  };

  const openGallery = (index: number) => {
    if (!galleryImages[index]?.url) return;
    setActiveGalleryIndex(index);
  };

  return (
    <main className="min-h-screen bg-[#f7f5ef] pb-16 sm:pb-0">
      <JsonLd
        data={projectSchema({
          name: project.name,
          description: project.description ?? undefined,
          district: project.district,
          city: project.city,
          address: project.address ?? undefined,
          latitude: project.latitude ?? undefined,
          longitude: project.longitude ?? undefined,
          startingPrice: project.startingPrice ?? undefined,
          priceOnRequest: project.priceOnRequest,
          deliveryYear: project.deliveryYear ?? undefined,
          deliveryQuarter: project.deliveryQuarter ?? undefined,
          apartmentTypes: project.apartmentTypes,
          heroImage: heroImage || undefined,
          amenities: project.amenities?.map((item) => item.name),
          ...(project.slug ? { slug: project.slug } : {}),
        })}
      />

      {/* HERO — intentionally replaces the former project-detail opening */}
      <section className="relative min-h-[610px] overflow-hidden bg-[#17232a] text-white sm:min-h-[650px]">
        <div className="absolute inset-0">
          {heroImage ? (
            <img src={heroImage} alt={project.name} className="h-full w-full object-cover" fetchPriority="high" />
          ) : (
            <div className="h-full w-full bg-[#17232a]" aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
        </div>

        <div className="relative mx-auto flex min-h-[610px] max-w-[1440px] flex-col justify-between px-5 pb-8 pt-28 sm:min-h-[650px] sm:px-8 sm:pb-12 lg:px-10">
          <div>
            <Breadcrumbs
              items={[
                { label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' },
                { label: project.name, hashUrl: `/projects/${project.slug}` },
              ]}
            />
            <button
              type="button"
              onClick={() => router.goProjects()}
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-white/85 transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Retour aux projets
            </button>
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_370px] lg:gap-14">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} type="project" />
                <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  {project.projectType === 'RESIDENTIAL' ? 'Résidentiel' : project.projectType === 'MIXED_USE' ? 'Mixte' : project.projectType}
                </span>
              </div>
              <h1 className="max-w-4xl text-[42px] font-medium leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[76px]">
                {project.name}
              </h1>
              {project.tagline && (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                  {project.tagline}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/85">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" />
                  {project.district}, {project.city}
                </span>
                {project.deliveryYear && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    Livraison {project.deliveryQuarter ? `Q${project.deliveryQuarter} ` : ''}{project.deliveryYear}
                  </span>
                )}
              </div>
            </div>

            <aside className="rounded-2xl border border-white/15 bg-[#17232a]/88 p-5 shadow-2xl backdrop-blur-md sm:p-6">
              {project.startingPrice && !project.priceOnRequest ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-white/55">À partir de</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-[#e0bb7a] sm:text-[34px]">{formatPrice(project.startingPrice)}</p>
                </>
              ) : (
                <p className="text-2xl font-semibold">Prix sur demande</p>
              )}
              <p className="mt-2 text-xs leading-5 text-white/60">
                {available.length > 0
                  ? `${available.length} logement${available.length > 1 ? 's' : ''} à découvrir`
                  : 'Consultez les possibilités auprès d’ASAS'}
              </p>
              <Button
                size="lg"
                onClick={() => document.getElementById('project-inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mt-5 min-h-12 w-full bg-[#d9b16e] text-[#17232a] shadow-lg hover:bg-[#e4bd7c]"
              >
                Voir les disponibilités
                <ArrowRight className="size-4" />
              </Button>
              <a
                href={getWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <button type="button" onClick={share} className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-white/65 hover:text-white">
                  <Share2 className="size-4" />
                  {shareCopied ? 'Lien copié' : 'Partager'}
                </button>
                <a href={getPhoneUrl()} className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-white/65 hover:text-white">
                  <Phone className="size-4" />
                  Appeler
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FACTS STRIP */}
      <section className="bg-white px-5 py-5 shadow-[0_10px_35px_rgba(23,35,42,0.05)] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-[#ebe8df] overflow-hidden rounded-2xl border border-[#ebe8df] lg:grid-cols-6 lg:divide-y-0">
          {[
            { icon: MapPin, label: 'Emplacement', value: project.district },
            { icon: Building2, label: 'Type de projet', value: project.projectType === 'RESIDENTIAL' ? 'Résidentiel' : project.projectType === 'MIXED_USE' ? 'Mixte' : project.projectType },
            { icon: Building2, label: 'Nombre d’immeubles', value: project.buildingCount != null ? String(project.buildingCount) : '—' },
            { icon: Home, label: 'Nombre d’unités', value: String(apartments.length) },
            { icon: CalendarDays, label: 'Livraison prévue', value: project.deliveryYear ? `${project.deliveryQuarter ? `Q${project.deliveryQuarter} ` : ''}${project.deliveryYear}` : '—' },
            { icon: Layers3, label: 'Typologies', value: apartmentTypes.length ? apartmentTypes.join(' · ') : '—' },
          ].map((fact) => (
            <div key={fact.label} className="flex min-h-[108px] flex-col justify-center gap-2 px-4 py-5 sm:px-6">
              <fact.icon className="size-5 text-[#17232a]" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#85877f]">{fact.label}</span>
              <span className="text-sm font-semibold text-[#17232a]">{fact.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#6c806f]">Le projet</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#17232a] sm:text-3xl">Découvrez les espaces</h2>
            </div>
            {galleryImages.length > 0 && <span className="text-xs font-medium text-[#85877f]">{galleryImages.length} visuel{galleryImages.length > 1 ? 's' : ''}</span>}
          </div>

          <div className="grid h-auto gap-4 lg:h-[470px] lg:grid-cols-[1.9fr_0.9fr]">
            <GalleryTile image={galleryImages[0]} projectName={project.name} className="min-h-[340px] lg:min-h-0" onOpen={() => openGallery(0)} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-3">
              <GalleryTile image={galleryImages[1]} projectName={project.name} label="Extérieurs" className="min-h-[190px] lg:min-h-0" onOpen={() => openGallery(1)} />
              <GalleryTile image={galleryImages[2]} projectName={project.name} label="Espaces communs" className="min-h-[190px] lg:min-h-0" onOpen={() => openGallery(2)} />
              <GalleryTile image={galleryImages[3]} projectName={project.name} label="Intérieurs" className="min-h-[190px] lg:min-h-0" onOpen={() => openGallery(3)} />
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Navigation des visuels">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => openGallery(index)}
                  className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${activeGalleryIndex === index ? 'border-[#c7a56b]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  aria-label={`Visuel ${index + 1}`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROJECT ESSENTIALS */}
      <section className="bg-[#f7f5ef] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#6c806f]">L’essentiel</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-[#17232a] sm:text-3xl">Un cadre de vie pensé pour le quotidien</h2>
            {project.description && (
              <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-7 text-[#646860] sm:text-base">
                {project.description}
              </p>
            )}

            {amenities.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {amenities.map(({ label, detail, icon: Icon }) => (
                  <div key={label} className="min-w-0">
                    <Icon className="size-6 text-[#17232a]" aria-hidden="true" />
                    <p className="mt-3 text-xs font-semibold text-[#17232a]">{label}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#777a72]">{detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e5e1d7] bg-white p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-[#17232a]">Détails du projet</h3>
            <dl className="mt-5 divide-y divide-[#ebe8df] text-sm">
              {[
                ['Type de projet', project.projectType === 'RESIDENTIAL' ? 'Résidentiel' : project.projectType === 'MIXED_USE' ? 'Mixte' : project.projectType],
                ['Nombre d’immeubles', project.buildingCount != null ? String(project.buildingCount) : '—'],
                ['Nombre d’unités', String(apartments.length)],
                ['Livraison prévue', project.deliveryYear ? `${project.deliveryQuarter ? `Q${project.deliveryQuarter} ` : ''}${project.deliveryYear}` : '—'],
                ['Emplacement', `${project.district}, ${project.city}`],
                ['Typologies', apartmentTypes.length ? apartmentTypes.join(' · ') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[1fr_auto] gap-4 py-3">
                  <dt className="text-[#777a72]">{label}</dt>
                  <dd className="text-right font-medium text-[#30383d]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-xl border border-[#eadfcb] bg-[#fbf7ef] p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#8b6a35]" />
                <div>
                  <p className="text-xs font-semibold text-[#30383d]">Un projet présenté avec clarté</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#777a72]">Les informations affichées proviennent des données disponibles sur le projet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION + NEIGHBORHOOD */}
      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-[#e5e1d7] bg-[#f7f5ef]">
            <div className="grid min-h-[360px] lg:grid-cols-[1.55fr_0.85fr]">
              <div className="min-h-[300px]">
                {mapReady ? (
                  <ProjectMap projects={mapProject} singleProject className="h-full min-h-[360px] rounded-none border-0" />
                ) : (
                  <div className="flex h-full min-h-[360px] items-center justify-center bg-[#e9e8e2] px-8 text-center text-sm text-[#777a72]">
                    <div>
                      <Navigation className="mx-auto size-7 text-[#17232a]" />
                      <p className="mt-3 font-semibold text-[#30383d]">Localisation du projet</p>
                      <p className="mt-1">{project.district}, {project.city}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center border-t border-[#e5e1d7] p-6 lg:border-l lg:border-t-0 sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#6c806f]">Emplacement du projet</p>
                <h3 className="mt-3 text-xl font-semibold text-[#17232a]">{project.district}, {project.city}</h3>
                {project.address && <p className="mt-2 text-xs leading-5 text-[#777a72]">{project.address}</p>}
                {mapReady && (
                  <a
                    href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-[#cfc7b8] bg-white px-4 text-xs font-semibold text-[#17232a] hover:border-[#17232a]"
                  >
                    Voir sur la carte
                    <ArrowRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[#17232a] text-white">
            {galleryImages[0]?.url && <img src={galleryImages[0].url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="lazy" />}
            <div className="absolute inset-0 bg-gradient-to-r from-[#17232a]/95 via-[#17232a]/75 to-[#17232a]/35" />
            <div className="relative flex h-full flex-col justify-center p-7 sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#d9b16e]">Votre recherche immobilière</p>
              <h3 className="mt-3 max-w-sm text-2xl font-semibold leading-tight">Un emplacement qui mérite d’être découvert</h3>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70">Échangez avec ASAS pour obtenir les informations utiles sur le projet et organiser votre prochaine étape.</p>
              <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-[#d9b16e] px-5 text-sm font-semibold text-white transition hover:bg-[#d9b16e] hover:text-[#17232a]">
                Découvrir le projet
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section id="project-inventory" className="scroll-mt-20 bg-[#f7f5ef] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-7 lg:grid-cols-[300px_1fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#6c806f]">Disponibilités</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#17232a] sm:text-3xl">Les appartements disponibles</h2>
              <p className="mt-3 text-sm leading-6 text-[#777a72]">Des espaces sélectionnés selon les disponibilités réelles du projet.</p>
              {apartmentTypes.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtrer par typologie">
                  <button type="button" onClick={() => setTypeFilter('')} className={`min-h-10 rounded-full px-4 text-xs font-semibold ${!typeFilter ? 'bg-[#17232a] text-white' : 'border border-[#d8d4ca] bg-white text-[#30383d]'}`}>Tous</button>
                  {apartmentTypes.map((type) => (
                    <button key={type} type="button" onClick={() => setTypeFilter(type)} className={`min-h-10 rounded-full px-4 text-xs font-semibold ${typeFilter === type ? 'bg-[#17232a] text-white' : 'border border-[#d8d4ca] bg-white text-[#30383d]'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredApartments.slice(0, 3).map((apartment) => (
                <button
                  key={apartment.id}
                  type="button"
                  onClick={() => router.goApartment(project.slug, apartment.slug)}
                  className="group rounded-2xl border border-[#e2ded4] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#cdbd9f] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a56b]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xl font-semibold text-[#17232a]">{apartment.typeName}</span>
                      <p className="mt-1 text-xs text-[#777a72]">{apartment.surface} m²{apartment.floor != null ? ` · Étage ${apartment.floor}` : ''}</p>
                    </div>
                    <span className="flex size-9 items-center justify-center rounded-full border border-[#ded8cb] text-[#17232a] transition group-hover:bg-[#17232a] group-hover:text-white">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#ebe8df] pt-4 text-xs text-[#666a63]">
                    <span className="inline-flex items-center gap-2"><BedDouble className="size-4" />{apartment.bedrooms} chambre{apartment.bedrooms > 1 ? 's' : ''}</span>
                    <span className="inline-flex items-center gap-2"><Bath className="size-4" />{apartment.bathrooms} salle{apartment.bathrooms > 1 ? 's' : ''} de bain</span>
                    {apartment.balconies > 0 && <span className="inline-flex items-center gap-2"><Home className="size-4" />Balcon</span>}
                    {apartment.orientation && <span className="inline-flex items-center gap-2"><Compass className="size-4" />{apartment.orientation}</span>}
                  </div>
                  <div className="mt-5 border-t border-[#ebe8df] pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#85877f]">Prix</p>
                    <p className="mt-1 text-lg font-semibold text-[#17232a]">{apartment.priceOnRequest || !apartment.price ? 'Prix sur demande' : formatPrice(apartment.price)}</p>
                  </div>
                </button>
              ))}

              {filteredApartments.length === 0 && (
                <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-[#d9d4c9] bg-white p-8 text-sm text-[#777a72]">
                  Aucune disponibilité ne correspond à ce filtre.
                </div>
              )}
            </div>
          </div>

          {available.length > 3 && (
            <div className="mt-7 flex justify-center">
              <Button variant="outline" onClick={() => router.goApartments(project.slug)} className="min-h-11 border-[#cfc7b8] bg-white text-[#17232a] hover:bg-[#eeeae0]">
                Voir toutes les unités
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FINAL CONVERSION BLOCK */}
      <section id="project-contact" className="scroll-mt-20 bg-[#17232a] px-5 py-10 text-white sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-[1440px] rounded-2xl border border-white/10 bg-[#111d23] px-5 py-7 shadow-2xl sm:px-8 sm:py-9 lg:px-10">
          <div className="grid gap-9 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#d9b16e]">Votre projet immobilier</p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">Vous avez un projet immobilier ?</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Notre équipe est à votre écoute pour vous accompagner et vous fournir les informations nécessaires.</p>
              <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {[
                  { icon: Check, label: 'Informations sur le projet' },
                  { icon: Check, label: 'Disponibilités des unités' },
                  { icon: MapPin, label: 'Visite sur site' },
                  { icon: ShieldCheck, label: 'Documents et suivi' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-xs text-white/65">
                    <span className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/5"><Icon className="size-4 text-[#d9b16e]" /></span>
                    <span className="mt-2 block leading-5">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 text-[#17232a] sm:p-6">
              <LeadForm projectId={project.id} projectName={project.name} intent="REQUEST_INFORMATION" showWhatsApp showPhone />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5e1d7] bg-[#f7f5ef] px-5 py-9 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#17232a]">Vous souhaitez comparer plusieurs projets ?</p>
            <p className="mt-1 text-xs text-[#777a72]">Retournez au catalogue pour poursuivre votre recherche.</p>
          </div>
          <Button variant="outline" onClick={() => router.goProjects()} className="min-h-11 border-[#cfc7b8] bg-white text-[#17232a]">
            Retour aux projets
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* Fullscreen gallery viewer */}
      {galleryImages[activeGalleryIndex]?.url && (
        <div className="sr-only" aria-live="polite">Visuel sélectionné {activeGalleryIndex + 1} sur {galleryImages.length}</div>
      )}
    </main>
  );
}
