'use client';

import { useRouter } from '@/lib/router';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { CompareButton } from '@/components/shared/CompareButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bed, Bath, Layers, Compass, ArrowRight, Flower2, TreePine } from 'lucide-react';
import type { PublicApartmentCard } from '@/lib/catalog-contracts';

type ApartmentCardData = Pick<PublicApartmentCard,
  | 'id' | 'slug' | 'status' | 'typeName' | 'floor' | 'totalFloors' | 'surface' | 'orientation'
  | 'bedrooms' | 'bathrooms' | 'balconies' | 'balconySurface' | 'hasParking'
  | 'parkingSpots' | 'hasTerrace' | 'terraceSurface' | 'hasGarden' | 'gardenSurface'
  | 'price' | 'priceOnRequest'
> & {
  building?: Pick<NonNullable<PublicApartmentCard['building']>, 'code'>;
};

interface ApartmentCardProps { apartment: ApartmentCardData; projectSlug: string; }

export function ApartmentCard({ apartment, projectSlug }: ApartmentCardProps) {
  const router = useRouter();
  const statusBorder = apartment.status === 'AVAILABLE' ? 'border-l-forest' : apartment.status === 'RESERVED' ? 'border-l-gold' : 'border-l-charcoal';
  const pricePerSqm = apartment.price && apartment.surface > 0 ? Math.round(apartment.price / apartment.surface) : null;

  const openApartment = () => router.goApartment(projectSlug, apartment.slug);

  return (
    <div
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-forest/30 hover:shadow-xl focus-within:border-forest/40 focus-within:ring-2 focus-within:ring-forest/20 border-l-4 ${statusBorder}`}
      onClick={openApartment}
      role="link"
      tabIndex={0}
      aria-label={`Découvrir ${apartment.typeName}, ${apartment.surface} m²`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openApartment(); } }}
    >
      <div className="flex min-w-0 flex-col gap-3 p-4">
        <div className="relative flex min-w-0 items-center justify-between gap-2 -m-1 px-3 py-1 rounded-lg overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-forest/10 via-forest/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex min-w-0 items-center gap-2 flex-wrap">
            <Badge className="bg-forest text-white text-sm font-bold px-3 py-1 shadow-sm relative overflow-hidden shrink-0"><span className="relative z-10">{apartment.typeName}</span></Badge>
            <StatusBadge status={apartment.status} type="apartment" />
          </div>
          <div className="relative flex shrink-0 items-center gap-1">
            {apartment.floor != null && <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">É{apartment.floor}</span>}
            {apartment.building?.code && <span className="inline-flex max-w-20 items-center truncate rounded-md bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">{apartment.building.code}</span>}
            <FavoriteButton apartmentId={apartment.id} variant="icon" />
            <ShareButton variant="icon" />
          </div>
        </div>

        <div className="border-y border-border py-3 text-center">
          <span className="text-4xl font-bold tracking-tight gradient-text-forest tabular-nums">{apartment.surface}</span>
          <span className="ml-1 text-lg font-medium text-forest/60">m²</span>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Surface habitable</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {apartment.floor != null && <div className="flex min-w-0 items-center gap-1.5"><span className="inline-flex shrink-0 items-center justify-center rounded-full bg-gold/10 p-1"><Layers className="size-3.5 text-gold" /></span><span className="min-w-0 truncate">Etage {apartment.floor}{apartment.totalFloors ? `/${apartment.totalFloors}` : ''}</span></div>}
          {apartment.orientation && <div className="flex min-w-0 items-center gap-1.5"><span className="inline-flex shrink-0 items-center justify-center rounded-full bg-forest/10 p-1"><Compass className="size-3.5 text-forest" /></span><span className="min-w-0 truncate">{apartment.orientation}</span></div>}
          <div className="flex min-w-0 items-center gap-1.5"><span className="inline-flex shrink-0 items-center justify-center rounded-full bg-forest/10 p-1"><Bed className="size-3.5 text-forest" /></span><span className="min-w-0 truncate">{apartment.bedrooms} chambre{apartment.bedrooms > 1 ? 's' : ''}</span></div>
          {apartment.bathrooms != null && <div className="flex min-w-0 items-center gap-1.5"><span className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-500/10 p-1"><Bath className="size-3.5 text-blue-500" /></span><span className="min-w-0 truncate">{apartment.bathrooms} SDB</span></div>}
        </div>

        {apartment.balconies != null && apartment.balconies > 0 && <p className="text-xs text-muted-foreground break-words">{apartment.balconies} balcon{apartment.balconies > 1 ? 's' : ''}{apartment.balconySurface ? ` (${apartment.balconySurface} m²)` : ''}</p>}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">{apartment.hasTerrace && <span className="inline-flex items-center gap-1"><Flower2 className="size-3.5 text-forest shrink-0" />Terrasse{apartment.terraceSurface ? ` ${apartment.terraceSurface} m²` : ''}</span>}{apartment.hasGarden && <span className="inline-flex items-center gap-1"><TreePine className="size-3.5 text-forest shrink-0" />Jardin{apartment.gardenSurface ? ` ${apartment.gardenSurface} m²` : ''}</span>}</div>

        <div className="mt-auto border-t border-border pt-3">
          {apartment.priceOnRequest || !apartment.price ? (
            <p className="text-lg font-bold text-forest break-words">Prix sur demande</p>
          ) : (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Prix de vente</p>
              <p className="text-2xl font-bold text-forest tabular-nums break-words">{new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(apartment.price)}<span className="ml-1 text-base font-semibold text-forest/70">DA</span></p>
              {pricePerSqm != null && <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums"><span className="inline-block size-1 shrink-0 rounded-full bg-forest/40" />{new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(pricePerSqm)} DA/m²</p>}
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-stretch gap-2">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="min-w-0 flex-1">
            <Button variant="default" size="sm" className="min-h-11 w-full bg-forest text-white hover:bg-forest-dark group-hover:bg-forest-dark group-hover:shadow-md" onClick={(e) => { e.stopPropagation(); openApartment(); }}>
              Découvrir le logement <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
          <CompareButton apartmentId={apartment.id} variant="icon" />
        </div>
      </div>
    </div>
  );
}

export function ApartmentCardSkeleton() {
  return <div className="overflow-hidden rounded-xl border border-border bg-card"><div className="space-y-3 p-4"><div className="h-6 w-1/3 animate-pulse rounded bg-muted" /><div className="mx-auto h-8 w-1/2 animate-pulse rounded bg-muted" /><div className="h-4 w-2/3 animate-pulse rounded bg-muted" /><div className="h-5 w-1/3 rounded bg-muted pt-2" /></div></div>;
}
