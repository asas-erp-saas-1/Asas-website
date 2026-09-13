/**
 * ASAS Admin information architecture.
 *
 * The workspace is intentionally split into two operational domains:
 * 1. SITE OPERATIONS (CMS/catalogue): controls what ASAS publishes and how
 *    projects, buildings, apartments and media are presented.
 * 2. CUSTOMER OPERATIONS (CRM): controls the commercial lifecycle from lead
 *    intake through follow-up and conversion.
 *
 * Dashboard is an operational command center spanning both domains; it is
 * not itself a third domain.
 */
export const ADMIN_DOMAIN_GROUPS = {
  siteOperations: {
    id: 'site-operations',
    label: 'Gestion du site',
    description: 'Catalogue immobilier, contenu, médias et publication.',
    workspaces: ['projects', 'buildings', 'apartments', 'media', 'videos'] as const,
  },
  customerOperations: {
    id: 'customer-operations',
    label: 'Gestion des clients',
    description: 'Leads, suivi commercial, qualification et conversion.',
    workspaces: ['leads'] as const,
  },
  system: {
    id: 'system',
    label: 'Système',
    description: 'Accès, audit et configuration.',
    workspaces: ['audit', 'users', 'settings'] as const,
  },
} as const;

export type AdminDomainId = keyof typeof ADMIN_DOMAIN_GROUPS;

const WORKSPACE_DOMAIN: Record<string, AdminDomainId> = {
  projects: 'siteOperations',
  buildings: 'siteOperations',
  apartments: 'siteOperations',
  media: 'siteOperations',
  videos: 'siteOperations',
  leads: 'customerOperations',
  audit: 'system',
  users: 'system',
  settings: 'system',
  dashboard: 'siteOperations',
};

export function getAdminDomain(workspace: string): AdminDomainId {
  return WORKSPACE_DOMAIN[workspace] ?? 'siteOperations';
}
