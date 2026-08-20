'use client';

import { useMemo, useState } from 'react';
import { Scale, X, Trash2, ArrowRight, Building2, Share2, Loader2, CheckCircle2 } from 'lucide-react';
import { useComparison } from '@/lib/favorites';
import { useApartmentsByIds } from '@/lib/api';
import { useUI } from '@/lib/ui-store';
import { useIsClient } from '@/lib/use-is-client';
import { useToastStore } from '@/lib/toast-store';
import { trackEvent } from '@/lib/analytics';
import { formatSurface } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function CompareBar() {
  const compareList = useComparison(s => s.compareList);
  const toggleCompare = useComparison(s => s.toggleCompare);
  const clearComparison = useComparison(s => s.clearComparison);
  const buildShareUrl = useComparison(s => s.buildShareUrl);
  const setCompareModalOpen = useUI(s => s.setCompareModalOpen);
  const isClient = useIsClient();
  const addToast = useToastStore(s => s.addToast);
  const [shareState, setShareState] = useState<'idle' | 'copying' | 'done'>('idle');

  // During SSR/hydration, use empty array to match server render
  const effectiveCompareList = isClient ? compareList : [];

  const { data: apartments } = useApartmentsByIds(effectiveCompareList);

  const sortedApartments = useMemo(() => {
    if (!apartments) return [];
    return effectiveCompareList
      .map(id => apartments.find(a => a.id === id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [apartments, effectiveCompareList]);

  const visible = isClient && effectiveCompareList.length >= 2;

  const handleShare = async () => {
    if (shareState !== 'idle') return;
    setShareState('copying');
    try {
      const url = buildShareUrl();
      await navigator.clipboard.writeText(url);
      trackEvent('compare_share', { count: effectiveCompareList.length });
      addToast({
        title: 'Lien de comparaison copié',
        description: 'Partagez-le pour montrer votre sélection.',
        variant: 'success',
      });
      setShareState('done');
      setTimeout(() => setShareState('idle'), 2000);
    } catch (err) {
      console.error('[CompareBar] Share failed:', err);
      addToast({
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
        variant: 'error',
      });
      setShareState('idle');
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      role="region"
      aria-label="Barre de comparaison"
      aria-hidden={!visible}
    >
      <div className="bg-background border-t-2 border-forest shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Label */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <div className="flex items-center justify-center size-9 rounded-full bg-forest/10">
                <Scale className="size-4 text-forest" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">Comparaison</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveCompareList.length}/3 sélectionnés
                </p>
              </div>
            </div>

            {/* Mobile: just icon */}
            <div className="sm:hidden flex items-center gap-2 shrink-0">
              <Badge className="bg-forest text-white">
                <Scale className="size-3" />
                {effectiveCompareList.length}/3
              </Badge>
            </div>

            {/* Selected apartments */}
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-2 min-w-min">
                {sortedApartments.length === 0 && effectiveCompareList.length > 0
                  ? effectiveCompareList.map(id => (
                      <div
                        key={id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5"
                      >
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    ))
                  : sortedApartments.map(apartment => (
                      <div
                        key={apartment.id}
                        className="group flex items-center gap-2 rounded-lg border border-forest/30 bg-forest/5 px-3 py-1.5 shrink-0"
                      >
                        <Building2 className="size-3.5 text-forest shrink-0" />
                        <div className="leading-tight">
                          <p className="text-xs font-semibold text-foreground">
                            {apartment.typeName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatSurface(apartment.surface)}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleCompare(apartment.id)}
                          aria-label={`Retirer ${apartment.typeName} de la comparaison`}
                          className="ml-1 inline-flex items-center justify-center size-5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                disabled={shareState !== 'idle'}
                className="text-forest hover:bg-forest/10 hover:text-forest-dark"
                aria-label="Partager la comparaison"
                title="Copier le lien de comparaison"
              >
                {shareState === 'copying' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : shareState === 'done' ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Share2 className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {shareState === 'done' ? 'Copié' : 'Partager'}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparison}
                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                aria-label="Effacer la comparaison"
              >
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Effacer</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setCompareModalOpen(true)}
                className="bg-forest hover:bg-forest-dark text-white"
              >
                <Scale className="size-4" />
                Comparer
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
