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

  const ratio = available / total; // 0 to 1

  // All sold
  if (available === 0 && reserved === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn('inline-flex flex-col gap-1', className)}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <Home className="w-3.5 h-3.5 text-red-500" />
          Épuisé
        </span>
        <div className="h-1 w-full rounded-full bg-red-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-red-400"
            initial={{ width: 0 }}
            animate={{ width: `${(reserved / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    );
  }

  // Only reserved left (no available)
  if (available === 0 && reserved > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn('inline-flex flex-col gap-1', className)}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Home className="w-3.5 h-3.5 text-amber-500" />
          Sur réservation
        </span>
        <div className="h-1 w-full rounded-full bg-amber-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${(reserved / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    );
  }

  // Some available
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('inline-flex flex-col gap-1', className)}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
        <Home className="w-3.5 h-3.5 text-emerald-500" />
        {available} disponible{available > 1 ? 's' : ''}
        <span className="text-emerald-500/70 font-normal">/ {total}</span>
      </span>
      <div className="h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        />
      </div>
    </motion.div>
  );
}
