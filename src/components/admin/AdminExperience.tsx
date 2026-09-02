'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import AdminPage from '@/components/pages/AdminPage';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import AdminOperationStatus from '@/components/admin/AdminOperationStatus';
import AdminWorkspaceAssist from '@/components/admin/AdminWorkspaceAssist';
import AdminApartmentsWorkspace from '@/components/admin/AdminApartmentsWorkspace';

interface AdminExperienceProps {
  children?: ReactNode;
}

function getAdminSection(): string {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace(/^#\/?/, '');
  const match = hash.match(/^admin(?:\/([^/]+))?/i);
  return match?.[1]?.toLowerCase() ?? 'dashboard';
}

/**
 * Stable composition boundary for the admin experience.
 *
 * The apartments section is intentionally routed through its own data
 * workspace so pagination/filter state can evolve without increasing the
 * coupling of the legacy monolithic AdminPage.
 */
export function AdminExperience({ children }: AdminExperienceProps) {
  const [section, setSection] = useState(getAdminSection);

  useEffect(() => {
    const sync = () => setSection(getAdminSection());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    sync();
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  const content = !children && section === 'apartments'
    ? <AdminApartmentsWorkspace />
    : children ?? <AdminPage />;

  return (
    <div className="admin-workspace" data-admin-workspace="true">
      <AdminWorkspaceAssist />
      <AdminOperationStatus />
      <a className="admin-skip-link" href="#admin-workspace-content">
        Aller directement au contenu d’administration
      </a>
      <div
        id="admin-workspace-content"
        tabIndex={-1}
        role="region"
        aria-label="Espace d’administration ASAS"
      >
        <AdminErrorBoundary>
          {content}
        </AdminErrorBoundary>
      </div>
    </div>
  );
}

export default AdminExperience;
