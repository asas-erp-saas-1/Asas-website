'use client';

import { create } from 'zustand';

export interface AppRoute {
  page: 'home'|'projects'|'project'|'apartment'|'services'|'about'|'for-developers'|'contact'|'insights'|'campaign'|'privacy'|'terms'|'admin'|'not-found';
  projectSlug?: string;
  apartmentSlug?: string;
  campaignSlug?: string;
}

interface RouterStore {
  route: AppRoute;
  hydrated: boolean;
  navigate: (route: AppRoute) => void;
  goHome: () => void; goProjects: () => void; goProject: (slug: string) => void;
  goApartment: (projectSlug: string, apartmentSlug: string) => void;
  goServices: () => void; goAbout: () => void; goForDevelopers: () => void;
  goContact: () => void; goInsights: () => void; goCampaign: (slug: string) => void;
  goPrivacy: () => void; goTerms: () => void; goAdmin: () => void;
  syncFromLocation: () => void;
}

function parsePath(pathname: string): AppRoute {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return { page: 'home' };
  switch (parts[0]) {
    case 'projects':
      if (parts.length >= 4 && parts[2] === 'apartments') return { page: 'apartment', projectSlug: parts[1], apartmentSlug: parts[3] };
      if (parts.length >= 2) return { page: 'project', projectSlug: parts[1] };
      return { page: 'projects' };
    case 'services': return { page: 'services' };
    case 'about': return { page: 'about' };
    case 'for-developers': return { page: 'for-developers' };
    case 'contact': return { page: 'contact' };
    case 'insights': return { page: 'insights' };
    case 'privacy': return { page: 'privacy' };
    case 'terms': return { page: 'terms' };
    case 'admin': return { page: 'admin' };
    case 'lp': return parts[1] ? { page: 'campaign', campaignSlug: parts[1] } : { page: 'not-found' };
    default: return { page: 'not-found' };
  }
}

function routeToPath(route: AppRoute): string {
  switch (route.page) {
    case 'home': return '/';
    case 'projects': return '/projects';
    case 'project': return `/projects/${encodeURIComponent(route.projectSlug ?? '')}`;
    case 'apartment': return `/projects/${encodeURIComponent(route.projectSlug ?? '')}/apartments/${encodeURIComponent(route.apartmentSlug ?? '')}`;
    case 'services': return '/services'; case 'about': return '/about'; case 'for-developers': return '/for-developers';
    case 'contact': return '/contact'; case 'insights': return '/insights'; case 'privacy': return '/privacy'; case 'terms': return '/terms'; case 'admin': return '/admin';
    case 'campaign': return `/lp/${encodeURIComponent(route.campaignSlug ?? '')}`;
    default: return '/';
  }
}

const CANONICAL_CATALOG_PAGES = new Set<AppRoute['page']>(['home', 'projects', 'project', 'apartment']);

export const useRouter = create<RouterStore>((set, get) => ({
  route: { page: 'home' }, hydrated: false,
  navigate: (route) => {
    if (typeof window !== 'undefined') {
      const path = routeToPath(route);
      if (CANONICAL_CATALOG_PAGES.has(route.page) && window.location.pathname !== path) {
        window.location.assign(path);
        return;
      }
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    set({ route, hydrated: true });
  },
  syncFromLocation: () => { if (typeof window !== 'undefined') set({ route: parsePath(window.location.pathname), hydrated: true }); },
  goHome: () => get().navigate({ page: 'home' }), goProjects: () => get().navigate({ page: 'projects' }),
  goProject: (slug) => get().navigate({ page: 'project', projectSlug: slug }),
  goApartment: (projectSlug, apartmentSlug) => get().navigate({ page: 'apartment', projectSlug, apartmentSlug }),
  goServices: () => get().navigate({ page: 'services' }), goAbout: () => get().navigate({ page: 'about' }),
  goForDevelopers: () => get().navigate({ page: 'for-developers' }), goContact: () => get().navigate({ page: 'contact' }),
  goInsights: () => get().navigate({ page: 'insights' }), goCampaign: (slug) => get().navigate({ page: 'campaign', campaignSlug: slug }),
  goPrivacy: () => get().navigate({ page: 'privacy' }), goTerms: () => get().navigate({ page: 'terms' }), goAdmin: () => get().navigate({ page: 'admin' }),
}));

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => useRouter.setState({ route: parsePath(window.location.pathname), hydrated: true }));
}
