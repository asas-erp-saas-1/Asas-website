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

export type AdminEntity = 'project' | 'building' | 'apartment' | 'lead' | 'reservation' | 'contract' | 'payment' | 'user';
const ENTITY_SET = new Set<string>(['project','building','apartment','lead','reservation','contract','payment','user']);
function normalizeEntity(value: string | null): AdminEntity | undefined {
  const candidate = value?.trim().toLowerCase();
  return candidate && ENTITY_SET.has(candidate) ? candidate as AdminEntity : undefined;
}

export interface AdminRouteModel {
  workspace: AdminWorkspaceId;
  search?: string;
  filters: Record<string, string>;
  sort?: string;
  page?: number;
  subview?: string;
  entity?: AdminEntity;
  entityId?: string;
  cursor?: string;
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
    params.forEach((value, key) => { if (!['search', 'sort', 'page', 'subview', 'entity', 'entityId', 'cursor'].includes(key)) filters[key] = value; });
    const rawPage = Number(params.get('page'));
    return { workspace: hashWorkspace ?? 'dashboard', search: params.get('search') ?? undefined, filters, sort: params.get('sort') ?? undefined, page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : undefined, subview: params.get('subview') ?? undefined, entity: normalizeEntity(params.get('entity')), entityId: params.get('entityId') ?? undefined, cursor: params.get('cursor') ?? undefined };
  }

  const pathMatch = pathname.match(/^\/admin(?:\/([^/]+))?/i);
  const workspace = normalizeCandidate(pathMatch?.[1]) ?? 'dashboard';
  const query = pathname.includes('?')
    ? pathname.slice(pathname.indexOf('?') + 1)
    : hashValue.includes('?')
      ? hashValue.slice(hashValue.indexOf('?') + 1)
      : '';
  const params = new URLSearchParams(query);
  const filters: Record<string, string> = {};
  params.forEach((value, key) => {
    if (!['search', 'sort', 'page', 'subview', 'entity', 'entityId', 'cursor'].includes(key)) filters[key] = value;
  });
  const rawPage = Number(params.get('page'));
  return {
    workspace,
    search: params.get('search') ?? undefined,
    filters,
    sort: params.get('sort') ?? undefined,
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : undefined,
    subview: params.get('subview') ?? undefined,
    entity: normalizeEntity(params.get('entity')),
    entityId: params.get('entityId') ?? undefined,
    cursor: params.get('cursor') ?? undefined,
  };
}

export function subscribeToAdminRoute(onChange: (route: AdminRouteModel) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const sync = () => onChange(getAdminRoute());
  window.addEventListener('hashchange', sync);
  window.addEventListener('popstate', sync);
  return () => {
    window.removeEventListener('hashchange', sync);
    window.removeEventListener('popstate', sync);
  };
}

export function getAdminRoute(): AdminRouteModel {
  if (typeof window === 'undefined') return { workspace: 'dashboard', filters: {} };
  return parseAdminRoute({ pathname: window.location.pathname, hash: window.location.hash });
}

export interface AdminRoutePatch {
  workspace?: AdminWorkspaceId;
  search?: string;
  filters?: Record<string, string | undefined>;
  sort?: string;
  page?: number;
  cursor?: string;
  subview?: string;
  entity?: AdminEntity;
  entityId?: string;
}

export function adminRouteHref(workspaceOrPatch: AdminWorkspaceId | AdminRoutePatch): string {
  const patch = typeof workspaceOrPatch === 'string' ? { workspace: workspaceOrPatch } : workspaceOrPatch;
  const workspace = patch.workspace ?? 'dashboard';
  const params = new URLSearchParams();
  if (patch.search) params.set('search', patch.search);
  if (patch.sort) params.set('sort', patch.sort);
  if (patch.page && patch.page > 0) params.set('page', String(patch.page));
  if (patch.cursor) params.set('cursor', patch.cursor);
  if (patch.subview) params.set('subview', patch.subview);
  if (patch.entity) params.set('entity', patch.entity);
  if (patch.entityId) params.set('entityId', patch.entityId);
  Object.entries(patch.filters ?? {}).forEach(([key, value]) => {
    if (value != null && value !== '') params.set(key, value);
  });
  const base = workspace === 'dashboard' ? '#/admin' : '#/admin/' + workspace;
  const query = params.toString();
  return query ? base + '?' + query : base;
}


export type AdminNavigationMode = 'push' | 'replace';

export function navigateAdminRoute(
  patch: AdminRoutePatch,
  mode: AdminNavigationMode = 'push',
): void {
  if (typeof window === 'undefined') return;
  const current = getAdminRoute();
  const mergedFilters = { ...current.filters, ...(patch.filters ?? {}) };
  Object.keys(mergedFilters).forEach((key) => {
    if (mergedFilters[key] == null || mergedFilters[key] === '') delete mergedFilters[key];
  });
  const href = adminRouteHref({
    workspace: patch.workspace ?? current.workspace,
    search: patch.search ?? current.search,
    filters: mergedFilters,
    sort: patch.sort ?? current.sort,
    page: patch.page ?? current.page,
    cursor: patch.cursor ?? current.cursor,
    subview: patch.subview ?? current.subview,
    entity: patch.entity ?? current.entity,
    entityId: patch.entityId ?? current.entityId,
  });
  if (mode === 'replace') {
    window.history.replaceState({}, '', href);
  } else {
    window.history.pushState({}, '', href);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
