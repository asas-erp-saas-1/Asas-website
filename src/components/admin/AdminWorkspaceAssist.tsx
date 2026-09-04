'use client';

import { useEffect, useState } from 'react';
import { getAdminRoute } from '@/lib/admin-route';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Tableau de Bord',
  projects: 'Projets',
  apartments: 'Appartements',
  buildings: 'Bâtiments',
  media: 'Médiathèque',
  videos: 'Vidéos',
  leads: 'Leads',
  audit: "Journal d’audit",
  users: 'Utilisateurs',
  settings: 'Paramètres',
};

/**
 * Workspace-level accessibility and context layer.
 *
 * It deliberately stays independent from AdminPage's data/mutation state so
 * it can improve the legacy admin experience without changing API contracts.
 */
export function AdminWorkspaceAssist({ activeTab }: { activeTab?: string }) {
  const [routeTab, setRouteTab] = useState(() => getAdminRoute().workspace);

  useEffect(() => {
    const sync = () => setRouteTab(getAdminRoute().workspace);

    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    sync();

    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  useEffect(() => {
    const currentTab = activeTab && TAB_LABELS[activeTab] ? activeTab : routeTab;
    const label = TAB_LABELS[currentTab] ?? TAB_LABELS.dashboard;
    const previousTitle = document.title;
    const previousHtmlSection = document.documentElement.dataset.adminSection;

    document.title = `${label} — ASAS Administration`;
    document.documentElement.dataset.adminSection = currentTab;

    return () => {
      document.title = previousTitle;
      if (previousHtmlSection) {
        document.documentElement.dataset.adminSection = previousHtmlSection;
      } else {
        delete document.documentElement.dataset.adminSection;
      }
    };
  }, [activeTab, routeTab]);

  const currentTab = activeTab && TAB_LABELS[activeTab] ? activeTab : routeTab;
  const label = TAB_LABELS[currentTab] ?? TAB_LABELS.dashboard;

  return (
    <div
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
      data-admin-context="true"
    >
      Section d’administration active : {label}
    </div>
  );
}

export default AdminWorkspaceAssist;
