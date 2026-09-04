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
  search?: string;
  filters: Record<string, string>;
  sort?: string;
  page?: number;
  subview?: string;
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
    const query = hashValue.includes('?') ? hashValue.slice(hashValue.indexOf('?') + 1) : '';
    const params = new URLSearchParams(query);
    const filters: Record<string, string> = {};
    params.forEach((value, key) => { if (!['search', 'sort', 'page', 'subview'].includes(key)) filters[key] = value; });
    const rawPage = Number(params.get('page'));
    return { workspace: hashWorkspace ?? 'dashboard', search: params.get('search') ?? undefined, filters, sort: params.get('sort') ?? undefined, page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : undefined, subview: params.get('subview') ?? undefined };
  }

  const pathMatch = pathname.match(/^\/admin(?:\/([^/]+))?/i);
  const workspace = normalizeCandidate(pathMatch?.[1]) ?? 'dashboard';
  const query = hashValue.includes('?') ? hashValue.slice(hashValue.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  const filters: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key !== 'search' && key !== 'sort' && key !== 'page' && key !== 'subview') filters[key] = value;
  });
  const rawPage = Number(params.get('page'));
  return {
    workspace,
    search: params.get('search') ?? undefined,
    filters,
    sort: params.get('sort') ?? undefined,
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : undefined,
    subview: params.get('subview') ?? undefined,
  };
}

export function getAdminRoute(): AdminRouteModel {
  if (typeof window === 'undefined') return { workspace: 'dashboard', filters: {} };
  return parseAdminRoute({ pathname: window.location.pathname, hash: window.location.hash });
}

export function adminRouteHref(workspace: AdminWorkspaceId): string {
  return workspace === 'dashboard' ? '#/admin' : '#/admin/' + workspace;
}
