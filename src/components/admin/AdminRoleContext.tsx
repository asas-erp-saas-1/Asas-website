'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AdminRole = 'ADMIN' | 'EDITOR' | 'STAFF' | string;

interface AdminRoleContextValue {
  role: AdminRole | null;
  loading: boolean;
  canMutate: boolean;
  canAdminister: boolean;
}

const AdminRoleContext = createContext<AdminRoleContextValue>({
  role: null,
  loading: true,
  canMutate: false,
  canAdminister: false,
});

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/admin/me', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Impossible de récupérer le rôle administrateur.');
        return response.json() as Promise<{ user?: { role?: string | null } }>;
      })
      .then((json) => setRole(json.user?.role ?? null))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRole(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const value = useMemo<AdminRoleContextValue>(() => ({
    role,
    loading,
    canMutate: role === 'ADMIN' || role === 'EDITOR',
    canAdminister: role === 'ADMIN',
  }), [loading, role]);

  return <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
