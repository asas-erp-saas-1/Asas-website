'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin scroll progress indicator positioned directly beneath the sticky navbar.
 * Decorative only: it does not affect routing, page state, or business logic.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed left-0 right-0 top-16 z-40 h-px origin-left bg-forest"
    />
  );
}
