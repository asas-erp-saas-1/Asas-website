'use client';

import { useCallback } from 'react';
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
  Building2,
  Home,
} from 'lucide-react';
import type { Project, ProjectImage } from '@/lib/types';

// Skeleton loader for ProjectCard
export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex gap-1.5">
          <div className="h-5 w-10 rounded-md bg-muted" />
          <div className="h-5 w-8 rounded-md bg-muted" />
        </div>
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-6 w-32 rounded bg-muted mt-auto" />
        <div className="h-9 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(project.id);

  const goToProject = () => {
    trackEvent('project_card_click', {
      project_slug: project.slug,
      project_name: project.name,
    });
    router.goProject(project.slug);
  };

  const surfaceRange = () => {
    if (project.minSurface && project.maxSurface) {
      return `${project.minSurface} - ${project.maxSurface} m\u00B2`;
    }
    if (project.minSurface) {
      return `À partir de ${project.minSurface} m\u00B2`;
    }
    return null;
  };

  const deliveryInfo = () => {
    if (project.deliveryYear && project.deliveryQuarter) {
      return `${project.deliveryQuarter} ${project.deliveryYear}`;
    }
    if (project.deliveryYear) {
      return `${project.deliveryYear}`;
    }
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

  /* Get hero image from structured images array */
  const getHeroImage = (images?: ProjectImage[]): string => {
    const hero = images?.find(img => img.type === 'hero');
    if (hero) return hero.url;
    const firstGallery = images?.find(img => img.type === 'gallery');
    if (firstGallery) return firstGallery.url;
    return images?.[0]?.url ?? '/images/brand/hero.jpg';
  };

  const imageUrl = getHeroImage(project.images);

  /* Status config */
  const statusConfig = () => {
    if (project.status === 'AVAILABLE') {
      return { icon: CheckCircle2, label: 'En commercialisation', bgClass: 'bg-forest/90' };
    }
    if (project.status === 'COMING_SOON') {
      return { icon: Clock, label: 'Bientôt', bgClass: 'bg-gold/90' };
    }
    return { icon: XCircle, label: 'Épuisé', bgClass: 'bg-charcoal/70' };
  };

  /* Price display */
  const startingPrice = project.startingPrice ?? 0;
  const showPrice = !project.priceOnRequest && startingPrice > 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(project.id);
    trackEvent(isFav ? 'favorite_remove' : 'favorite_add', {
      project_slug: project.slug,
    });
  };

  /* Available apartments count */
  const availableCount = project.apartments
    ? project.apartments.filter((a) => a.status === 'AVAILABLE' || a.status === 'COMING_SOON').length
    : 0;

  const totalApartments = project.apartments?.length ?? 0;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:border-forest/30 cursor-pointer"
      onClick={goToProject}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToProject();
        }
      }}
    >
      {/* Image - larger aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={project.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFav}
          className="absolute top-3 left-3 z-20 inline-flex items-center justify-center rounded-full size-8 bg-background/80 backdrop-blur-sm shadow border border-border/40 transition-all hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-forest"
        >
          <Heart
            className={`size-4 transition-colors ${
              isFav ? 'fill-red-500 text-red-500' : 'text-foreground/60 hover:text-red-400'
            }`}
          />
        </button>

        {/* Status badge */}
        {(() => {
          const { icon: StatusIcon, label, bgClass } = statusConfig();
          return (
            <div className="absolute top-0 right-0 z-10">
              <div className={`${bgClass} backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-bl-lg rounded-tr-xl inline-flex items-center gap-1`}>
                <StatusIcon className="size-3" />
                {label}
              </div>
            </div>
          );
        })()}

        {/* Title + Location overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-lg font-bold text-white leading-tight">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
            <MapPin className="size-3.5 shrink-0" />
            <span>{project.district}, {project.city}</span>
          </div>
        </div>
      </div>

      {/* Content - Clear hierarchy: types > details > availability > price > CTA */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Apartment types */}
        {apartmentTypeList().length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {apartmentTypeList().slice(0, 3).map((type) => (
              <span key={type} className="inline-flex items-center rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">
                {type}
              </span>
            ))}
            {apartmentTypeList().length > 3 && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                +{apartmentTypeList().length - 3}
              </span>
            )}
          </div>
        )}

        {/* Details: surface + delivery */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {surfaceRange() && (
            <div className="flex items-center gap-1.5">
              <Ruler className="size-3.5 text-forest/60" />
              <span>{surfaceRange()}</span>
            </div>
          )}
          {deliveryInfo() && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-forest/60" />
              <span>{deliveryInfo()}</span>
            </div>
          )}
        </div>

        {/* Available units count - prominently shown */}
        {totalApartments > 0 && (
          <div className="flex items-center gap-2">
            <AvailabilityBadge
              available={availableCount}
              reserved={project.apartments?.filter((a) => a.status === 'RESERVED').length ?? 0}
              total={totalApartments}
            />
          </div>
        )}

        {/* Starting Price - prominent */}
        <div className="mt-auto pt-2 border-t border-border/50">
          {project.priceOnRequest || !project.startingPrice ? (
            <p className="text-base font-bold text-forest">Prix sur demande</p>
          ) : (
            <div>
              <span className="text-xs text-muted-foreground">À partir de</span>
              <p className="text-xl font-bold text-forest tabular-nums">
                {formatPrice(startingPrice)}
              </p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          variant="default"
          size="sm"
          className="w-full bg-forest hover:bg-forest-dark text-white mt-1"
          onClick={(e) => {
            e.stopPropagation();
            goToProject();
          }}
        >
          Voir le projet
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
