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
  | 'publication-management'
  | 'completeness-monitoring';

export type CustomerOperationalUnit =
  | 'lead-intake'
  | 'lead-qualification'
  | 'lead-assignment'
  | 'follow-up-management'
  | 'property-interest'
  | 'reservation-conversion'
  | 'negotiation-management'
  | 'conversion-loss';

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
export const SITE_OPERATIONAL_UNITS = {
  project: [
    'create',
    'complete-information',
    'add-buildings',
    'add-apartments',
    'manage-inventory',
    'manage-pricing',
    'manage-media',
    'manage-publication',
    'monitor-completeness',
  ],
  building: [
    'create',
    'associate-project',
    'define-structure',
    'manage-apartments',
    'monitor-inventory',
  ],
  apartment: [
    'create',
    'assign-project',
    'assign-building',
    'define-physical-specs',
    'define-commercial-data',
    'define-availability',
    'upload-plans-media',
    'publish',
    'track-lifecycle',
  ],
} as const;

/** Canonical commercial journey: inventory context becomes customer context. */
export const ADMIN_OPERATIONAL_FLOW = [
  'project',
  'building',
  'apartment',
  'availability',
  'lead-interest',
  'follow-up',
  'reservation',
] as const;

export const CUSTOMER_OPERATIONAL_UNITS = {
  lead: [
    'intake',
    'qualification',
    'assignment',
    'follow-up',
    'activity-notes',
    'property-interest',
    'negotiation',
    'reservation',
    'conversion-loss',
  ],
} as const;

export const ADMIN_OPERATIONAL_RELATIONSHIPS = {
  site: {
    project: ['building', 'apartment', 'availability', 'media', 'publication'],
    building: ['project', 'apartment'],
    apartment: ['project', 'building', 'availability', 'lead', 'reservation', 'contract', 'payment'],
  },
  customer: {
    lead: ['project', 'building', 'apartment', 'property-interest', 'follow-up', 'reservation', 'conversion-loss'],
  },
} as const;


export type AdminOperationalAction = {
  id: string;
  label: string;
  requires?: readonly string[];
  risk: 'low' | 'medium' | 'high';
  reversible: boolean;
};

export type AdminOperationalUnitDefinition = {
  id: string;
  area: AdminOperationalArea;
  entity: AdminEntity;
  purpose: string;
  prerequisites: readonly string[];
  actions: readonly AdminOperationalAction[];
  completionSignals: readonly string[];
};

