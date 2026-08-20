'use client';

import { useRef, useState, useEffect } from 'react';
import { useInView, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  /** Color class applied to the counter text. Defaults to `text-forest`.
   *  Pass a different value (e.g. `text-white`) to override. */
  colorClass?: string;
}

/**
 * Formats a number using French convention (space as thousand separator).
 * e.g. 1000 → "1 000", 12500 → "12 500"
 */
function formatFrench(num: number): string {
  return num.toLocaleString('fr-FR');
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  className,
  colorClass = 'text-forest',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 80,
    damping: 25,
    mass: 0.8,
  });
  const rounded = useTransform(springVal, (latest) => Math.round(latest));

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [rounded]);

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionVal, value, {
        duration: duration / 1000,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [isInView, motionVal, value, duration]);

  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={`text-4xl md:text-5xl font-bold tabular-nums ${colorClass} ${className ?? ''}`}
    >
      {prefix}{formatFrench(displayValue)}{suffix}
    </span>
  );
}
