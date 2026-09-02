'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';

/**
 * Workspace-level network feedback for the Admin surface.
 *
 * It intentionally observes only queries/mutations whose keys start with
 * `admin`, so public-site requests never trigger Admin feedback.
 */
export function AdminOperationStatus() {
  const fetching = useIsFetching({ queryKey: ['admin'] });
  const mutating = useIsMutating({ mutationKey: ['admin'] });

  if (fetching === 0 && mutating === 0) return null;

  const label = mutating > 0
    ? 'Enregistrement en cours…'
    : 'Mise à jour des données…';

  return (
    <div
      className="fixed bottom-3 right-3 z-[90] flex items-center gap-2 rounded-full border border-border bg-white/95 px-3 py-2 text-xs font-medium text-charcoal shadow-lg backdrop-blur"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-admin-operation-status="true"
    >
      {mutating > 0 ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-forest" aria-hidden="true" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-forest" aria-hidden="true" />
      )}
      <span>{label}</span>
    </div>
  );
}

export default AdminOperationStatus;