export const ADMIN_OPERATIONAL_UNIT_DEFINITIONS: readonly AdminOperationalUnitDefinition[] = [
  {
    id: 'project-management',
    area: 'site-operations',
    entity: 'project',
    purpose: 'Create and maintain a commercially publishable real-estate project and its inventory context.',
    prerequisites: [],
    actions: [
      { id: 'create', label: 'Create project', risk: 'low', reversible: true },
      { id: 'complete-information', label: 'Complete project information', risk: 'low', reversible: true },
      { id: 'add-buildings', label: 'Add buildings', requires: ['project exists'], risk: 'low', reversible: true },
      { id: 'add-apartments', label: 'Add apartments', requires: ['project exists'], risk: 'low', reversible: true },
      { id: 'manage-inventory', label: 'Manage inventory', requires: ['project exists'], risk: 'medium', reversible: true },
      { id: 'manage-pricing', label: 'Manage pricing', requires: ['inventory exists'], risk: 'high', reversible: true },
      { id: 'manage-media', label: 'Manage media', requires: ['project exists'], risk: 'medium', reversible: true },
      { id: 'manage-publication', label: 'Manage publication', requires: ['minimum publishable completeness'], risk: 'high', reversible: true },
      { id: 'monitor-completeness', label: 'Monitor completeness', requires: ['project exists'], risk: 'low', reversible: true },
    ],
    completionSignals: ['identity complete', 'structure linked', 'inventory coherent', 'commercial data valid', 'media ready', 'publication state explicit'],
  },
  {
    id: 'building-management',
    area: 'site-operations',
    entity: 'building',
    purpose: 'Maintain a building as structural inventory belonging to a project.',
    prerequisites: ['project exists'],
    actions: [
      { id: 'create', label: 'Create building', requires: ['project selected'], risk: 'low', reversible: true },
      { id: 'associate-project', label: 'Associate project', requires: ['project selected'], risk: 'medium', reversible: true },
      { id: 'define-structure', label: 'Define structure', risk: 'medium', reversible: true },
      { id: 'manage-apartments', label: 'Manage apartments', requires: ['building exists'], risk: 'medium', reversible: true },
      { id: 'monitor-inventory', label: 'Monitor inventory', requires: ['building exists'], risk: 'low', reversible: true },
    ],
    completionSignals: ['project linked', 'structure valid', 'inventory relationship coherent'],
  },
  {
    id: 'apartment-inventory',
    area: 'site-operations',
    entity: 'apartment',
    purpose: 'Maintain a unit from physical definition through commercial availability and publication.',
    prerequisites: ['project exists', 'building exists'],
    actions: [
      { id: 'create', label: 'Create apartment', requires: ['project selected', 'building selected'], risk: 'low', reversible: true },
      { id: 'assign-project', label: 'Assign project', requires: ['project exists'], risk: 'medium', reversible: true },
      { id: 'assign-building', label: 'Assign building', requires: ['building exists'], risk: 'medium', reversible: true },
      { id: 'define-physical-specs', label: 'Define physical specs', risk: 'low', reversible: true },
      { id: 'define-commercial-data', label: 'Define commercial data', risk: 'high', reversible: true },
      { id: 'define-availability', label: 'Define availability', risk: 'high', reversible: true },
      { id: 'upload-plans-media', label: 'Upload plans/media', requires: ['apartment exists'], risk: 'medium', reversible: true },
      { id: 'publish', label: 'Publish', requires: ['publishable completeness'], risk: 'high', reversible: true },
      { id: 'track-lifecycle', label: 'Track lifecycle', requires: ['apartment exists'], risk: 'low', reversible: true },
    ],
    completionSignals: ['identity valid', 'project/building linked', 'physical specs valid', 'commercial data valid', 'availability explicit', 'media validated', 'lifecycle state explicit'],
  },
  {
    id: 'lead-management',
    area: 'customer-operations',
    entity: 'lead',
    purpose: 'Convert an inbound lead into a qualified, followed-up and traceable property opportunity.',
    prerequisites: [],
    actions: [
      { id: 'intake', label: 'Intake', risk: 'low', reversible: true },
      { id: 'qualification', label: 'Qualification', requires: ['lead exists'], risk: 'medium', reversible: true },
      { id: 'assignment', label: 'Assignment', requires: ['lead exists'], risk: 'medium', reversible: true },
      { id: 'follow-up', label: 'Follow-up', requires: ['lead exists'], risk: 'low', reversible: true },
      { id: 'activity-notes', label: 'Activity / notes', requires: ['lead exists'], risk: 'low', reversible: true },
      { id: 'property-interest', label: 'Property interest', requires: ['lead exists', 'project or apartment context'], risk: 'medium', reversible: true },
      { id: 'negotiation', label: 'Negotiation', requires: ['property interest exists'], risk: 'high', reversible: true },
      { id: 'reservation', label: 'Reservation', requires: ['qualified interest', 'availability confirmed'], risk: 'high', reversible: true },
      { id: 'conversion-loss', label: 'Conversion / loss', requires: ['lead exists'], risk: 'high', reversible: true },
    ],
    completionSignals: ['owner explicit', 'qualification explicit', 'interest explicit', 'next follow-up explicit', 'commercial outcome explicit'],
  },
] as const;


export type AdminOperationalState =
  | 'not-started'
  | 'incomplete'
  | 'ready'
  | 'in-progress'
  | 'blocked'
  | 'completed'
  | 'failed';

export type AdminOperationalNextAction = {
  actionId: string;
  reason: string;
  blocked?: boolean;
};

export interface AdminOperationalStateSnapshot {
  unitId: string;
  state: AdminOperationalState;
  completionRatio: number;
  nextActions: readonly AdminOperationalNextAction[];
  blockers: readonly string[];
}

/**
 * These are intentionally deterministic, pure rules. UI components can consume
 * them without owning business logic or duplicating readiness calculations.
 */
export function getOperationalState(
  completionSignals: readonly boolean[],
  inProgress = false,
  failed = false,
): AdminOperationalState {
  if (failed) return 'failed';
  if (inProgress) return 'in-progress';
  if (completionSignals.length === 0) return 'not-started';
  const complete = completionSignals.every(Boolean);
  if (complete) return 'completed';
  if (completionSignals.some(Boolean)) return 'incomplete';
  return 'not-started';
}

export function getCompletionRatio(signals: readonly boolean[]): number {
  if (signals.length === 0) return 0;
  return Math.round((signals.filter(Boolean).length / signals.length) * 100);
}
