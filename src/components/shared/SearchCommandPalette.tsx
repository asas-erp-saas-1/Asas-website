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

  const recentSearches = useMemo(() => {
    if (!searchPaletteOpen) return [];
    return getRecentSearches();
  }, [searchPaletteOpen, recentSearchesVersion]);

  useEffect(() => {
    if (searchPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchPaletteOpen]);

  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchPaletteOpen(!searchPaletteOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClient, searchPaletteOpen, setSearchPaletteOpen]);

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
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain px-2 pt-[max(1rem,12dvh)] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl bg-black/40 sm:px-4 sm:pt-[15vh]"
          onClick={handleOverlayClick}
          role="presentation"
        >
          <motion.div
            key="search-palette-container"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.8 }}
            className="relative w-full max-w-2xl min-w-0 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-forest/30 bg-background shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Recherche IA"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-forest to-transparent"
            />

            <div className="flex min-w-0 flex-wrap items-center gap-2 px-3 pt-4 pb-2 sm:px-5 sm:pt-5">
              <div className="flex min-w-0 items-center gap-2 text-forest">
                <Sparkles className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">Recherche IA</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded-md border border-forest/30 bg-forest/5 px-1.5 font-mono text-[10px] font-semibold text-forest shadow-sm">
                  {shortcutLabel}
                </kbd>
                <span className="hidden text-xs text-muted-foreground sm:inline">pour ouvrir</span>
              </div>
            </div>

            <div className="min-w-0 px-3 pb-2 sm:px-5">
              <AISearch variant="compact" />
            </div>

            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/40 px-3 py-3 sm:px-5"
              >
                <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-xs font-medium">Recherches récentes</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="min-h-11 shrink-0 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                      className="flex min-w-0 min-h-11 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-foreground/80 hover:bg-forest/5 hover:text-foreground transition-colors group"
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-forest transition-colors" />
                      <span className="min-w-0 flex-1 truncate">{query}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 px-3 py-2.5 sm:px-5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-forest/60" />
                <span className="text-[10px]">Projets</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Home className="h-3.5 w-3.5 text-forest/60" />
                <span className="text-[10px]">Appartements</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-forest/60" />
                <span className="text-[10px]">Pages</span>
              </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border/50 bg-muted/30 px-3 py-2.5 sm:px-5">
              <span className="text-center text-xs text-muted-foreground">
                Appuyez sur{' '}
                <kbd className="mx-0.5 inline-flex h-5 items-center rounded-md border border-forest/20 bg-forest/5 px-1.5 font-mono text-[10px] font-semibold text-forest/80 shadow-sm">
                  Entrée
                </kbd>{' '}
                pour rechercher
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">•</span>
              <span className="text-center text-xs text-muted-foreground">
                <kbd className="mx-0.5 inline-flex h-5 items-center rounded-md border border-forest/20 bg-forest/5 px-1.5 font-mono text-[10px] font-semibold text-forest/80 shadow-sm">
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
