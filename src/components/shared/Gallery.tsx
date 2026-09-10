'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface GalleryImage {
  url: string;
  alt?: string;
}

function normalizeImages(images: string[] | GalleryImage[]): GalleryImage[] {
  return images.map((img) => (typeof img === 'string' ? { url: img } : img));
}

interface GalleryProps {
  images: string[] | GalleryImage[];
  alt?: string;
}

export function Gallery({ images: rawImages, alt = 'Image' }: GalleryProps) {
  const images = normalizeImages(rawImages);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 10) e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    if (dx < -50) setActiveIndex((prev) => (prev + 1) % images.length);
    touchStartX.current = null;
    touchStartY.current = null;
  }, [images.length]);

  const goNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleGalleryKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % images.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLightboxOpen(true);
    }
  }, [images.length]);

  if (images.length === 0) {
    return <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">Aucune image disponible</div>;
  }

  const currentImage = images[activeIndex];
  const currentAlt = currentImage.alt ?? `${alt} ${activeIndex + 1}`;

  return (
    <div className="min-w-0 space-y-3">
      <div
        className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        onClick={() => setLightboxOpen(true)}
        onKeyDown={handleGalleryKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        role="button"
        aria-label={`${alt}, image ${activeIndex + 1} sur ${images.length}. Appuyez sur Entrée pour agrandir.`}
      >
        <img
          src={currentImage.url}
          alt={currentAlt}
          className="h-full w-full object-cover transition-opacity duration-300"
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
          fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 z-20 min-h-10 min-w-10 size-10 -translate-y-1/2 rounded-full bg-black/30 text-white transition-opacity hover:bg-black/50 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={goPrev}
              aria-label="Image précédente"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 z-20 min-h-10 min-w-10 size-10 -translate-y-1/2 rounded-full bg-black/30 text-white transition-opacity hover:bg-black/50 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={goNext}
              aria-label="Image suivante"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}

        {images.length > 1 && (
          <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 custom-scrollbar" role="list" aria-label="Miniatures de la galerie">
          {images.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all sm:h-14 sm:w-20',
                index === activeIndex ? 'border-primary ring-1 ring-primary/30' : 'border-transparent opacity-70 hover:opacity-100'
              )}
              aria-label={`Voir image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <img src={img.url} alt={img.alt ?? `${alt} miniature ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-5xl border-none bg-black/95 p-1.5 overflow-hidden sm:p-2" showCloseButton={false}>
          <DialogTitle className="sr-only">{alt} - Vue agrandie</DialogTitle>
          <div
            className="relative flex min-h-[min(60vh,28rem)] max-h-[calc(100dvh-2rem)] items-center justify-center overflow-hidden rounded-md"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img src={currentImage.url} alt={currentAlt} className="max-h-[calc(100dvh-2rem)] max-w-full object-contain" />

            <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-20 min-h-11 min-w-11 size-11 rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setLightboxOpen(false)} aria-label="Fermer">
              <X className="size-5" />
            </Button>

            {images.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 z-20 min-h-11 min-w-11 size-11 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-3" onClick={goPrev} aria-label="Précédente">
                  <ChevronLeft className="size-6" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 z-20 min-h-11 min-w-11 size-11 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-3" onClick={goNext} aria-label="Suivante">
                  <ChevronRight className="size-6" />
                </Button>
                <span className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/90 sm:text-sm">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
