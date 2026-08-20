'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  delay?: number;
  /** Direction of reveal: 'up' | 'down' | 'left' | 'right' | 'scale' */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  /** Whether to show a decorative top border */
  showBorder?: boolean;
  /** Small badge text shown above the icon in forest-green */
  badge?: string;
  /** Adds a gradient top border accent */
  accent?: boolean;
}

const directionVariants = {
  up: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
};

/**
 * A reusable section wrapper that reveals its content with a smooth
 * spring animation when it scrolls into view. Optionally shows an
 * icon + title header with a decorative accent line.
 *
 * Usage:
 * <ScrollRevealSection icon={Building2} title="Nos Projets" direction="up">
 *   <ProjectGrid />
 * </ScrollRevealSection>
 */
export function ScrollRevealSection({
  children,
  className = '',
  icon: Icon,
  title,
  subtitle,
  delay = 0,
  direction = 'up',
  showBorder = false,
  badge,
  accent = false,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const variants = directionVariants[direction];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay,
      }}
      className={`relative ${className}`}
    >
      {/* Accent gradient top border */}
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-forest via-gold to-forest" />
      )}

      {/* Decorative top accent line */}
      {showBorder && !accent && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-forest via-gold to-forest" />
      )}

      {/* Optional icon + title header */}
      {(title || Icon) && (
        <div className="mb-6 text-center">
          {badge && (
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: delay + 0.05 }}
              className="inline-block px-3 py-0.5 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-wide uppercase mb-3"
            >
              {badge}
            </motion.span>
          )}
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: delay + 0.1 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-forest/10 mb-3"
            >
              <Icon className="h-6 w-6 text-forest" />
            </motion.div>
          )}
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: delay + 0.15 }}
              className="text-2xl md:text-3xl font-bold text-foreground"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, delay: delay + 0.2 }}
              className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      {children}
    </motion.section>
  );
}
