'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Home, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/constants';

interface Apartment {
  id: string;
  slug: string;
  apartmentNumber?: string;
  unitNumber?: string;
  apartmentType: string;
  typeName: string;
  surface: number;
  floor?: number;
  orientation?: string;
  bedrooms: number;
  bathrooms?: number;
  hasParking?: boolean;
  parkingSpots?: number;
  status: string;
  price?: number;
  priceOnRequest: boolean;
  published: boolean;
  building?: { id: string; name: string; code: string };
  project: { id: string; slug: string; name: string; district: string; city: string };
  heroImage: string | null;
  updatedAt?: string;
}

interface ProjectOption { id: string; slug: string; name: string }
interface Pagination { page: number; limit: number; total: number; totalPages: number }

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  ['AVAILABLE', 'Disponible'],
  ['RESERVED', 'Réservé'],
  ['SOLD', 'Vendu'],
  ['COMING_SOON', 'Bientôt'],
  ['OFF_MARKET', 'Retiré'],
  ['DRAFT', 'Brouillon'],
] as const;

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 401 ? 'Session administrateur expirée.' : 'Impossible de charger les données.');
  return response.json();
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find(([value]) => value === status)?.[1] ?? status;
}

function statusClass(status: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (status === 'RESERVED') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (status === 'SOLD') return 'bg-red-100 text-red-800 border-red-200';
  if (status === 'COMING_SOON') return 'bg-sky-100 text-sky-800 border-sky-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export function AdminApartmentsWorkspace() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [projectSlug, setProjectSlug] = useState('all');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ data?: ProjectOption[] }>('/api/admin/projects', controller.signal)
      .then((json) => setProjects(json.data ?? []))
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === 'AbortError')) setProjects([]);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (projectSlug !== 'all') params.set('projectSlug', projectSlug);
    if (status !== 'all') params.set('status', status);
    if (type !== 'all') params.set('type', type);
    if (search.trim()) params.set('search', search.trim());

    getJson<{ data?: Apartment[]; pagination?: Pagination }>(`/api/admin/apartments?${params}`, controller.signal)
      .then((json) => {
        setApartments(json.data ?? []);
        setPagination(json.pagination ?? { page, limit: PAGE_SIZE, total: json.data?.length ?? 0, totalPages: json.data?.length ? 1 : 0 });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setApartments([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les appartements.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, projectSlug, status, type, retryKey, search]);

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination.totalPages]);

  const filteredApartments = useMemo(() => apartments, [apartments]);
  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  function resetPage() { setPage(1); }
  function clearFilters() {
    setProjectSlug('all'); setStatus('all'); setType('all'); setSearch(''); resetPage();
  }
  function refresh() {
    setRefreshing(true);
    setRetryKey((value) => value + 1);
  }

  useEffect(() => {
    if (!loading) setRefreshing(false);
  }, [loading]);

  const hasFilters = projectSlug !== 'all' || status !== 'all' || type !== 'all' || search.trim() !== '';

  return (
    <section className="admin-apartments-workspace min-h-screen bg-ivory p-4 sm:p-6 lg:p-8" aria-labelledby="apartments-workspace-title">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue</p>
            <h1 id="apartments-workspace-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Appartements</h1>
            <p className="mt-1 text-sm text-muted-foreground">Espace de gestion paginé, filtrable et stable pour le catalogue.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { window.location.hash = '#admin'; }} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour au tableau de bord</Button>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading || refreshing} className="gap-2" aria-label="Actualiser les appartements"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser</Button>
          </div>
        </header>

        <Card>
          <CardHeader className="pb-3"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" /> Filtres</CardTitle>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="w-fit gap-2"><X className="h-4 w-4" /> Effacer</Button>}</div></CardHeader>
          <CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5 text-sm font-medium"><span>Recherche</span><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} placeholder="N° unité, type, projet…" className="pl-9" /></div></label>
            <label className="space-y-1.5 text-sm font-medium"><span>Projet</span><Select value={projectSlug} onValueChange={(value) => { setProjectSlug(value); resetPage(); }}><SelectTrigger><SelectValue placeholder="Tous les projets" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les projets</SelectItem>{projects.map((p) => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-1.5 text-sm font-medium"><span>Statut</span><Select value={status} onValueChange={(value) => { setStatus(value); resetPage(); }}><SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{STATUS_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-1.5 text-sm font-medium"><span>Type</span><Select value={type} onValueChange={(value) => { setType(value); resetPage(); }}><SelectTrigger><SelectValue placeholder="Tous les types" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les types</SelectItem><SelectItem value="F1">F1</SelectItem><SelectItem value="F2">F2</SelectItem><SelectItem value="F3">F3</SelectItem><SelectItem value="F4">F4</SelectItem><SelectItem value="F5">F5+</SelectItem></SelectContent></Select></label>
          </div></CardContent>
        </Card>

        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>{pagination.total.toLocaleString('fr-FR')} appartement{pagination.total > 1 ? 's' : ''} · {rangeStart}-{rangeEnd}</span>{loading && <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span>}</div>

        {error ? <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-semibold text-charcoal">Impossible de charger les appartements</p><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button onClick={() => setRetryKey((value) => value + 1)} className="gap-2"><RefreshCw className="h-4 w-4" /> Réessayer</Button></CardContent></Card>
        : loading && apartments.length === 0 ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des appartements…</CardContent></Card>
        : filteredApartments.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><Home className="h-8 w-8 text-muted-foreground" /><p className="font-semibold text-charcoal">Aucun appartement trouvé</p><p className="text-sm text-muted-foreground">{hasFilters ? 'Modifiez les filtres ou effacez-les pour élargir la recherche.' : 'Aucun appartement n’est disponible dans cette page.'}</p>{hasFilters && <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>}</CardContent></Card>
        : <Card className="overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Unité</TableHead><TableHead>Projet</TableHead><TableHead>Type</TableHead><TableHead>Surface</TableHead><TableHead>Étage</TableHead><TableHead>Prix</TableHead><TableHead>Statut</TableHead><TableHead>Publication</TableHead></TableRow></TableHeader><TableBody>{filteredApartments.map((a) => <TableRow key={a.id} className={loading ? 'opacity-70' : undefined}><TableCell className="font-medium">{a.apartmentNumber ?? a.unitNumber ?? '—'}</TableCell><TableCell><div className="min-w-[150px]"><div className="font-medium">{a.project.name}</div><div className="text-xs text-muted-foreground">{a.project.district}, {a.project.city}</div></div></TableCell><TableCell><div>{a.apartmentType}</div><div className="text-xs text-muted-foreground">{a.typeName}</div></TableCell><TableCell>{a.surface} m²</TableCell><TableCell>{a.floor ?? '—'}</TableCell><TableCell className="whitespace-nowrap">{a.priceOnRequest ? 'Sur demande' : a.price != null ? formatPrice(a.price) : '—'}</TableCell><TableCell><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(a.status)}`}>{statusLabel(a.status)}</span></TableCell><TableCell><Badge variant={a.published ? 'default' : 'secondary'}>{a.published ? 'Publié' : 'Brouillon'}</Badge></TableCell></TableRow>)}</TableBody></Table></div></Card>}

        <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Pagination des appartements"><p className="text-sm text-muted-foreground">Page {pagination.page} sur {Math.max(pagination.totalPages, 1)}</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1} className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédent</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(Math.max(pagination.totalPages, 1), value + 1))} disabled={loading || page >= pagination.totalPages || pagination.totalPages === 0} className="gap-1">Suivant <ChevronRight className="h-4 w-4" /></Button></div></nav>
      </div>
    </section>
  );
}

export default AdminApartmentsWorkspace;
