/**
 * ASAS Admin domain contracts.
 *
 * These are product/UX boundaries, not database schemas. They prevent the
 * Admin shell from treating CMS/catalogue operations and CRM operations as
 * one undifferentiated CRUD surface.
 */
export const ADMIN_OPERATIONAL_DOMAINS = {
  site: {
    id: 'site',
    label: 'Gestion du site',
    purpose: 'Manage the public real-estate catalogue and its publication lifecycle.',
    entities: ['project', 'building', 'apartment', 'media', 'video'] as const,
    lifecycle: ['draft', 'review', 'published', 'archived'] as const,
  },
  customer: {
    id: 'customer',
    label: 'Gestion des clients',
    purpose: 'Manage demand, ownership, follow-up and conversion context.',
    entities: ['lead', 'contact', 'activity', 'reservation'] as const,
    lifecycle: ['new', 'contacted', 'qualified', 'visit', 'negotiation', 'converted', 'lost'] as const,
  },
  system: {
    id: 'system',
    label: 'Système',
    purpose: 'Manage access, configuration and auditability.',
    entities: ['user', 'audit', 'settings'] as const,
  },
} as const;

export type AdminOperationalDomain = keyof typeof ADMIN_OPERATIONAL_DOMAINS;

export type AdminEntityContext =
  | { domain: 'site'; entity: 'project' | 'building' | 'apartment' | 'media' | 'video'; id?: string; slug?: string }
  | { domain: 'customer'; entity: 'lead' | 'contact' | 'activity' | 'reservation'; id?: string }
  | { domain: 'system'; entity: 'user' | 'audit' | 'settings'; id?: string };

export const ADMIN_CONTEXTUAL_RELATIONSHIPS = {
  project: ['building', 'apartment', 'lead'],
  building: ['project', 'apartment'],
  apartment: ['project', 'building', 'lead', 'reservation'],
  lead: ['project', 'apartment', 'contact', 'activity', 'reservation'],
  reservation: ['lead', 'project', 'apartment'],
} as const;
