'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RecentlyViewedState {
  /** Apartment IDs, most recent first, capped at 10 entries. */
  recentlyViewed: string[];
  /** Adds an apartment ID to the front of the list (dedup + cap at 10). */
  addRecentlyViewed: (id: string) => void;
  /** Clears the entire recently-viewed history. */
  clearRecentlyViewed: () => void;
}

const MAX_RECENTLY_VIEWED = 10;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      addRecentlyViewed: (id: string) => {
        if (!id) return;
        const current = get().recentlyViewed;
        // Remove any existing occurrence to dedupe, then prepend to front.
        const deduped = current.filter(rid => rid !== id);
        // Cap at MAX_RECENTLY_VIEWED; oldest items at the end are pruned first.
        const next = [id, ...deduped].slice(0, MAX_RECENTLY_VIEWED);
        set({ recentlyViewed: next });
      },
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'asas-recently-viewed',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
