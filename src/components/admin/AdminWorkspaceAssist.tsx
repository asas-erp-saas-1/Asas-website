'use client';

import { useEffect, useState } from 'react';
import { getAdminRoute, subscribeToAdminRoute } from '@/lib/admin-route';
import { getAdminDomain, ADMIN_DOMAIN_GROUPS, type AdminDomainId } from '@/lib/admin-information-architecture';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Tableau de Bord',
  projects: 'Projets',
  apartments: 'Appartements',
  buildings: 'Bâtiments',
  media: 'Médiathèque',
  videos: 'Vidéos',
  leads: 'Leads & suivi commercial',
  audit: "Journal d’audit",
  users: 'Utilisateurs',
  settings: 'Paramètres',
};

const DOMAIN_LABELS: Record<AdminDomainId, string> = {
  siteOperations: ADMIN_DOMAIN_GROUPS.siteOperations.label,
  customerOperations: ADMIN_DOMAIN_GROUPS.customerOperations.label,
  system: ADMIN_DOMAIN_GROUPS.system.label,
};

/**
 * Workspace context layer. The route remains the authority; this component
 * derives the active operational domain without owning business/server state.
 */
export function AdminWorkspaceAssist() {
  const [route, setRoute] = useState(() => getAdminRoute());

  useEffect(() => subscribeToAdminRoute(setRoute), []);

  const currentTab = route.workspace;
  const label = TAB_LABELS[currentTab] ?? TAB_LABELS.dashboard;
  const entityLabel = route.entity && route.entityId ? `Entité ${route.entity} ${route.entityId}` : null;
  const domain = getAdminDomain(currentTab);
  const domainLabel = DOMAIN_LABELS[domain];

  useEffect(() => {
    const previousTitle = document.title;
    const previousHtmlSection = document.documentElement.dataset.adminSection;
    const previousHtmlDomain = document.documentElement.dataset.adminDomain;

    document.title = `${label} — ASAS Administration`;
    document.documentElement.dataset.adminSection = currentTab;
    document.documentElement.dataset.adminDomain = domain;

    return () => {
      document.title = previousTitle;
      if (previousHtmlSection) document.documentElement.dataset.adminSection = previousHtmlSection;
      else delete document.documentElement.dataset.adminSection;
      if (previousHtmlDomain) document.documentElement.dataset.adminDomain = previousHtmlDomain;
      else delete document.documentElement.dataset.adminDomain;
    };
  }, [currentTab, domain, label]);

  return (
    <div
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
      data-admin-context="true"
      data-admin-domain={domain}
    >
      Section d’administration active : {label}. Domaine opérationnel : {domainLabel}.{entityLabel ? ` ${entityLabel}.` : ''}
    </div>
  );
}

export default AdminWorkspaceAssist;
