'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/lib/types';

interface ProjectGalleryProps {
  images: ProjectImage[];
  projectName: string;
  fallbackImage?: string;
  filterType?: string;
}

export function ProjectGallery({ images, projectName, fallbackImage, filterType }: ProjectGalleryProps) {
  const filteredImages = filterType ? images.filter((img) => img.type === filterType) : images;
  const validImages = filteredImages.filter((img) => img.url).sort((a, b) => a.order - b.order);
  // Never use the generic brand hero as a substitute for missing project photography.
  // Project pages must show only verified project media or the neutral empty state.
  const fallback = fallbackImage?.trim() && fallbackImage.trim() !== '/images/brand/hero.jpg'
    ? fallbackImage.trim()
    : '';
  const displayImages = validImages.length > 0
    ? validImages
    : fallback
      ? [{ id: '__fallback', projectId: '', url: fallback, type: 'hero', order: 0 }]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const goNext = useCallback(() => {
    if (displayImages.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const goPrev = useCallback(() => {
    if (displayImages.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const handleGalleryKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if ((event.key === 'Enter' || event.key === ' ') && displayImages.length > 0) {
      event.preventDefault();
      setFullscreenOpen(true);
    }
  }, [displayImages.length, goNext, goPrev]);

  const handleFullscreenKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setFullscreenOpen(false);
    }
  }, [goNext, goPrev]);

  if (displayImages.length === 0) {
    return (
      <div
        className="relative flex aspect-video min-h-[220px] items-center justify-center overflow-hidden rounded-xl border border-border bg-sand/40"
        role="img"
        aria-label={`${projectName} — aucune image disponible`}
      >
        <div className="text-center px-6">
          <Camera className="mx-auto mb-3 size-8 text-forest/35" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">Images du projet à venir</p>
          <p className="mt-1 text-xs text-muted-foreground">Les visuels seront ajoutés dès qu'ils seront disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative group overflow-hidden rounded-xl aspect-video bg-muted ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        role="region"
        aria-label={`${projectName} — galerie photos`}
        tabIndex={0}
        onKeyDown={handleGalleryKeyDown}
      >
        <AnimatePresence mode="wait">
          <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="absolute inset-0">
            <img
              src={displayImages[activeIndex].url}
              alt={displayImages[activeIndex].alt ?? `${projectName} — image ${activeIndex + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-[1.02]"
              loading={activeIndex === 0 ? 'eager' : 'lazy'}
              fetchPriority={activeIndex === 0 ? 'high' : undefined}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <Camera className="size-3.5" aria-hidden="true" />
          {activeIndex + 1} / {displayImages.length}
        </div>

        {displayImages.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 size-11 -translate-y-1/2 rounded-full bg-black/40 text-white opacity-100 transition-opacity hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100" onClick={goPrev} aria-label="Image précédente" title="Image précédente">
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 size-11 -translate-y-1/2 rounded-full bg-black/40 text-white opacity-100 transition-opacity hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100" onClick={goNext} aria-label="Image suivante" title="Image suivante">
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 right-3 size-11 rounded-lg bg-black/45 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/65 sm:opacity-0 sm:group-hover:opacity-100"
          onClick={() => setFullscreenOpen(true)}
          aria-label="Voir en plein écran"
          title="Voir en plein écran"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {displayImages.length > 1 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 overscroll-x-contain sm:grid sm:grid-cols-4 sm:overflow-visible" aria-label="Miniatures de la galerie">
          {displayImages.map((img, index) => (
            <button key={img.id} type="button" onClick={() => setActiveIndex(index)} className={cn('relative aspect-video min-w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 sm:min-w-0', index === activeIndex ? 'border-forest ring-1 ring-forest/30 shadow-md' : 'border-transparent opacity-70 hover:border-forest/30 hover:opacity-100')} aria-label={`Voir image ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined}>
              <img src={img.url} alt={img.alt ?? `${projectName} — miniature ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              {index === activeIndex && <div className="pointer-events-none absolute inset-0 bg-forest/10" />}
            </button>
          ))}
        </div>
      )}

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl overflow-hidden border-none bg-black/95 p-0 sm:w-full" showCloseButton={false}>
          <DialogTitle className="sr-only">{projectName} — Vue plein écran</DialogTitle>
          <div className="relative flex min-h-[min(60vh,28rem)] max-h-[calc(100dvh-1rem)] items-center justify-center pb-[env(safe-area-inset-bottom)] focus-visible:outline-none" role="region" aria-label={`${projectName} — galerie plein écran`} tabIndex={0} onKeyDown={handleFullscreenKeyDown}>
            <AnimatePresence mode="wait">
              <motion.img key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} src={displayImages[activeIndex].url} alt={displayImages[activeIndex].alt ?? `${projectName} — image ${activeIndex + 1}`} className="max-h-[calc(100dvh-4rem)] max-w-full object-contain" />
            </AnimatePresence>

            <Button variant="ghost" size="icon" className="absolute right-3 top-3 size-11 rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setFullscreenOpen(false)} aria-label="Fermer" title="Fermer">
              <X className="size-5" />
            </Button>

            {displayImages.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20" onClick={goPrev} aria-label="Précédente" title="Précédente"><ChevronLeft className="size-6" /></Button>
                <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20" onClick={goNext} aria-label="Suivante" title="Suivante"><ChevronRight className="size-6" /></Button>
              </>
            )}

            <span className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              {activeIndex + 1}/{displayImages.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
