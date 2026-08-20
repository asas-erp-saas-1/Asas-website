'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and the first client render (hydration),
 * then `true` after the client has hydrated. Use this to gate rendering
 * of stateful values that come from localStorage-backed stores
 * (avoids hydration mismatches).
 */
export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
