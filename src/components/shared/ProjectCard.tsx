'use client';

import { useRouter } from '@/lib/router';
import { formatPrice } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { useFavorites } from '@/lib/favorites';
import { AvailabilityBadge } from '@/components/shared/AvailabilityBadge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Ruler,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Heart,
} from 'lucide-react';
import type { Project, ProjectImage } from '@/lib/types';

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm animate-pulse" aria-hidden="true">
      <div className="aspect-[4/3] bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-5 w-24 rounded-md bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-auto h-6 w-32 rounded bg-muted" />
        <div className="h-9 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}

interface ProjectCardProps { project: Project; }

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(project.id);

  const goToProject = () => {
    trackEvent('project_card_click', { project_slug: project.slug, project_name: project.name });
    router.goProject(project.slug);
  };

  const surfaceRange = () => {
    if (project.minSurface && project.maxSurface) return `${project.minSurface} - ${project.maxSurface} m²`;
    if (project.minSurface) return `À partir de ${project.minSurface} m²`;
    return null;
  };

  const deliveryInfo = () => {
    if (project.deliveryYear && project.deliveryQuarter) return `${project.deliveryQuarter} ${project.deliveryYear}`;
    if (project.deliveryYear) return `${project.deliveryYear}`;
    return null;
  };

  const apartmentTypeList = () => {
    if (!project.apartmentTypes) return [];
    try {
      const parsed = JSON.parse(project.apartmentTypes);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return project.apartmentTypes.split(',').map((t) => t.trim()).filter(Boolean);
    }
  };

  const getHeroImage = (images?: ProjectImage[]): string | null => {
    const hero = images?.find((img) => img.type === 'hero');
    if (hero) return hero.url;
    const gallery = images?.find((img) => img.type === 'gallery');
    if (gallery) return gallery.url;
    return images?.[0]?.url ?? null;
  };

  const imageUrl = getHeroImage(project.images);

  const statusConfig = () => {
    if (project.status === 'AVAILABLE') return { icon: CheckCircle2, label: 'En commercialisation', bgClass: 'bg-forest/90' };
    if (project.status === 'COMING_SOON') return { icon: Clock, label: 'Bientôt', bgClass: 'bg-gold/90' };
    return { icon: XCircle, label: 'Épuisé', bgClass: 'bg-charcoal/70' };
  };

  const startingPrice = project.startingPrice ?? 0;
  const availableCount = project.apartments?.filter((a) => a.status === 'AVAILABLE').length ?? 0;
  const reservedCount = project.apartments?.filter((a) => a.status === 'RESERVED').length ?? 0;
  const totalApartments = project.apartments?.length ?? 0;
  const types = apartmentTypeList();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(project.id);
    trackEvent(isFav ? 'favorite_remove' : 'favorite_add', { project_slug: project.slug });
  };

  const { icon: StatusIcon, label: statusLabel, bgClass } = statusConfig();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${project.name} — ${project.district}, ${project.city}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted px-4 text-center" role="img" aria-label={`Image du projet ${project.name} non disponible`}>
            <span className="text-sm text-muted-foreground">Image non disponible</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFav}
          className="absolute left-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/35 focus-visible:ring-2 focus-visible:ring-white"
        >
          <Heart className={`size-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white/90'}`} />
        </button>

        <div className="absolute right-0 top-0 z-10">
          <div className={`${bgClass} inline-flex items-center gap-1 rounded-bl-xl px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm`}>
            <StatusIcon className="size-3" /> {statusLabel}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <button
            type="button"
            onClick={goToProject}
            className="text-left text-lg font-semibold leading-tight text-white underline-offset-4 hover:underline focus-visible:rounded-sm"
          >
            {project.name}
          </button>
          <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{project.district}, {project.city}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Types de logements">
            {types.slice(0, 3).map((type) => <span key={type} className="inline-flex rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">{type}</span>)}
            {types.length > 3 && <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{types.length - 3}</span>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {surfaceRange() && <div className="flex items-center gap-1.5"><Ruler className="size-3.5 text-forest/60" aria-hidden="true" /><span>{surfaceRange()}</span></div>}
          {deliveryInfo() && <div className="flex items-center gap-1.5"><Calendar className="size-3.5 text-forest/60" aria-hidden="true" /><span>{deliveryInfo()}</span></div>}
        </div>

        {totalApartments > 0 && <AvailabilityBadge available={availableCount} reserved={reservedCount} total={totalApartments} />}

        <div className="mt-auto border-t border-border/60 pt-3">
          {project.priceOnRequest || !project.startingPrice ? (
            <p className="text-base font-semibold text-forest">Prix sur demande</p>
          ) : (
            <><span className="text-xs text-muted-foreground">À partir de</span><p className="text-xl font-semibold tabular-nums text-forest">{formatPrice(startingPrice)}</p></>
          )}
        </div>

        <Button variant="default" size="sm" className="mt-0 h-10 w-full bg-forest text-white hover:bg-forest-dark" onClick={goToProject}>
          Voir le projet <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </article>
  );
}
