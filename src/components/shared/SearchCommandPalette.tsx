'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AISearch } from '@/components/shared/AISearch';
import { useUI } from '@/lib/ui-store';
import { useIsClient } from '@/lib/use-is-client';
import { Sparkles, Building2, Home, FileText, Clock, Search, ArrowRight } from 'lucide-react';

const RECENT_SEARCHES_KEY = 'asas_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query.trim());
    recent.unshift(query.trim());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

/** Result type icons for search */
const RESULT_ICONS = {
  project: Building2,
  apartment: Home,
  page: FileText,
} as const;

export function SearchCommandPalette() {
  const searchPaletteOpen = useUI((s) => s.searchPaletteOpen);
  const setSearchPaletteOpen = useUI((s) => s.setSearchPaletteOpen);
  const isClient = useIsClient();
  const [recentSearchesVersion, setRecentSearchesVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const shortcutLabel = isClient && navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';

  // Memoize recent searches, re-compute when palette opens or version bumps
  const recentSearches = useMemo(() => {
    if (!searchPaletteOpen) return [];
    return getRecentSearches();
  }, [searchPaletteOpen, recentSearchesVersion]);

  // Focus management when palette opens
  useEffect(() => {
    if (searchPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchPaletteOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchPaletteOpen(!searchPaletteOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClient, searchPaletteOpen, setSearchPaletteOpen]);

  // Close on ESC
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSearchPaletteOpen(false);
      }
    },
    [setSearchPaletteOpen]
  );

  useEffect(() => {
    if (!searchPaletteOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSearchPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [searchPaletteOpen, setSearchPaletteOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (searchPaletteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchPaletteOpen]);

  const handleRecentClick = useCallback(
    (query: string) => {
      saveRecentSearch(query);
      setSearchPaletteOpen(false);
    },
    [setSearchPaletteOpen]
  );

  const handleClearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearchesVersion(v => v + 1);
  }, []);

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {searchPaletteOpen && (
        <motion.div
          key="search-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] backdrop-blur-xl bg-black/40"
          onClick={handleOverlayClick}
        >
          <motion.div
            key="search-palette-container"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.8 }}
            className="relative w-full max-w-2xl mx-4 rounded-2xl border-2 border-forest/30 bg-background shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Forest green gradient accent at top */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-forest to-transparent"
            />

            {/* Header with sparkle icon and shortcut hint */}
            <div className="flex items-center gap-2 px-5 pt-5 pb-2">
              <div className="flex items-center gap-2 text-forest">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold">Recherche IA</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded-md border border-forest/30 bg-forest/5 px-1.5 font-mono text-[10px] font-semibold text-forest shadow-sm">
                  {shortcutLabel}
                </kbd>
                <span className="text-xs text-muted-foreground">pour ouvrir</span>
              </div>
            </div>

            {/* AI Search Component */}
            <div className="px-5 pb-2">
              <AISearch variant="compact" />
            </div>

            {/* Recent searches section */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/40 px-5 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Recherches récentes</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Effacer
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  {recentSearches.map((query, i) => (
                    <motion.button
                      key={query}
                      type="button"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleRecentClick(query)}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-foreground/80 hover:bg-forest/5 hover:text-foreground transition-colors group text-left"
                    >
                      <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-forest transition-colors" />
                      <span className="flex-1 truncate">{query}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search result type hints */}
            <div className="border-t border-border/40 px-5 py-2.5 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 text-forest/60" />
                <span className="text-[10px]">Projets</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Home className="w-3.5 h-3.5 text-forest/60" />
                <span className="text-[10px]">Appartements</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="w-3.5 h-3.5 text-forest/60" />
                <span className="text-[10px]">Pages</span>
              </div>
            </div>

            {/* Footer hint with proper kbd styling */}
            <div className="border-t border-border/50 bg-muted/30 px-5 py-2.5 flex items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground">
                Appuyez sur{' '}
                <kbd className="inline-flex h-5 items-center rounded-md border border-forest/20 bg-forest/5 px-1.5 font-mono text-[10px] font-semibold text-forest/80 shadow-sm mx-0.5">
                  Entrée
                </kbd>{' '}
                pour rechercher
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                <kbd className="inline-flex h-5 items-center rounded-md border border-forest/20 bg-forest/5 px-1.5 font-mono text-[10px] font-semibold text-forest/80 shadow-sm mx-0.5">
                  Échap
                </kbd>{' '}
                pour fermer
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { RESULT_ICONS };
