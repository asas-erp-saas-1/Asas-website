'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Apartment, Project, SiteStats } from '@/lib/types';

const API_BASE = '/api';

export function useProjects(): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<Project[]>;
    },
  });
}

/**
 * Resolve a list of apartment IDs into apartment objects (with project info).
 * Fetches the projects list once and flattens apartments.
 */
export function useApartmentsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<Project[]>;
    },
    select: (projects: Project[]) => {
      const allApartments: Apartment[] = [];
      for (const project of projects) {
        for (const apartment of project.apartments ?? []) {
          allApartments.push({ ...apartment, project });
        }
      }
      const idSet = new Set(ids);
      return allApartments.filter(a => idSet.has(a.id));
    },
  });
}

export function useProject(slug: string): UseQueryResult<Project, Error> {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/projects/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json() as Promise<Project>;
    },
    enabled: !!slug,
  });
}

export function useApartment(slug: string): UseQueryResult<Apartment, Error> {
  return useQuery({
    queryKey: ['apartment', slug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/apartments/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch apartment');
      return res.json() as Promise<Apartment>;
    },
    enabled: !!slug,
  });
}

export async function submitLead(data: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('Failed to submit lead');
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetch site-wide stats (project count, apartment count, etc.) */
export function useStats(): UseQueryResult<SiteStats, Error> {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json() as Promise<SiteStats>;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/** Search apartments with query params (type, status, minSurface, maxSurface, etc.) */
export function useApartmentSearch(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ['apartments', 'search', qs],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/apartments${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to search apartments');
      return res.json() as Promise<Apartment[]>;
    },
    enabled: Object.values(params).some((v) => v !== undefined && v !== ''),
  });
}

/** Mutation hook for subscribing to the newsletter via the /api/newsletter endpoint. */
export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Failed to subscribe');
      }
      return res.json();
    },
  });
}
