'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/lib/favorites';
import { useIsClient } from '@/lib/use-is-client';
import { trackEvent } from '@/lib/analytics';
import { useToastStore } from '@/lib/toast-store';

interface FavoriteButtonProps {
  apartmentId: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function FavoriteButton({ apartmentId, variant = 'icon', className }: FavoriteButtonProps) {
  const isFavorite = useFavorites(s => s.isFavorite(apartmentId));
  const toggleFavorite = useFavorites(s => s.toggleFavorite);
  const addToast = useToastStore(s => s.addToast);
  const isClient = useIsClient();
  const [animating, setAnimating] = useState(false);

  // During SSR and hydration, always render the "not favorited" state
  // to match the server render. After hydration, show the real state.
  const effectiveIsFavorite = isClient && isFavorite;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(apartmentId);
    setAnimating(true);
    trackEvent(isFavorite ? 'favorite_remove' : 'favorite_add', {
      apartment_id: apartmentId,
    });
    addToast({
      title: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
      variant: isFavorite ? 'default' : 'success',
    });
    window.setTimeout(() => setAnimating(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(apartmentId);
      setAnimating(true);
      trackEvent(isFavorite ? 'favorite_remove' : 'favorite_add', {
        apartment_id: apartmentId,
      });
      addToast({
        title: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
        variant: isFavorite ? 'default' : 'success',
      });
      window.setTimeout(() => setAnimating(false), 300);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={effectiveIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-pressed={effectiveIsFavorite}
        className={cn(
          'inline-flex items-center justify-center rounded-full size-9 bg-white/90 backdrop-blur-sm shadow-md border border-border/60 transition-all duration-200 hover:scale-110 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2',
          effectiveIsFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500',
          animating && 'scale-125',
          className
        )}
      >
        <Heart
          className={cn(
            'size-5 transition-all duration-300',
            effectiveIsFavorite ? 'fill-red-500 text-red-500' : 'fill-none'
          )}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={effectiveIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={effectiveIsFavorite}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 border',
        effectiveIsFavorite
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'
          : 'bg-background border-border text-foreground hover:bg-accent hover:text-red-600',
        animating && 'scale-105',
        className
      )}
    >
      <Heart
        className={cn(
          'size-4 transition-all duration-300',
          effectiveIsFavorite ? 'fill-red-500 text-red-500' : 'fill-none'
        )}
      />
      {effectiveIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    </button>
  );
}
