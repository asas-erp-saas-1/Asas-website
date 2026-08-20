'use client';

import { useState } from 'react';
import { Scale, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComparison } from '@/lib/favorites';
import { useIsClient } from '@/lib/use-is-client';
import { trackEvent } from '@/lib/analytics';
import { useToastStore } from '@/lib/toast-store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CompareButtonProps {
  apartmentId: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function CompareButton({ apartmentId, variant = 'icon', className }: CompareButtonProps) {
  const isComparing = useComparison(s => s.isComparing(apartmentId));
  const canCompare = useComparison(s => s.canCompare(apartmentId));
  const toggleCompare = useComparison(s => s.toggleCompare);
  const addToast = useToastStore(s => s.addToast);
  const isClient = useIsClient();
  const [animating, setAnimating] = useState(false);

  // During SSR and hydration, always render the "not comparing" state
  // to match the server render. After hydration, show the real state.
  const effectiveIsComparing = isClient && isComparing;
  const effectiveCanCompare = isClient ? canCompare : true;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canCompare && !isComparing) {
      addToast({
        title: 'Maximum 3 appartements à comparer',
        variant: 'error',
      });
      return;
    }
    toggleCompare(apartmentId);
    setAnimating(true);
    trackEvent(isComparing ? 'compare_remove' : 'compare_add', {
      apartment_id: apartmentId,
    });
    addToast({
      title: isComparing ? 'Retiré de la comparaison' : 'Ajouté à la comparaison',
      variant: isComparing ? 'default' : 'success',
    });
    window.setTimeout(() => setAnimating(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (!canCompare && !isComparing) {
        addToast({
          title: 'Maximum 3 appartements à comparer',
          variant: 'error',
        });
        return;
      }
      toggleCompare(apartmentId);
      setAnimating(true);
      trackEvent(isComparing ? 'compare_remove' : 'compare_add', {
        apartment_id: apartmentId,
      });
      addToast({
        title: isComparing ? 'Retiré de la comparaison' : 'Ajouté à la comparaison',
        variant: isComparing ? 'default' : 'success',
      });
      window.setTimeout(() => setAnimating(false), 300);
    }
  };

  const disabled = !effectiveCanCompare && !effectiveIsComparing;
  const tooltipText = disabled
    ? 'Maximum 3 appartements à comparer'
    : effectiveIsComparing
      ? 'Retirer de la comparaison'
      : 'Ajouter à la comparaison';

  const buttonContent = (
    <>
      {effectiveIsComparing ? (
        <Check className={cn('size-4 transition-all duration-300', variant === 'icon' && 'size-5')} />
      ) : (
        <Scale className={cn('size-4 transition-all duration-300', variant === 'icon' && 'size-5')} />
      )}
      {variant === 'full' && (
        <span>{effectiveIsComparing ? 'Dans la comparaison' : 'Comparer'}</span>
      )}
    </>
  );

  const buttonClasses = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2',
    variant === 'icon'
      ? 'size-9 bg-white/90 backdrop-blur-sm shadow-md border border-border/60 hover:scale-110 hover:shadow-lg'
      : 'h-9 px-4 border',
    effectiveIsComparing
      ? variant === 'icon'
        ? 'bg-forest text-white border-forest hover:bg-forest-dark'
        : 'bg-forest/10 border-forest text-forest hover:bg-forest/20'
      : variant === 'icon'
        ? 'text-muted-foreground hover:text-forest'
        : 'bg-background border-border text-foreground hover:bg-accent hover:text-forest',
    animating && 'scale-105',
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md',
    className
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={tooltipText}
            aria-disabled
            className={buttonClasses}
          >
            {buttonContent}
          </button>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={tooltipText}
      aria-pressed={effectiveIsComparing}
      className={buttonClasses}
    >
      {buttonContent}
    </button>
  );
}
