/**
 * ASAS Admin mutation lifecycle.
 *
 * Shared state vocabulary for operational actions. UI components own their
 * presentation; this module owns deterministic lifecycle semantics.
 */
export type AdminMutationState =
  | 'idle'
  | 'validating'
  | 'submitting'
  | 'success'
  | 'recoverable-error';

export interface AdminMutationSnapshot {
  state: AdminMutationState;
  error?: string;
  requestId?: string;
}

export function isMutationPending(state: AdminMutationState): boolean {
  return state === 'validating' || state === 'submitting';
}

export function canStartMutation(state: AdminMutationState): boolean {
  return !isMutationPending(state);
}

export function mutationAfterFailure(error: unknown, requestId?: string): AdminMutationSnapshot {
  return {
    state: 'recoverable-error',
    error: error instanceof Error ? error.message : 'Operation failed. Please retry.',
    requestId,
  };
}

export function mutationSuccess(requestId?: string): AdminMutationSnapshot {
  return { state: 'success', requestId };
}

/**
 * A new mutation must have a fresh request identity. This makes duplicate
 * responses distinguishable when network latency reorders completion.
 */
export function createMutationRequestId(prefix = 'admin'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
