'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin scroll progress bar fixed below the navbar.
 * Uses framer-motion's useScroll + useSpring for a smooth, eased fill.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-16 left-0 right-0 z-40 h-1 origin-left bg-gradient-to-r from-forest via-forest-light to-forest"
    />
  );
}
