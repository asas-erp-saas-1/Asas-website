'use client';

import { useEffect, useState } from 'react';

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

function getActiveTab(): string {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace(/^#\/?/, '');
  const match = hash.match(/^admin(?:\/([^/]+))?/i);
  return match?.[1] && TAB_LABELS[match[1]] ? match[1] : 'dashboard';
}

/**
 * Workspace-level accessibility and context layer.
 *
 * It deliberately stays independent from AdminPage's data/mutation state so
 * it can improve the legacy admin experience without changing API contracts.
 */
export function AdminWorkspaceAssist() {
  const [activeTab, setActiveTab] = useState(getActiveTab);

  useEffect(() => {
    const sync = () => setActiveTab(getActiveTab());

    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    sync();

    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  useEffect(() => {
    const label = TAB_LABELS[activeTab] ?? TAB_LABELS.dashboard;
    document.title = `${label} — ASAS Administration`;
    document.documentElement.dataset.adminSection = activeTab;

    return () => {
      delete document.documentElement.dataset.adminSection;
    };
  }, [activeTab]);

  const label = TAB_LABELS[activeTab] ?? TAB_LABELS.dashboard;

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
