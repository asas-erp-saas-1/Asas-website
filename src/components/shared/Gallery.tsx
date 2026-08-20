'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/* ─── Normalized image item — supports both string[] and {url, alt}[] ─── */
interface GalleryImage {
  url: string;
  alt?: string;
}

/** Normalize input: accept both string[] and {url, alt}[] formats */
function normalizeImages(images: string[] | GalleryImage[]): GalleryImage[] {
  return images.map((img) =>
    typeof img === 'string' ? { url: img } : img
  );
}

interface GalleryProps {
  images: string[] | GalleryImage[];
  alt?: string;
}

export function Gallery({ images: rawImages, alt = 'Image' }: GalleryProps) {
  const images = normalizeImages(rawImages);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  /* ── Touch / swipe support for mobile ── */
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent page scroll while swiping horizontally
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && dx > 10) {
        e.preventDefault();
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (dx > threshold) {
      // Swipe right → previous
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    } else if (dx < -threshold) {
      // Swipe left → next
      setActiveIndex((prev) => (prev + 1) % images.length);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-video bg-muted rounded-lg text-muted-foreground text-sm">
        Aucune image disponible
      </div>
    );
  }

  const currentImage = images[activeIndex];
  const currentAlt = currentImage.alt ?? `${alt} ${activeIndex + 1}`;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative group overflow-hidden rounded-lg aspect-video bg-muted"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage.url}
          alt={currentAlt}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
              onClick={goPrev}
              aria-label="Image precedente"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
              onClick={goNext}
              aria-label="Image suivante"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}

        {/* Click to open lightbox */}
        <button
          className="absolute inset-0 cursor-pointer"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ouvrir en grand"
        />

        {/* Counter */}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 rounded-md px-2 py-1">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden border-2 transition-all',
                index === activeIndex
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
              aria-label={`Voir image ${index + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt ?? `${alt} miniature ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-5xl p-0 bg-black/95 border-none overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{alt} - Vue agrandie</DialogTitle>
          <div
            className="relative flex items-center justify-center min-h-[60vh] max-h-[85vh]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImage.url}
              alt={currentAlt}
              className="max-w-full max-h-[85vh] object-contain"
            />

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 size-10 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
              aria-label="Fermer"
            >
              <X className="size-5" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={goPrev}
                  aria-label="Precedente"
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

            {/* Counter */}
            {images.length > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80 bg-black/40 rounded-full px-4 py-1.5">
                {activeIndex + 1} / {images.length}
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
