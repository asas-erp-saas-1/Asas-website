'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Apartment, Project, SiteStats } from '@/lib/types';

const API_BASE = '/api';

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: 'no-store' });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body && typeof body === 'object' && 'error' in body
      ? String((body as { error: unknown }).error)
      : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

interface ApartmentsApiResponse {
  data: Apartment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProjects(): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getJson<Project[]>(`${API_BASE}/projects`),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useApartmentsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['apartments', 'by-ids', ids],
    queryFn: () => getJson<Project[]>(`${API_BASE}/projects`),
    select: (projects: Project[]) => projects
      .flatMap(project => (project.apartments ?? []).map(apartment => ({ ...apartment, project })))
      .filter(apartment => new Set(ids).has(apartment.id)),
    enabled: ids.length > 0,
    staleTime: 30_000,
  });
}

export function useProject(slug: string): UseQueryResult<Project, Error> {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => getJson<Project>(`${API_BASE}/projects/${encodeURIComponent(slug)}`),
    enabled: !!slug,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useApartment(slug: string): UseQueryResult<Apartment, Error> {
  return useQuery({
    queryKey: ['apartment', slug],
    queryFn: () => getJson<Apartment>(`${API_BASE}/apartments/${encodeURIComponent(slug)}`),
    enabled: !!slug,
    staleTime: 30_000,
    retry: 2,
  });
}

export async function submitLead(data: Record<string, unknown>) {
  return getJson(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function useStats(): UseQueryResult<SiteStats, Error> {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => getJson<SiteStats>(`${API_BASE}/stats`),
    staleTime: 60_000,
  });
}

export function useApartmentSearch(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ['apartments', 'search', qs],
    queryFn: async () => {
      const response = await getJson<ApartmentsApiResponse>(`${API_BASE}/apartments${qs ? `?${qs}` : ''}`);
      return response.data;
    },
    enabled: Object.values(params).some(v => v !== undefined && v !== ''),
    staleTime: 30_000,
  });
}

export function useNewsletterSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => getJson(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
