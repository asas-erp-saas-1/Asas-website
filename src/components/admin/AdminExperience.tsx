'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { getAdminRoute } from '@/lib/admin-route';
import AdminPage from '@/components/pages/AdminPage';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import AdminOperationStatus from '@/components/admin/AdminOperationStatus';
import AdminWorkspaceAssist from '@/components/admin/AdminWorkspaceAssist';
import AdminApartmentsWorkspace from '@/components/admin/AdminApartmentsWorkspace';
import AdminProjectsWorkspace from '@/components/admin/AdminProjectsWorkspace';
import AdminLeadsPremiumWorkspace from '@/components/admin/AdminLeadsPremiumWorkspace';
import AdminBuildingsWorkspace from '@/components/admin/AdminBuildingsWorkspace';

interface AdminExperienceProps { children?: ReactNode; }

export function AdminExperience({ children }: AdminExperienceProps) {
  const [section, setSection] = useState(() => getAdminRoute().workspace);

  useEffect(() => {
    const sync = () => setSection(getAdminRoute().workspace);
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
