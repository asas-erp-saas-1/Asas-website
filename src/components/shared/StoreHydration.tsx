'use client';

import { useEffect } from 'react';
import { useFavorites, useComparison } from '@/lib/favorites';
import { useRecentlyViewed } from '@/lib/recently-viewed';

/**
 * Rehydrates Zustand persist stores on the client after mount.
 * Required because all stores use `skipHydration: true` to avoid
 * React #418 hydration mismatches (localStorage data on client vs
 * empty state on server).
 *
 * Also reads `?compare=id1,id2` from the URL query string so a
 * shared comparison link auto-loads the apartments into the store.
 */
export function StoreHydration() {
  useEffect(() => {
    useFavorites.persist.rehydrate();
    useComparison.persist.rehydrate();
    useRecentlyViewed.persist.rehydrate();

    // Sync comparison list from URL ?compare=id1,id2,id3
    // (overrides localStorage if the URL has a compare param)
    try {
      const params = new URLSearchParams(window.location.search);
      const compareParam = params.get('compare');
      if (compareParam) {
        const ids = compareParam
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 3);
        if (ids.length > 0) {
          // Merge with existing: add any IDs that aren't already in the list
          const existing = useComparison.getState().compareList;
          const merged = Array.from(new Set([...existing, ...ids])).slice(0, 3);
          useComparison.getState().setCompareList(merged);
        }
      }
    } catch (err) {
      console.warn('[StoreHydration] Failed to sync compare from URL:', err);
    }
  }, []);

  return null;
}
