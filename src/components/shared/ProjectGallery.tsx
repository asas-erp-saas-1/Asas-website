'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/lib/types';

interface ProjectGalleryProps {
  images: ProjectImage[];
  projectName: string;
  fallbackImage?: string;
  filterType?: string;
}

export function ProjectGallery({ images, projectName, fallbackImage, filterType }: ProjectGalleryProps) {
  const filteredImages = filterType
    ? images.filter(img => img.type === filterType)
    : images;

  const validImages = filteredImages
    .filter(img => img.url)
    .sort((a, b) => a.order - b.order);
  const displayImages = validImages.length > 0
    ? validImages
    : fallbackImage
      ? [{ id: '__fallback', projectId: '', url: fallbackImage, type: 'hero', order: 0 }]
      : [{ id: '__default', projectId: '', url: '/images/brand/hero.jpg', type: 'hero', order: 0 }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  return (
    <div className="space-y-3">
      <div className="relative group overflow-hidden rounded-xl aspect-video bg-muted ring-1 ring-black/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 size-11 -translate-y-1/2 rounded-full bg-black/40 text-white opacity-100 transition-opacity hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={goPrev}
              aria-label="Image précédente"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 size-11 -translate-y-1/2 rounded-full bg-black/40 text-white opacity-100 transition-opacity hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={goNext}
              aria-label="Image suivante"
            >
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
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {displayImages.length > 1 && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Miniatures de la galerie">
          {displayImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-video overflow-hidden rounded-lg border-2 transition-all duration-200',
                index === activeIndex
                  ? 'border-forest ring-1 ring-forest/30 shadow-md'
                  : 'border-transparent opacity-70 hover:border-forest/30 hover:opacity-100'
              )}
              aria-label={`Voir image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <img
                src={img.url}
                alt={img.alt ?? `${projectName} — miniature ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {index === activeIndex && <div className="pointer-events-none absolute inset-0 bg-forest/10" />}
            </button>
          ))}
        </div>
      )}

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          className="w-[calc(100vw-1rem)] max-w-6xl overflow-hidden border-none bg-black/95 p-0 sm:w-full"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{projectName} — Vue plein écran</DialogTitle>
          <div className="relative flex min-h-[min(60vh,28rem)] max-h-[calc(100dvh-1rem)] items-center justify-center pb-[env(safe-area-inset-bottom)]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={displayImages[activeIndex].url}
                alt={displayImages[activeIndex].alt ?? `${projectName} — image ${activeIndex + 1}`}
                className="max-h-[calc(100dvh-4rem)] max-w-full object-contain"
              />
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 size-11 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setFullscreenOpen(false)}
              aria-label="Fermer"
            >
              <X className="size-5" />
            </Button>

            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goPrev}
                  aria-label="Précédente"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goNext}
                  aria-label="Suivante"
                >
                  <ChevronRight className="size-6" />
                </Button>
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
