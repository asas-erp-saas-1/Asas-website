'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional secondary action */
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Visual size — 'sm' for compact inline use, 'lg' (default) for full-page use. */
  size?: 'sm' | 'lg';
  className?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  size = 'lg',
  className = '',
}: EmptyStateProps) {
  const isLg = size === 'lg';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center ${
        isLg ? 'py-16 px-6' : 'py-8 px-4'
      } ${className}`}
    >
      {/* Decorative animated icon container */}
      <div className="relative mb-6">
        {/* Halo */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-forest/10 blur-2xl"
          style={{ transform: 'scale(1.4)' }}
        />
        {/* Pulsing ring */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-forest/15 animate-ping"
          style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
        />
        <div
          className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-forest/10 to-forest/5 border border-forest/20 ${
            isLg ? 'w-20 h-20' : 'w-14 h-14'
          }`}
        >
          <Icon
            className={`text-forest animate-float-soft ${isLg ? 'w-9 h-9' : 'w-6 h-6'}`}
            strokeWidth={1.5}
          />
        </div>
      </div>

      <h3
        className={`font-bold text-foreground mb-2 ${
          isLg ? 'text-xl md:text-2xl' : 'text-base'
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed ${
            isLg ? 'text-sm md:text-base' : 'text-xs'
          }`}
        >
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="bg-forest hover:bg-forest-dark text-white"
              size={isLg ? 'default' : 'sm'}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size={isLg ? 'default' : 'sm'}
              className="border-forest/30 text-forest hover:bg-forest/5"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
