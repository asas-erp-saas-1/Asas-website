'use client';

import { useRouter } from '@/lib/router';
import { formatPrice } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { useFavorites } from '@/lib/favorites';
import { AvailabilityBadge } from '@/components/shared/AvailabilityBadge';
import { Button } from '@/components/ui/button';
import { MapPin, Ruler, Calendar, ArrowRight, CheckCircle2, Clock, XCircle, Heart } from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';
import type { Project } from '@/lib/types';

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm animate-pulse" aria-hidden="true">
      <div className="aspect-[4/3] bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-4"><div className="h-5 w-24 rounded-md bg-muted" /><div className="h-4 w-32 rounded bg-muted" /><div className="h-4 w-24 rounded bg-muted" /><div className="mt-auto h-6 w-32 rounded bg-muted" /><div className="h-9 w-full rounded-md bg-muted" /></div>
    </div>
  );
}

interface ProjectCardProps { project: PublicProjectCard | Project; }

type LegacyProject = Project & { apartments?: NonNullable<Project['apartments']>; };

function toPublicCard(project: PublicProjectCard | Project): PublicProjectCard {
  if (!('apartments' in project)) return project;
  const legacy = project as LegacyProject;
  const apartments = legacy.apartments ?? [];
  const hero = legacy.images?.find((image) => image.type === 'hero') ?? legacy.images?.find((image) => image.type === 'gallery') ?? legacy.images?.[0];
  return {
    id: legacy.id,
    slug: legacy.slug,
    name: legacy.name,
    tagline: legacy.tagline,
    city: legacy.city,
    district: legacy.district,
    projectType: legacy.projectType,
    status: legacy.status,
    latitude: legacy.latitude,
    longitude: legacy.longitude,
    startingPrice: legacy.startingPrice,
    priceOnRequest: legacy.priceOnRequest,
    minSurface: legacy.minSurface,
    maxSurface: legacy.maxSurface,
    deliveryYear: legacy.deliveryYear,
    deliveryQuarter: legacy.deliveryQuarter,
    apartmentTypes: legacy.apartmentTypes,
    hasParking: legacy.hasParking,
    hasElevator: legacy.hasElevator,
    hasGarden: legacy.hasGarden,
    hasPool: legacy.hasPool,
    featured: legacy.featured,
    image: hero ? { id: hero.id, url: hero.url, alt: hero.alt, type: hero.type } : undefined,
    apartmentCount: apartments.length,
    availableApartmentCount: apartments.filter((apartment) => apartment.status === 'AVAILABLE' || apartment.status === 'COMING_SOON').length,
    reservedApartmentCount: apartments.filter((apartment) => apartment.status === 'RESERVED').length,
  };
}

function apartmentTypeList(apartmentTypes: string): string[] {
  if (!apartmentTypes) return [];
  try {
    const parsed: unknown = JSON.parse(apartmentTypes);
    if (Array.isArray(parsed)) return parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch { /* legacy comma-separated format */ }
  return apartmentTypes.split(',').map((type) => type.trim()).filter(Boolean);
}

export function ProjectCard({ project: source }: ProjectCardProps) {
  const project = toPublicCard(source);
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(project.id);
  const types = apartmentTypeList(project.apartmentTypes);
  const imageUrl = project.image?.url ?? '/images/brand/hero.jpg';
  const surfaceRange = project.minSurface && project.maxSurface ? `${project.minSurface} - ${project.maxSurface} m²` : project.minSurface ? `À partir de ${project.minSurface} m²` : null;
  const deliveryInfo = project.deliveryYear && project.deliveryQuarter ? `${project.deliveryQuarter} ${project.deliveryYear}` : project.deliveryYear ? `${project.deliveryYear}` : null;
  const statusConfig = project.status === 'AVAILABLE' ? { icon: CheckCircle2, label: 'En commercialisation', bgClass: 'bg-forest/90' } : project.status === 'COMING_SOON' ? { icon: Clock, label: 'Bientôt', bgClass: 'bg-gold/90' } : { icon: XCircle, label: 'Épuisé', bgClass: 'bg-charcoal/70' };
  const { icon: StatusIcon, label: statusLabel, bgClass } = statusConfig;

  const goToProject = () => { trackEvent('project_card_click', { project_slug: project.slug, project_name: project.name }); router.goProject(project.slug); };
  const handleToggleFavorite = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(project.id); trackEvent(isFav ? 'favorite_remove' : 'favorite_add', { project_slug: project.slug }); };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={imageUrl} alt={project.image?.alt ?? project.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
        <button type="button" onClick={handleToggleFavorite} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFav} className="absolute left-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/35 focus-visible:ring-2 focus-visible:ring-white"><Heart className={`size-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white/90'}`} /></button>
        <div className="absolute right-0 top-0 z-10"><div className={`${bgClass} inline-flex items-center gap-1 rounded-bl-xl px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm`}><StatusIcon className="size-3" /> {statusLabel}</div></div>
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4"><h3 className="text-lg font-semibold leading-tight text-white">{project.name}</h3><div className="mt-1 flex items-center gap-1 text-sm text-white/80"><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span>{project.district}, {project.city}</span></div></div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {types.length > 0 && <div className="flex flex-wrap gap-1.5">{types.slice(0, 3).map((type) => <span key={type} className="inline-flex rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">{type}</span>)}{types.length > 3 && <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{types.length - 3}</span>}</div>}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{surfaceRange && <div className="flex items-center gap-1.5"><Ruler className="size-3.5 text-forest/60" aria-hidden="true" /><span>{surfaceRange}</span></div>}{deliveryInfo && <div className="flex items-center gap-1.5"><Calendar className="size-3.5 text-forest/60" aria-hidden="true" /><span>{deliveryInfo}</span></div>}</div>
        {project.apartmentCount > 0 && <AvailabilityBadge available={project.availableApartmentCount} reserved={project.reservedApartmentCount} total={project.apartmentCount} />}
        <div className="mt-auto border-t border-border/60 pt-3">{project.priceOnRequest || !project.startingPrice ? <p className="text-base font-semibold text-forest">Prix sur demande</p> : <><span className="text-xs text-muted-foreground">À partir de</span><p className="text-xl font-semibold tabular-nums text-forest">{formatPrice(project.startingPrice)}</p></>}</div>
        <Button variant="default" size="sm" className="mt-0 h-10 w-full bg-forest text-white hover:bg-forest-dark" onClick={goToProject}>Voir le projet <ArrowRight className="ml-1 size-4" /></Button>
      </div>
    </article>
  );
}
