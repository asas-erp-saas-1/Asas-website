'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Apartment, SiteStats } from '@/lib/types';
import type { PublicApartmentDetail, PublicProjectCard, PublicProjectDetail } from '@/lib/catalog-contracts';

const API_BASE = '/api';

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: 'no-store' });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body && typeof body === 'object' && 'error' in body ? String((body as { error: unknown }).error) : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

interface ApartmentsApiResponse {
  data: Apartment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** Temporary compatibility name retained for campaign consumers. It returns the canonical public DTO. */
export function useProjects(): UseQueryResult<PublicProjectCard[], Error> {
  return usePublicProjectCards();
}

/** Canonical public project-list query. */
export function usePublicProjectCards(): UseQueryResult<PublicProjectCard[], Error> {
  return useQuery({
    queryKey: ['catalog', 'project-cards'],
    queryFn: () => getJson<PublicProjectCard[]>(`${API_BASE}/catalog/projects`),
    staleTime: 60_000,
    retry: 2,
  });
}

export function useApartmentsByIds(ids: string[]) {
  const normalizedIds = [...new Set(ids)].sort();
  const qs = new URLSearchParams();
  normalizedIds.forEach((id) => qs.append('id', id));
  return useQuery({ queryKey: ['apartments', 'by-ids', normalizedIds], queryFn: async () => (await getJson<ApartmentsApiResponse>(`${API_BASE}/apartments?${qs.toString()}`)).data, enabled: normalizedIds.length > 0, staleTime: 30_000 });
}

export function useProject(slug: string, initialData?: PublicProjectDetail): UseQueryResult<PublicProjectDetail, Error> {
  return useQuery({ queryKey: ['catalog', 'project', slug], queryFn: () => getJson<PublicProjectDetail>(`${API_BASE}/projects/${encodeURIComponent(slug)}`), enabled: !!slug, initialData, staleTime: 60_000, retry: 2 });
}

export function useApartment(slug: string, initialData?: PublicApartmentDetail): UseQueryResult<PublicApartmentDetail, Error> {
  return useQuery({ queryKey: ['catalog', 'apartment', slug], queryFn: () => getJson<PublicApartmentDetail>(`${API_BASE}/apartments/${encodeURIComponent(slug)}`), enabled: !!slug, initialData, staleTime: 60_000, retry: 2 });
}

export async function submitLead(data: Record<string, unknown>) {
  return getJson(`${API_BASE}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export function useStats(): UseQueryResult<SiteStats, Error> {
  return useQuery({ queryKey: ['stats'], queryFn: () => getJson<SiteStats>(`${API_BASE}/stats`), staleTime: 60_000 });
}

export function useApartmentSearch(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') searchParams.set(key, String(value));
  const qs = searchParams.toString();
  return useQuery({ queryKey: ['apartments', 'search', qs], queryFn: async () => (await getJson<ApartmentsApiResponse>(`${API_BASE}/apartments${qs ? `?${qs}` : ''}`)).data, enabled: Object.values(params).some((v) => v !== undefined && v !== ''), staleTime: 30_000 });
}

export function useNewsletterSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (email: string) => getJson(`${API_BASE}/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['stats'] }); } });
}
