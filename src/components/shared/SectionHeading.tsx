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
        'space-y-3',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0 }}
      >
        <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
          {/* Decorative dot accent */}
          <motion.span
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="w-8 h-0.5 rounded-full bg-primary/40 shrink-0" />
          </motion.span>

          {/* Optional icon */}
          {Icon && (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
              className="text-primary shrink-0"
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.span>
          )}

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
            {title}
          </h2>

          {/* Decorative dot accent on right (only for center) */}
          {align === 'center' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="w-8 h-0.5 rounded-full bg-primary/40 shrink-0" />
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
        className={cn(
          'h-0.5 w-16 rounded-full bg-primary origin-left',
          align === 'center' && 'mx-auto'
        )}
      />

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
          className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
