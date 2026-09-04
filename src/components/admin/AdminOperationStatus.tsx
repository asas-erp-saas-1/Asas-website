'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

export function AdminOperationStatus() {
  const fetching = useIsFetching({ queryKey: ['admin'] });
  const mutating = useIsMutating({ mutationKey: ['admin'] });
  const active = fetching + mutating;

  if (active === 0) return null;

  const message = mutating > 0 ? 'Enregistrement en cours…' : 'Mise à jour des données…';

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[90] flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium shadow-lg backdrop-blur"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-admin-operation-status="true"
    >
      <RefreshCw className="h-3.5 w-3.5 animate-spin text-forest" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default AdminOperationStatus;
