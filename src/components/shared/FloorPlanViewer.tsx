'use client';

import { useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Home, Download, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FloorPlanViewerProps {
  src: string;
  alt?: string;
}

export function FloorPlanViewer({ src, alt = 'Plan d\'appartement' }: FloorPlanViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.25;

  const handleZoomIn = useCallback(() => setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM)), []);
  const handleZoomOut = useCallback(() => setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM)), []);
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${(alt || 'plan-appartement')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [src, alt]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [zoom, pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  }, []);

  const renderViewer = (isFullscreen = false) => (
    <div
      className={cn(
        'floor-plan-container relative min-w-0 w-full touch-none overflow-hidden rounded-lg bg-muted/30',
        isFullscreen
          ? 'h-[min(80dvh,calc(100dvh-1rem))] min-h-[280px] sm:h-[80vh]'
          : 'aspect-[4/3] min-h-[220px]',
      )}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={alt}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        backgroundImage:
          'linear-gradient(rgba(34,90,72,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,90,72,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="absolute left-3 top-3 z-20 inline-flex max-w-[calc(100%-5rem)] items-center gap-1.5 rounded-full border border-forest/10 bg-forest/10 px-2.5 py-1 text-xs font-semibold text-forest backdrop-blur-sm">
        <LayoutGrid className="size-3 shrink-0" />
        <span className="truncate">Plan interactif</span>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Home className="size-20 text-forest/10 sm:size-24" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ touchAction: 'none' }}>
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          draggable={false}
        />
      </div>

      <div className="pointer-events-none absolute bottom-14 left-1/2 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 text-center">
        <p className="text-[10px] font-medium text-forest/40 sm:text-xs">Utilisez les contrôles ou la molette pour zoomer • Faites glisser pour déplacer</p>
      </div>

      <div className="absolute bottom-3 right-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-0.5 rounded-lg bg-white/90 p-1 shadow-md backdrop-blur sm:gap-1">
        <Button variant="ghost" size="icon" className="min-h-10 min-w-10 size-10" onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Zoom arrière">
          <ZoomOut className="size-4" />
        </Button>
        <span className="w-9 text-center text-xs font-medium tabular-nums sm:w-10">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="min-h-10 min-w-10 size-10" onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Zoom avant">
          <ZoomIn className="size-4" />
        </Button>
        <div className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
        <Button variant="ghost" size="icon" className="min-h-10 min-w-10 size-10" onClick={handleReset} aria-label="Réinitialiser le plan">
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <div className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-14rem)] sm:max-w-none">
        <Button
          variant="ghost"
          size="sm"
          className="min-h-10 rounded-lg bg-white/90 text-xs shadow-md backdrop-blur hover:bg-white"
          onClick={handleDownload}
          aria-label="Télécharger le plan"
        >
          <Download className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Télécharger le plan</span>
          <span className="sm:hidden">Télécharger</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog>
      <div className="relative min-w-0">
        {renderViewer(false)}
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-20 min-h-10 min-w-10 size-10 rounded-lg bg-white/90 shadow-md backdrop-blur"
            aria-label="Agrandir le plan"
          >
            <Maximize2 className="size-4" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="w-[calc(100%-1rem)] max-w-4xl p-1.5 sm:p-2">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {renderViewer(true)}
      </DialogContent>
    </Dialog>
  );
}
