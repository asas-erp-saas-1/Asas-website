'use client';

import { useState, useMemo } from 'react';
import { Heart, X, ArrowRight, Trash2, Scale, Building2 } from 'lucide-react';
import { useFavorites, useComparison } from '@/lib/favorites';
import { useApartmentsByIds } from '@/lib/api';
import { useUI } from '@/lib/ui-store';
import { useRouter } from '@/lib/router';
import { useIsClient } from '@/lib/use-is-client';
import { formatPrice, formatSurface } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FavoritesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoritesDrawer({ open, onOpenChange }: FavoritesDrawerProps) {
  const favorites = useFavorites(s => s.favorites);
  const clearFavorites = useFavorites(s => s.clearFavorites);
  const toggleFavorite = useFavorites(s => s.toggleFavorite);
  const compareList = useComparison(s => s.compareList);
  const toggleCompare = useComparison(s => s.toggleCompare);
  const clearComparison = useComparison(s => s.clearComparison);
  const setCompareModalOpen = useUI(s => s.setCompareModalOpen);
  const router = useRouter();
  const isClient = useIsClient();

  // During SSR/hydration, use empty arrays to match server render
  const effectiveFavorites = isClient ? favorites : [];
  const effectiveCompareList = isClient ? compareList : [];

  const { data: apartments, isLoading } = useApartmentsByIds(effectiveFavorites);

  const sortedApartments = useMemo(() => {
    if (!apartments) return [];
    // Preserve the order of favorites
    return effectiveFavorites
      .map(id => apartments.find(a => a.id === id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [apartments, effectiveFavorites]);

  const handleViewApartment = (projectSlug: string, apartmentSlug: string) => {
    onOpenChange(false);
    router.goApartment(projectSlug, apartmentSlug);
  };

  const handleBrowseProjects = () => {
    onOpenChange(false);
    router.goProjects();
  };

  const handleCompareFavorites = () => {
    // Replace comparison list with up to 3 favorites, preserving order
    clearComparison();
    const toAdd = favorites.slice(0, 3);
    for (const id of toAdd) {
      toggleCompare(id);
    }
    onOpenChange(false);
    // Open the global CompareModal (mounted in page.tsx)
    setCompareModalOpen(true);
  };

  const canCompareFavorites = effectiveFavorites.length >= 2 && effectiveFavorites.length <= 3;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-5 py-4 border-b border-border bg-forest/5">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Heart className="size-5 text-red-500 fill-red-500" />
            Mes favoris
            {effectiveFavorites.length > 0 && (
              <Badge className="bg-forest text-white">{effectiveFavorites.length}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {effectiveFavorites.length === 0
              ? 'Retrouvez ici les appartements que vous avez sauvegardés.'
              : `${effectiveFavorites.length} appartement${effectiveFavorites.length > 1 ? 's' : ''} dans vos favoris.`}
          </SheetDescription>
        </SheetHeader>

        {effectiveFavorites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <EmptyState
              icon={Heart}
              title="Aucun favori pour le moment"
              description="Parcourez nos projets et cliquez sur le cœur pour sauvegarder vos appartements préférés."
              actionLabel="Découvrir les projets"
              onAction={handleBrowseProjects}
              size="lg"
            />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-3 py-3 space-y-3">
              {isLoading && !apartments
                ? Array.from({ length: effectiveFavorites.length }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))
                : sortedApartments.map(apartment => {
                    const projectSlug = apartment.project?.slug ?? '';
                    const isComparing = effectiveCompareList.includes(apartment.id);
                    const canCompareMore =
                      effectiveCompareList.includes(apartment.id) || effectiveCompareList.length < 3;
                    return (
                      <div
                        key={apartment.id}
                        className="group relative rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all"
                      >
                        <button
                          onClick={() => toggleFavorite(apartment.id)}
                          aria-label="Retirer des favoris"
                          className="absolute top-3 right-3 inline-flex items-center justify-center size-7 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="size-4" />
                        </button>

                        <div className="flex flex-col gap-2 pr-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-forest text-white text-xs">
                              {apartment.typeName}
                            </Badge>
                            <StatusBadge status={apartment.status} type="apartment" />
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-forest">
                              {formatSurface(apartment.surface)}
                            </span>
                            {apartment.price && !apartment.priceOnRequest && (
                              <span className="text-sm font-semibold text-foreground">
                                · {formatPrice(apartment.price)}
                              </span>
                            )}
                            {apartment.priceOnRequest && (
                              <span className="text-xs text-muted-foreground">
                                · Prix sur demande
                              </span>
                            )}
                          </div>

                          {apartment.project && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="size-3.5 shrink-0" />
                              <span className="truncate">
                                {apartment.project.name}
                                {apartment.project.city && ` · ${apartment.project.city}`}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-forest hover:bg-forest-dark text-white"
                              onClick={() =>
                                handleViewApartment(projectSlug, apartment.slug)
                              }
                            >
                              Voir la fiche
                              <ArrowRight className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canCompareMore && !isComparing}
                              className={
                                isComparing
                                  ? 'border-forest text-forest bg-forest/5 hover:bg-forest/10'
                                  : ''
                              }
                              onClick={() => toggleCompare(apartment.id)}
                            >
                              <Scale className="size-3.5" />
                              {isComparing ? 'Comparé' : 'Comparer'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </ScrollArea>
        )}

        {effectiveFavorites.length > 0 && (
          <SheetFooter className="border-t border-border px-5 py-4 bg-muted/30 flex-row gap-2">
            <Button
              variant="outline"
              onClick={clearFavorites}
              className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Tout effacer
            </Button>
            {canCompareFavorites && (
              <Button
                onClick={handleCompareFavorites}
                className="bg-forest hover:bg-forest-dark text-white ml-auto"
              >
                <Scale className="size-4" />
                Comparer les favoris
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
