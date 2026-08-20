'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
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
  /** Optional type filter — only show images matching this type */
  filterType?: string;
}

export function ProjectGallery({ images, projectName, fallbackImage, filterType }: ProjectGalleryProps) {
  /* Apply type filter if specified */
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
      {/* Main Image */}
      <div className="relative group overflow-hidden rounded-xl aspect-video bg-muted">
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              onClick={goPrev}
              aria-label="Image précédente"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              onClick={goNext}
              aria-label="Image suivante"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}

        {/* Image counter badge */}
        {displayImages.length > 1 && (
          <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
            {activeIndex + 1}/{displayImages.length}
          </span>
        )}

        {/* Fullscreen button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 right-3 size-9 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          onClick={() => setFullscreenOpen(true)}
          aria-label="Voir en plein écran"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {/* Thumbnail Grid */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {displayImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200',
                index === activeIndex
                  ? 'border-forest ring-1 ring-forest/30 shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-forest/30'
              )}
              aria-label={`Voir image ${index + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt ?? `${projectName} — miniature ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {index === activeIndex && (
                <div className="absolute inset-0 bg-forest/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          className="max-w-6xl p-0 bg-black/95 border-none overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{projectName} — Vue plein écran</DialogTitle>
          <div className="relative flex items-center justify-center min-h-[60vh] max-h-[85vh]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={displayImages[activeIndex].url}
                alt={displayImages[activeIndex].alt ?? `${projectName} — image ${activeIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </AnimatePresence>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 size-10 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setFullscreenOpen(false)}
              aria-label="Fermer"
            >
              <X className="size-5" />
            </Button>

            {/* Navigation arrows in fullscreen */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goPrev}
                  aria-label="Précédente"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goNext}
                  aria-label="Suivante"
                >
                  <ChevronRight className="size-6" />
                </Button>
              </>
            )}

            {/* Counter in fullscreen */}
            {displayImages.length > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5">
                {activeIndex + 1}/{displayImages.length}
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
