'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/lib/toast-store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ShareButtonProps {
  url?: string;
  title?: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function ShareButton({ url, title, variant = 'icon', className }: ShareButtonProps) {
  const addToast = useToastStore((s) => s.addToast);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = url ?? window.location.href;
    const shareTitle = title ?? document.title;

    // Use Web Share API on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall back to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast({
        title: 'Lien copié !',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Impossible de copier le lien',
        variant: 'error',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label="Partager"
            className={cn(
              'inline-flex items-center justify-center rounded-full size-9 bg-white/90 backdrop-blur-sm shadow-md border border-border/60 transition-all duration-200 hover:scale-110 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 text-muted-foreground hover:text-forest',
              className
            )}
          >
            <Share2 className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Partager</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Partager"
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 border bg-background border-border text-foreground hover:bg-forest/10 hover:text-forest hover:border-forest/40 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2',
        className
      )}
    >
      <Share2 className="size-4" />
      Partager
    </button>
  );
}
