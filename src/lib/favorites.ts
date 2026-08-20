'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[]; // apartment IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  favoritesCount: () => number;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id: string) => {
        const current = get().favorites;
        const exists = current.includes(id);
        if (exists) {
          set({ favorites: current.filter(f => f !== id) });
        } else {
          set({ favorites: [...current, id] });
        }
      },
      isFavorite: (id: string) => get().favorites.includes(id),
      clearFavorites: () => set({ favorites: [] }),
      favoritesCount: () => get().favorites.length,
    }),
    {
      name: 'asas-favorites',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

// Comparison store
interface ComparisonState {
  compareList: string[]; // apartment IDs, max 3
  toggleCompare: (id: string) => void;
  isComparing: (id: string) => boolean;
  clearComparison: () => void;
  canCompare: (id: string) => boolean;
  setCompareList: (ids: string[]) => void;
  /** Build a shareable URL with the current compareList encoded in ?compare=id1,id2,id3 */
  buildShareUrl: () => string;
}

export const useComparison = create<ComparisonState>()(
  persist(
    (set, get) => ({
      compareList: [],
      toggleCompare: (id: string) => {
        const current = get().compareList;
        const exists = current.includes(id);
        if (exists) {
          set({ compareList: current.filter(c => c !== id) });
        } else if (current.length < 3) {
          set({ compareList: [...current, id] });
        }
      },
      isComparing: (id: string) => get().compareList.includes(id),
      clearComparison: () => set({ compareList: [] }),
      canCompare: (id: string) => {
        const current = get().compareList;
        return current.includes(id) || current.length < 3;
      },
      setCompareList: (ids: string[]) => {
        // Filter to unique, cap at 3
        const unique = Array.from(new Set(ids)).slice(0, 3);
        set({ compareList: unique });
      },
      buildShareUrl: () => {
        if (typeof window === 'undefined') return '';
        const ids = get().compareList;
        if (ids.length === 0) return window.location.href;
        const url = new URL(window.location.href);
        url.searchParams.set('compare', ids.join(','));
        // Reset hash to projects page so the comparison bar shows
        url.hash = '/projects';
        return url.toString();
      },
    }),
    {
      name: 'asas-comparison',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
