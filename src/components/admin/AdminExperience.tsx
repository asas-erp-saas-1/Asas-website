'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import AdminPage from '@/components/pages/AdminPage';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import AdminOperationStatus from '@/components/admin/AdminOperationStatus';
import AdminWorkspaceAssist from '@/components/admin/AdminWorkspaceAssist';
import AdminApartmentsWorkspace from '@/components/admin/AdminApartmentsWorkspace';
import AdminProjectsWorkspace from '@/components/admin/AdminProjectsWorkspace';
import AdminLeadsPremiumWorkspace from '@/components/admin/AdminLeadsPremiumWorkspace';
import AdminBuildingsWorkspace from '@/components/admin/AdminBuildingsWorkspace';

interface AdminExperienceProps { children?: ReactNode; }

function getAdminSection(): string {
  if (typeof window === 'undefined') return 'dashboard';

  const hash = window.location.hash.replace(/^#\/?/, '');
  const hashMatch = hash.match(/^admin(?:\/([^/]+))?/i);
  if (hashMatch?.[1]) return hashMatch[1].toLowerCase();

  const pathMatch = window.location.pathname.match(/^\/admin(?:\/([^/]+))?/i);
  return pathMatch?.[1]?.toLowerCase() ?? 'dashboard';
}

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

  const content = children ?? <AdminPage />;

  return (
    <div className="admin-workspace" data-admin-workspace="true">
      <AdminWorkspaceAssist activeTab={section} />
      <AdminOperationStatus />
      <a className="admin-skip-link" href="#admin-workspace-content">Aller directement au contenu d’administration</a>
      <div id="admin-workspace-content" tabIndex={-1} role="region" aria-label="Espace d’administration ASAS">
        <AdminErrorBoundary>{content}</AdminErrorBoundary>
      </div>
    </div>
  );
}

export default AdminExperience;
