'use client';

import { useIsFetching } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

/**
 * Workspace-level network feedback for Admin data refreshes.
 *
 * It observes only queries whose keys start with `admin`, so public-site
 * requests never trigger Admin feedback. Mutations are intentionally excluded
 * until the existing mutation calls are consistently keyed as `admin`.
 */
export function AdminOperationStatus() {
  const fetching = useIsFetching({ queryKey: ['admin'] });

  if (fetching === 0) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-[90] flex items-center gap-2 rounded-full border border-border bg-white/95 px-3 py-2 text-xs font-medium text-charcoal shadow-lg backdrop-blur"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-admin-operation-status="true"
    >
      <RefreshCw className="h-3.5 w-3.5 animate-spin text-forest" aria-hidden="true" />
      <span>Mise à jour des données…</span>
    </div>
  );
}

export default AdminOperationStatus;
