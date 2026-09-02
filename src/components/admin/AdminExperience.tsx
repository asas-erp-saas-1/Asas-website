'use client';

import type { ReactNode } from 'react';
import AdminPage from '@/components/pages/AdminPage';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import AdminOperationStatus from '@/components/admin/AdminOperationStatus';
import AdminWorkspaceAssist from '@/components/admin/AdminWorkspaceAssist';

interface AdminExperienceProps {
  children?: ReactNode;
}

/**
 * Stable composition boundary for the admin experience.
 *
 * Keeping this boundary outside the legacy AdminPage lets us improve
 * navigation, accessibility and workspace-level behavior incrementally
 * without coupling those changes to the large page component.
 */
export function AdminExperience({ children }: AdminExperienceProps) {
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
          {children ?? <AdminPage />}
        </AdminErrorBoundary>
      </div>
    </div>
  );
}

export default AdminExperience;
