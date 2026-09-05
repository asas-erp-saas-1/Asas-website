/**
 * ASAS Admin Operational Units
 *
 * This is the domain vocabulary for the Admin workspace. It deliberately
 * separates operational intent from UI routes/components so new screens do
 * not regress into isolated CRUD pages.
 */

export type AdminOperationalArea =
  | 'site-operations'
  | 'customer-operations'
  | 'system-operations';

export type SiteOperationalUnit =
  | 'project-management'
  | 'building-management'
  | 'apartment-inventory'
  | 'availability-management'
  | 'media-management'
  | 'publication-management';

export type CustomerOperationalUnit =
  | 'lead-intake'
  | 'lead-qualification'
  | 'lead-assignment'
  | 'follow-up-management'
  | 'property-interest'
  | 'reservation-conversion';

export type SystemOperationalUnit =
  | 'user-management'
  | 'permissions'
  | 'settings'
  | 'audit-activity';

export type AdminEntity =
  | 'project'
  | 'building'
  | 'apartment'
  | 'lead'
  | 'reservation'
  | 'contract'
  | 'payment'
  | 'user';

export interface AdminOperationalContext {
  area: AdminOperationalArea;
  unit: SiteOperationalUnit | CustomerOperationalUnit | SystemOperationalUnit;
  entity?: AdminEntity;
  entityId?: string;
  nextActions: readonly string[];
}

/**
 * Operational relationships are intentionally explicit. They are the
 * backbone for contextual navigation and prevent the Admin from becoming a
 * collection of disconnected CRUD surfaces.
 */
export const ADMIN_OPERATIONAL_RELATIONSHIPS = {
  site: {
    project: ['building', 'apartment', 'availability', 'media', 'publication'],
    building: ['project', 'apartment'],
    apartment: ['project', 'building', 'availability', 'lead', 'reservation', 'contract', 'payment'],
  },
  customer: {
    lead: ['project', 'apartment', 'follow-up', 'reservation'],
  },
} as const;
