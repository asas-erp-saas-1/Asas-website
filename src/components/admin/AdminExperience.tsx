'use client';

import type { ReactNode } from 'react';
import AdminPage from '@/components/pages/AdminPage';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import AdminOperationStatus from '@/components/admin/AdminOperationStatus';
import AdminWorkspaceAssist from '@/components/admin/AdminWorkspaceAssist';
import AdminJourneyContext from '@/components/admin/AdminJourneyContext';

interface AdminExperienceProps { children?: ReactNode; }

/**
 * Stable outer shell. Route/workspace state is intentionally not owned here;
 * the canonical admin route model is consumed by the context layer and the
 * workspace implementation that owns the corresponding data.
 */
export function AdminExperience({ children }: AdminExperienceProps) {
  const content = children ?? <AdminPage />;

  return (
    <div className="admin-workspace" data-admin-workspace="true">
      <AdminWorkspaceAssist />
      <AdminJourneyContext />
      <AdminOperationStatus />
      <a className="admin-skip-link" href="#admin-workspace-content">Aller directement au contenu d’administration</a>
      <div id="admin-workspace-content" tabIndex={-1} role="region" aria-label="Espace d’administration ASAS">
        <AdminErrorBoundary>{content}</AdminErrorBoundary>
      </div>
    </div>
  );
}

export default AdminExperience;
