'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityBadgeProps {
  available: number;
  reserved: number;
  total: number;
  className?: string;
}

export function AvailabilityBadge({ available, reserved, total, className }: AvailabilityBadgeProps) {
  if (total === 0) return null;

  const ratio = available / total;

  if (available === 0 && reserved === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn('inline-flex min-w-0 flex-col gap-1', className)}
      >
        <span className="inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
          <Home className="size-3.5 shrink-0" />
          <span className="truncate">Épuisé</span>
        </span>
        <div className="h-1 w-full overflow-hidden rounded-full bg-destructive/10" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-destructive/60"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    );
  }

  if (available === 0 && reserved > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn('inline-flex min-w-0 flex-col gap-1', className)}
      >
        <span className="inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-foreground">
          <Home className="size-3.5 shrink-0 text-gold" />
          <span className="truncate">Sur réservation</span>
        </span>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gold/15" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-gold"
            initial={{ width: 0 }}
            animate={{ width: `${(reserved / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('inline-flex min-w-0 flex-col gap-1', className)}
    >
      <span className="inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border border-forest/20 bg-forest/8 px-3 py-1 text-xs font-semibold text-forest">
        <Home className="size-3.5 shrink-0" />
        <span className="truncate">{available} disponible{available > 1 ? 's' : ''}</span>
        <span className="shrink-0 font-normal text-forest/70">/ {total}</span>
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest/10" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-forest"
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        />
      </div>
    </motion.div>
  );
}
