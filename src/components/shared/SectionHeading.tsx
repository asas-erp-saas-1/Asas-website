'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
  /** Optional icon displayed before the heading */
  icon?: LucideIcon;
}

export function SectionHeading({
  title,
  subtitle,
  className,
  align = 'center',
  icon: Icon,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div
      ref={ref}
      className={cn(
        'min-w-0 space-y-3',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0 }}
      >
        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-2 sm:gap-3',
            align === 'center' && 'justify-center',
          )}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
            className="flex shrink-0 items-center gap-2"
            aria-hidden="true"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span className="h-0.5 w-6 rounded-full bg-primary/40 sm:w-8" />
          </motion.span>

          {Icon && (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
              className="shrink-0 text-primary"
              aria-hidden="true"
            >
              <Icon className="size-5 sm:size-6" />
            </motion.span>
          )}

          <h2 className="min-w-0 max-w-full break-words text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h2>

          {align === 'center' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
              className="flex shrink-0 items-center gap-2"
              aria-hidden="true"
            >
              <span className="h-0.5 w-6 rounded-full bg-primary/40 sm:w-8" />
              <span className="size-2 rounded-full bg-primary" />
            </motion.span>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
        className={cn(
          'h-0.5 w-16 origin-left rounded-full bg-primary',
          align === 'center' && 'mx-auto origin-center',
        )}
        aria-hidden="true"
      />

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
          className="mx-auto max-w-2xl break-words text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
