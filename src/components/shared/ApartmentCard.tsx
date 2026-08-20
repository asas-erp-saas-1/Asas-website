'use client';

import { useRouter } from '@/lib/router';
import { formatPrice, formatSurface } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { CompareButton } from '@/components/shared/CompareButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bed, Bath, Layers, Compass, ArrowRight, Building2, Flower2, TreePine } from 'lucide-react';
import type { Apartment, ApartmentImage } from '@/lib/types';

interface ApartmentCardProps {
  apartment: Apartment;
  projectSlug: string;
}

export function ApartmentCard({ apartment, projectSlug }: ApartmentCardProps) {
  const router = useRouter();

  /* Get render image from structured images array */
  const getRenderImage = (images?: ApartmentImage[]): string | null => {
    const hero = images?.find(img => img.type === 'hero');
    if (hero) return hero.url;
    const firstGallery = images?.find(img => img.type === 'gallery');
    if (firstGallery) return firstGallery.url;
    return images?.[0]?.url ?? null;
  };

  /* Colored left border based on apartment status */
  const statusBorder =
    apartment.status === 'AVAILABLE'
      ? 'border-l-forest'
      : apartment.status === 'RESERVED'
        ? 'border-l-gold'
        : 'border-l-charcoal';

  /* Per m² price calculation */
  const pricePerSqm =
    apartment.price && apartment.surface > 0
      ? Math.round(apartment.price / apartment.surface)
      : null;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 hover:border-forest/30 cursor-pointer border-l-4 ${statusBorder} card-glow apartment-border-pulse`}
      onClick={() => router.goApartment(projectSlug, apartment.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.goApartment(projectSlug, apartment.slug);
        }
      }}>
      <div className="flex flex-col gap-3 p-4">
        {/* Header: Type badge + Status + Favorite */}
        <div className="relative flex items-center justify-between gap-2 -m-1 px-3 py-1 rounded-lg overflow-hidden">
          {/* Subtle gradient overlay behind the type badge area */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-forest/10 via-forest/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="relative flex items-center gap-2 flex-wrap">
            {/* Type badge with shimmer animation */}
            <Badge className="bg-forest text-white text-sm font-bold px-3 py-1 shadow-sm shimmer-badge relative overflow-hidden">
              <span className="relative z-10">{apartment.typeName}</span>
            </Badge>
            <StatusBadge status={apartment.status} type="apartment" />
          </div>
          <div className="relative flex items-center gap-2">
            {/* Floor indicator badge */}
            {apartment.floor != null && (
              <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                É{apartment.floor}
              </span>
            )}
            {/* Building code badge */}
            {apartment.building?.code && (
              <span className="inline-flex items-center rounded-md bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
                {apartment.building.code}
              </span>
            )}
            <FavoriteButton apartmentId={apartment.id} variant="icon" />
            <ShareButton variant="icon" />
          </div>
        </div>

        {/* Surface - prominent with gradient text */}
        <div className="text-center py-3 border-y border-border">
          <span className="text-4xl font-bold gradient-text-forest">
            {apartment.surface}
          </span>
          <span className="text-lg font-medium text-forest/60 ml-1">m²</span>
        </div>

        {/* Details grid with colored icon circles */}
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {/* Floor */}
          {apartment.floor != null && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center rounded-full bg-gold/10 p-1">
                <Layers className="size-3.5 text-gold" />
              </span>
              <span>Etage {apartment.floor}{apartment.totalFloors ? `/${apartment.totalFloors}` : ''}</span>
            </div>
          )}

          {/* Orientation */}
          {apartment.orientation && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center rounded-full bg-forest/10 p-1">
                <Compass className="size-3.5 text-forest" />
              </span>
              <span>{apartment.orientation}</span>
            </div>
          )}

          {/* Bedrooms */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center rounded-full bg-forest/10 p-1">
              <Bed className="size-3.5 text-forest" />
            </span>
            <span>{apartment.bedrooms} chambre{apartment.bedrooms > 1 ? 's' : ''}</span>
          </div>

          {/* Bathrooms */}
          {apartment.bathrooms != null && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-500/10 p-1">
                <Bath className="size-3.5 text-blue-500" />
              </span>
              <span>{apartment.bathrooms} SDB</span>
            </div>
          )}
        </div>

        {/* Balcony info */}
        {apartment.balconies != null && apartment.balconies > 0 && (
          <p className="text-xs text-muted-foreground">
            {apartment.balconies} balcon{apartment.balconies > 1 ? 's' : ''}
            {apartment.balconySurface ? ` (${apartment.balconySurface} m\u00B2)` : ''}
          </p>
        )}

        {/* Terrace & Garden info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {apartment.hasTerrace && (
            <span className="inline-flex items-center gap-1">
              <Flower2 className="size-3.5 text-forest" />
              Terrasse{apartment.terraceSurface ? ` ${apartment.terraceSurface} m\u00B2` : ''}
            </span>
          )}
          {apartment.hasGarden && (
            <span className="inline-flex items-center gap-1">
              <TreePine className="size-3.5 text-forest" />
              Jardin{apartment.gardenSurface ? ` ${apartment.gardenSurface} m\u00B2` : ''}
            </span>
          )}
        </div>

        {/* Price with enhanced per m² indicator */}
        <div className="mt-auto pt-3 border-t border-border">
          {apartment.priceOnRequest || !apartment.price ? (
            <p className="text-lg font-bold text-forest">Prix sur demande</p>
          ) : (
            <div>
              <p className="text-2xl font-bold text-forest tabular-nums">
                {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(apartment.price)}
                <span className="text-base font-semibold ml-1 text-forest/70">DA</span>
              </p>
              {pricePerSqm != null && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums inline-flex items-center gap-1">
                  <span className="inline-block size-1 rounded-full bg-forest/40" />
                  {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(pricePerSqm)} DA/m²
                </p>
              )}
            </div>
          )}
        </div>

        {/* CTA + Compare with Framer Motion */}
        <div className="flex items-stretch gap-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              variant="default"
              size="sm"
              className="w-full bg-forest hover:bg-forest-dark text-white group-hover:bg-forest-dark group-hover:shadow-md"
              onClick={() => router.goApartment(projectSlug, apartment.slug)}
            >
              Voir la fiche
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
          <CompareButton apartmentId={apartment.id} variant="icon" />
        </div>
      </div>
    </div>
  );
}

export function ApartmentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-8 bg-muted animate-pulse rounded w-1/2 mx-auto" />
        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        <div className="h-5 bg-muted animate-pulse rounded w-1/3 pt-2" />
      </div>
    </div>
  );
}
