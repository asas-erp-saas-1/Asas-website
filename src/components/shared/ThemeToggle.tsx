'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsClient } from '@/lib/use-is-client';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

/**
 * Dark / light theme toggle.
 *
 * Renders a placeholder until the client has hydrated to avoid SSR
 * hydration mismatches (server can't know the user's stored theme).
 *
 * Visual: ghost icon button matching the Navbar's favorites button
 * (size-9 rounded-md). The active icon (Sun in light mode, Moon in
 * dark mode) rotates + fades via framer-motion AnimatePresence.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  // Until mounted, render an invisible placeholder of the same size
  // to keep layout stable and avoid hydration mismatch.
  if (!isClient) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-9 rounded-md"
      />
    );
  }

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const tooltipLabel = isDark ? 'Mode clair' : 'Mode sombre';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            aria-label={tooltipLabel}
            aria-pressed={isDark}
            className="relative inline-flex items-center justify-center size-9 rounded-md text-foreground hover:text-forest hover:bg-forest/5 transition-colors overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="inline-flex"
                >
                  <Moon className="size-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="inline-flex"
                >
                  <Sun className="size-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
