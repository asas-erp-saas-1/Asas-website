'use client';

import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Home, Download, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.25;

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderViewer = (isFullscreen = false) => (
    <div
      ref={isFullscreen ? undefined : containerRef}
      className={cn(
        'floor-plan-container relative overflow-hidden bg-muted/30 rounded-lg',
        isFullscreen ? 'w-full h-[80vh]' : 'w-full aspect-[4/3]'
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Subtle grid pattern background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,90,72,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,90,72,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* "Plan interactif" badge */}
      <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold backdrop-blur-sm border border-forest/10">
        <LayoutGrid className="size-3" />
        Plan interactif
      </div>

      <div
        className="inline-block transition-transform duration-100"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Placeholder when no image or image fails — shown via CSS :not trick, but we add a Home icon overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 opacity-[0.08]">
        <Home className="size-24 text-forest" />
      </div>

      {/* Descriptive text placeholder overlay (subtle) */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <p className="text-xs text-forest/40 font-medium">Utilisez la molette pour zoomer • Glissez pour déplacer</p>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow-md p-1 z-20">
        <Button variant="ghost" size="icon" className="size-8" onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}>
          <ZoomOut className="size-4" />
        </Button>
        <span className="text-xs font-medium w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}>
          <ZoomIn className="size-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-0.5" />
        <Button variant="ghost" size="icon" className="size-8" onClick={handleReset}>
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Télécharger le plan button */}
      <div className="absolute bottom-3 left-3 z-20">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur shadow-md rounded-lg text-xs gap-1.5 hover:bg-white"
          onClick={() => {
            /* placeholder — would trigger download */
          }}
        >
          <Download className="size-3.5" />
          Télécharger le plan
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog>
      <div className="relative">
        {renderViewer(false)}
        {/* Fullscreen button overlay */}
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 size-8 bg-white/90 backdrop-blur shadow-md rounded-lg z-20"
          >
            <Maximize2 className="size-4" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-4xl p-2">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {renderViewer(true)}
      </DialogContent>
    </Dialog>
  );
}
