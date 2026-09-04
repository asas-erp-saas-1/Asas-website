export const ADMIN_WORKSPACES = [
  'dashboard',
  'projects',
  'apartments',
  'buildings',
  'media',
  'videos',
  'leads',
  'audit',
  'users',
  'settings',
] as const;

export type AdminWorkspaceId = (typeof ADMIN_WORKSPACES)[number];

export interface AdminRouteModel {
  workspace: AdminWorkspaceId;
}

const WORKSPACE_SET = new Set<string>(ADMIN_WORKSPACES);

function normalizeCandidate(value: string | null | undefined): AdminWorkspaceId | null {
  const candidate = value?.trim().toLowerCase();
  return candidate && WORKSPACE_SET.has(candidate) ? candidate as AdminWorkspaceId : null;
}

export function parseAdminRoute(input: {
  pathname?: string;
  hash?: string;
}): AdminRouteModel {
  const pathname = input.pathname ?? '';
  const hash = input.hash ?? '';

  const hashValue = hash.replace(/^#\/?/, '');
  const hashMatch = hashValue.match(/^admin(?:\/([^/]+))?/i);
  const hashWorkspace = normalizeCandidate(hashMatch?.[1]);
  if (hashMatch && /^admin(?:\/|$)/i.test(hashValue)) {
    return { workspace: hashWorkspace ?? 'dashboard' };
  }

  const pathMatch = pathname.match(/^\/admin(?:\/([^/]+))?/i);
  return { workspace: normalizeCandidate(pathMatch?.[1]) ?? 'dashboard' };
}

export function getAdminRoute(): AdminRouteModel {
  if (typeof window === 'undefined') return { workspace: 'dashboard' };
  return parseAdminRoute({ pathname: window.location.pathname, hash: window.location.hash });
}

export function adminRouteHref(workspace: AdminWorkspaceId): string {
  return workspace === 'dashboard' ? '#/admin' : '#/admin/' + workspace;
}
