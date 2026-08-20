'use client';

import { create } from 'zustand';

export interface AppRoute {
  page:
    | 'home'
    | 'projects'
    | 'project'
    | 'apartment'
    | 'services'
    | 'about'
    | 'for-developers'
    | 'contact'
    | 'insights'
    | 'campaign'
    | 'privacy'
    | 'terms'
    | 'admin'
    | 'not-found';
  projectSlug?: string;
  apartmentSlug?: string;
  campaignSlug?: string;
}

interface RouterStore {
  route: AppRoute;
  /** Marks true once the client has read the URL hash. SSR + first client render use { home } to avoid hydration mismatch. */
  hydrated: boolean;
  navigate: (route: AppRoute) => void;
  goHome: () => void;
  goProjects: () => void;
  goProject: (slug: string) => void;
  goApartment: (projectSlug: string, apartmentSlug: string) => void;
  goServices: () => void;
  goAbout: () => void;
  goForDevelopers: () => void;
  goContact: () => void;
  goInsights: () => void;
  goCampaign: (slug: string) => void;
  goPrivacy: () => void;
  goTerms: () => void;
  goAdmin: () => void;
  /** Re-reads window.location.hash and updates the store. Safe to call from a useEffect on mount. */
  syncFromHash: () => void;
}

export function parseHash(): AppRoute {
  if (typeof window === 'undefined') return { page: 'home' };
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'home' };

  const first = parts[0];

  switch (first) {
    case 'projects':
      if (parts.length >= 4 && parts[2] === 'apartments') {
        return { page: 'apartment', projectSlug: parts[1], apartmentSlug: parts[3] };
      }
      if (parts.length >= 2) {
        return { page: 'project', projectSlug: parts[1] };
      }
      return { page: 'projects' };
    case 'services':
      return { page: 'services' };
    case 'about':
      return { page: 'about' };
    case 'for-developers':
      return { page: 'for-developers' };
    case 'contact':
      return { page: 'contact' };
    case 'insights':
      return { page: 'insights' };
    case 'privacy':
      return { page: 'privacy' };
    case 'terms':
      return { page: 'terms' };
    case 'admin':
      return { page: 'admin' };
    case 'lp':
      if (parts.length >= 2) {
        return { page: 'campaign', campaignSlug: parts[1] };
      }
      return { page: 'not-found' };
    default:
      return { page: 'not-found' };
  }
}

function routeToHash(route: AppRoute): string {
  switch (route.page) {
    case 'home':
      return '/';
    case 'projects':
      return '/projects';
    case 'project':
      return `/projects/${route.projectSlug}`;
    case 'apartment':
      return `/projects/${route.projectSlug}/apartments/${route.apartmentSlug}`;
    case 'services':
      return '/services';
    case 'about':
      return '/about';
    case 'for-developers':
      return '/for-developers';
    case 'contact':
      return '/contact';
    case 'insights':
      return '/insights';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'admin':
      return '/admin';
    case 'campaign':
      return `/lp/${route.campaignSlug}`;
    default:
      return '/';
  }
}

// IMPORTANT: Always initialize with `{ page: 'home' }` so the SSR-rendered HTML
// matches the first client render (avoids hydration mismatch warnings).
// The actual hash is read after mount via `syncFromHash()` from a top-level useEffect.
export const useRouter = create<RouterStore>((set, get) => ({
  route: { page: 'home' },
  hydrated: false,

  navigate: (route: AppRoute) => {
    if (typeof window !== 'undefined') {
      const hash = routeToHash(route);
      window.location.hash = hash;
    }
    set({ route, hydrated: true });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  syncFromHash: () => {
    if (typeof window === 'undefined') return;
    const route = parseHash();
    set({ route, hydrated: true });
  },

  goHome: () => get().navigate({ page: 'home' }),
  goProjects: () => get().navigate({ page: 'projects' }),
  goProject: (slug: string) => get().navigate({ page: 'project', projectSlug: slug }),
  goApartment: (projectSlug: string, apartmentSlug: string) =>
    get().navigate({ page: 'apartment', projectSlug, apartmentSlug }),
  goServices: () => get().navigate({ page: 'services' }),
  goAbout: () => get().navigate({ page: 'about' }),
  goForDevelopers: () => get().navigate({ page: 'for-developers' }),
  goContact: () => get().navigate({ page: 'contact' }),
  goInsights: () => get().navigate({ page: 'insights' }),
  goCampaign: (slug: string) => get().navigate({ page: 'campaign', campaignSlug: slug }),
  goPrivacy: () => get().navigate({ page: 'privacy' }),
  goTerms: () => get().navigate({ page: 'terms' }),
  goAdmin: () => get().navigate({ page: 'admin' }),
}));

// Listen for hash changes (browser back/forward, manual URL edits).
// Guard against multiple registrations during HMR in dev mode.
let _hashListenerRegistered = false;
if (typeof window !== 'undefined' && !_hashListenerRegistered) {
  _hashListenerRegistered = true;
  window.addEventListener('hashchange', () => {
    const route = parseHash();
    useRouter.setState({ route, hydrated: true });
  });
}
