'use client';

import { useRouter } from '@/lib/router';
import { formatPrice } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { useFavorites } from '@/lib/favorites';
import { AvailabilityBadge } from '@/components/shared/AvailabilityBadge';
import { Button } from '@/components/ui/button';
import { MapPin, Ruler, Calendar, ArrowRight, CheckCircle2, Clock, XCircle, Heart, Building2 } from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

export function ProjectCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm animate-pulse" aria-hidden="true">
      <div className="aspect-[4/3] bg-muted" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4"><div className="h-5 w-24 rounded-md bg-muted" /><div className="h-4 w-32 rounded bg-muted" /><div className="h-4 w-24 rounded bg-muted" /><div className="mt-auto h-6 w-32 rounded bg-muted" /><div className="h-9 w-full rounded-md bg-muted" /></div>
    </div>
  );
}

interface ProjectCardProps { project: PublicProjectCard; }

function apartmentTypeList(apartmentTypes: string): string[] {
  if (!apartmentTypes) return [];
  try {
    const parsed: unknown = JSON.parse(apartmentTypes);
    if (Array.isArray(parsed)) return parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch { /* legacy comma-separated storage is still supported at the contract boundary */ }
  return apartmentTypes.split(',').map((type) => type.trim()).filter(Boolean);
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(project.id);
  const types = apartmentTypeList(project.apartmentTypes);
  const surfaceRange = project.minSurface && project.maxSurface ? `${project.minSurface} - ${project.maxSurface} m²` : project.minSurface ? `À partir de ${project.minSurface} m²` : null;
  const deliveryInfo = project.deliveryYear && project.deliveryQuarter ? `${project.deliveryQuarter} ${project.deliveryYear}` : project.deliveryYear ? `${project.deliveryYear}` : null;
  const statusConfig = project.status === 'AVAILABLE' ? { icon: CheckCircle2, label: 'En commercialisation', bgClass: 'bg-forest/90' } : project.status === 'COMING_SOON' ? { icon: Clock, label: 'Bientôt', bgClass: 'bg-gold/90' } : { icon: XCircle, label: 'Épuisé', bgClass: 'bg-charcoal/70' };
  const { icon: StatusIcon, label: statusLabel, bgClass } = statusConfig;

  const goToProject = () => { trackEvent('project_card_click', { project_slug: project.slug, project_name: project.name }); router.goProject(project.slug); };
  const handleToggleFavorite = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(project.id); trackEvent(isFav ? 'favorite_remove' : 'favorite_add', { project_slug: project.slug }); };

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {project.image?.url ? (
          <img src={project.image.url} alt={project.image.alt ?? project.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest/10 via-muted to-gold/10" aria-label={`Image non disponible pour ${project.name}`}>
            <Building2 className="size-12 text-forest/35" aria-hidden="true" />
          </div>
        )}
        {project.image?.url && <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />}
        <button type="button" onClick={handleToggleFavorite} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFav} className="absolute left-3 top-3 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/35 focus-visible:ring-2 focus-visible:ring-white"><Heart className={`size-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white/90'}`} /></button>
        <div className="absolute right-0 top-0 z-10"><div className={`${bgClass} inline-flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-bl-xl px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm`}><StatusIcon className="size-3 shrink-0" /> <span className="truncate">{statusLabel}</span></div></div>
        <div className={`absolute bottom-0 left-0 right-0 z-10 min-w-0 p-4 ${project.image?.url ? '' : 'border-t border-border bg-card'}`}><h3 className={`break-words text-lg font-semibold leading-tight ${project.image?.url ? 'text-white' : 'text-foreground'}`}>{project.name}</h3><div className={`mt-1 flex min-w-0 items-center gap-1 text-sm ${project.image?.url ? 'text-white/80' : 'text-muted-foreground'}`}><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{project.district}, {project.city}</span></div></div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        {types.length > 0 && <div className="flex min-w-0 flex-wrap gap-1.5">{types.slice(0, 3).map((type) => <span key={type} className="inline-flex max-w-full break-words rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">{type}</span>)}{types.length > 3 && <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{types.length - 3}</span>}</div>}
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm text-muted-foreground">{surfaceRange && <div className="flex min-w-0 items-center gap-1.5"><Ruler className="size-3.5 shrink-0 text-forest/60" aria-hidden="true" /><span className="break-words">{surfaceRange}</span></div>}{deliveryInfo && <div className="flex min-w-0 items-center gap-1.5"><Calendar className="size-3.5 shrink-0 text-forest/60" aria-hidden="true" /><span className="break-words">{deliveryInfo}</span></div>}</div>
        {project.apartmentCount > 0 && <AvailabilityBadge available={project.availableApartmentCount} reserved={project.reservedApartmentCount} total={project.apartmentCount} />}
        <div className="mt-auto min-w-0 border-t border-border/60 pt-3">{project.priceOnRequest || !project.startingPrice ? <p className="break-words text-base font-semibold text-forest">Prix sur demande</p> : <><span className="text-xs text-muted-foreground">À partir de</span><p className="max-w-full break-words text-xl font-semibold tabular-nums text-forest">{formatPrice(project.startingPrice)}</p></>}</div>
        <Button variant="default" size="sm" className="mt-0 min-h-11 h-11 w-full bg-forest text-white hover:bg-forest-dark" onClick={goToProject}>Voir le projet <ArrowRight className="ml-1 size-4 shrink-0" /></Button>
      </div>
    </article>
  );
}