/**
 * ASAS Admin journey model.
 *
 * Journeys are product/operational contracts, not UI decoration. A workspace
 * is considered useful only when the user can move from context to the next
 * safe action without reconstructing relationships manually.
 */

import type { AdminEntity, AdminWorkspaceId } from './admin-route';

export type AdminJourneyId =
  | 'publish-property'
  | 'qualify-lead'
  | 'convert-interest'
  | 'recover-failure'
  | 'continue-after-navigation';

export interface AdminJourneyStage {
  id: string;
  label: string;
  workspaces: readonly AdminWorkspaceId[];
  entity?: AdminEntity;
  required: boolean;
}

export interface AdminJourneyDefinition {
  id: AdminJourneyId;
  label: string;
  description: string;
  stages: readonly AdminJourneyStage[];
}

export const ADMIN_JOURNEYS: readonly AdminJourneyDefinition[] = [
  {
    id: 'publish-property',
    label: 'Mettre un bien en ligne',
    description: 'Du projet jusqu’à une annonce exploitable et publiable.',
    stages: [
      { id: 'project', label: 'Projet', workspaces: ['projects'], entity: 'project', required: true },
      { id: 'building', label: 'Bâtiment', workspaces: ['buildings'], entity: 'building', required: true },
      { id: 'apartment', label: 'Appartement', workspaces: ['apartments'], entity: 'apartment', required: true },
      { id: 'inventory', label: 'Disponibilité', workspaces: ['apartments'], entity: 'apartment', required: true },
      { id: 'media', label: 'Médias', workspaces: ['media', 'apartments'], entity: 'apartment', required: true },
      { id: 'publication', label: 'Publication', workspaces: ['projects', 'apartments'], entity: 'apartment', required: true },
    ],
  },
  {
    id: 'qualify-lead',
    label: 'Qualifier un prospect',
    description: 'De l’entrée du lead au prochain suivi commercial explicite.',
    stages: [
      { id: 'lead', label: 'Lead', workspaces: ['leads'], entity: 'lead', required: true },
      { id: 'interest', label: 'Intérêt immobilier', workspaces: ['leads', 'apartments'], entity: 'apartment', required: true },
      { id: 'qualification', label: 'Qualification', workspaces: ['leads'], entity: 'lead', required: true },
      { id: 'follow-up', label: 'Suivi', workspaces: ['leads'], entity: 'lead', required: true },
    ],
  },
  {
    id: 'convert-interest',
    label: 'Convertir un intérêt',
    description: 'Du bien ciblé à la réservation sans dépendre d’un état d’inventaire périmé.',
    stages: [
      { id: 'property', label: 'Bien', workspaces: ['apartments'], entity: 'apartment', required: true },
      { id: 'availability', label: 'Disponibilité', workspaces: ['apartments'], entity: 'apartment', required: true },
      { id: 'lead', label: 'Lead', workspaces: ['leads'], entity: 'lead', required: true },
      { id: 'reservation', label: 'Réservation', workspaces: ['leads', 'apartments'], entity: 'reservation', required: true },
    ],
  },
  {
    id: 'recover-failure',
    label: 'Récupérer une opération en échec',
    description: 'Conserver le contexte et le brouillon, expliquer l’échec et permettre une reprise sûre.',
    stages: [
      { id: 'action', label: 'Action', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'pending', label: 'En cours', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'failure', label: 'Erreur récupérable', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'retry', label: 'Reprise', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'success', label: 'Succès', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
    ],
  },
  {
    id: 'continue-after-navigation',
    label: 'Reprendre après navigation',
    description: 'Conserver la recherche, les filtres et le contexte métier à travers back/forward/refresh.',
    stages: [
      { id: 'list', label: 'Liste', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'filtered-list', label: 'Recherche / filtres', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'entity', label: 'Entité', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'edit', label: 'Édition', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
      { id: 'return', label: 'Retour au contexte', workspaces: ['projects', 'buildings', 'apartments', 'leads'], required: true },
    ],
  },
];

export function getJourneyForWorkspace(
  workspace: AdminWorkspaceId,
  entity?: AdminEntity,
): AdminJourneyDefinition | undefined {
  const candidates = ADMIN_JOURNEYS.filter((journey) =>
    journey.stages.some((stage) => stage.workspaces.includes(workspace)),
  );
  if (entity) {
    const entityMatch = candidates.find((journey) =>
      journey.stages.some((stage) =>
        stage.workspaces.includes(workspace) && stage.entity === entity,
      ),
    );
    if (entityMatch) return entityMatch;
  }
  return candidates[0];
}

export function getJourneyStage(
  journey: AdminJourneyDefinition,
  workspace: AdminWorkspaceId,
  entity?: AdminEntity,
): AdminJourneyStage | undefined {
  return journey.stages.find((stage) =>
    stage.workspaces.includes(workspace) && (!entity || !stage.entity || stage.entity === entity),
  );
}
