'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

/**
 * Floating "back to top" button with:
 * - Animated chevron icon
 * - Circular progress ring showing scroll progress
 * - Tooltip "Retour en haut" on hover
 * - Spring physics for show/hide animation
 * - Mobile responsive with safe-area bottom offset
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

        setVisible(scrollY > 500);
        setScrollProgress(progress);
      });
    };

    // Initialize on mount (in case the page is loaded already scrolled)
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // SVG circle params for progress ring
  const size = 48;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="back-to-top-wrapper"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-40"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -top-9 right-0 whitespace-nowrap rounded-md bg-foreground text-background px-2.5 py-1 text-xs font-medium shadow-lg pointer-events-none"
              >
                Retour en haut
                <span className="absolute -bottom-1 right-3 w-2 h-2 bg-foreground rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            aria-label="Revenir en haut de la page"
            onClick={scrollToTop}
            className="relative size-12 rounded-full bg-forest text-white shadow-lg hover:bg-forest-dark hover:shadow-xl flex items-center justify-center transition-colors duration-200 hover:-translate-y-0.5 group"
          >
            {/* SVG progress ring */}
            <svg
              className="absolute inset-0 -rotate-90"
              width={size}
              height={size}
              aria-hidden="true"
            >
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-white/20"
              />
              {/* Progress arc */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-white/70"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </svg>

            {/* Animated chevron */}
            <motion.span
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex items-center justify-center"
            >
              <ChevronUp className="size-5" />
            </motion.span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
