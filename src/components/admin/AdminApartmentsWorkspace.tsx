'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Home, Loader2, RefreshCw, Search, X, Eye, EyeOff, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/constants';
import { navigateAdminRoute, subscribeToAdminRoute, getAdminRoute } from '@/lib/admin-route';
import { canStartMutation, createMutationRequestId, mutationAfterFailure, mutationSuccess as mutationSucceeded, type AdminMutationSnapshot } from '@/lib/admin-mutation';
import { evaluateApartmentOperationalCompleteness, evaluateApartmentPublicationReadiness, canTransitionApartmentStatus, evaluateOperationalSignals, type OperationalSignal } from '@/lib/admin-operational-units';

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
  totalFloors?: number | null;
  balconies?: number | null;
  balconySurface?: number | null;
  hasTerrace?: boolean;
  terraceSurface?: number | null;
  hasGarden?: boolean;
  gardenSurface?: number | null;
  paymentPlan?: string | null;
  paymentPlanAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  features?: unknown;
  featuresAr?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: boolean | null;
  archived?: boolean;
  imagesRelation?: Array<{ id: string; url: string; type: string; order: number; alt?: string | null }>;
}

interface ProjectOption { id: string; slug: string; name: string }
interface Pagination { page: number; limit: number; total: number; totalPages: number }
type PendingAction = { kind: 'publish' | 'archive'; apartment: Apartment } | null;

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  ['AVAILABLE', 'Disponible'],
  ['RESERVED', 'Réservé'],
  ['SOLD', 'Vendu'],
  ['COMING_SOON', 'Bientôt'],
  ['OFF_MARKET', 'Retiré'],
  ['DRAFT', 'Brouillon'],
] as const;

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  if (!response.ok) {
    let message = 'Opération impossible.';
    try {
      const json = await response.json();
      if (typeof json?.error === 'string') message = json.error;
    } catch { /* keep fallback */ }
    if (response.status === 401) message = 'Session administrateur expirée.';
    if (response.status === 403) message = 'Vous n’avez pas les privilèges nécessaires pour cette opération.';
    throw new Error(message);
  }
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
  const [projectSlug, setProjectSlug] = useState(() => getAdminRoute().filters.projectSlug ?? 'all');
  const [buildingId, setBuildingId] = useState(() => getAdminRoute().filters.buildingId ?? 'all');
  const [status, setStatus] = useState(() => getAdminRoute().filters.status ?? 'all');
  const [type, setType] = useState(() => getAdminRoute().filters.type ?? 'all');
  const [search, setSearch] = useState(() => getAdminRoute().search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => getAdminRoute().search ?? '');
  const [page, setPage] = useState(() => getAdminRoute().page ?? 1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);
  const [mutationSnapshot, setMutationSnapshot] = useState<AdminMutationSnapshot>({ state: 'idle' });
  const [role, setRole] = useState<string | null>(null);
  const [detailId, setDetailId] = useState(() => getAdminRoute().entity === 'apartment' ? getAdminRoute().entityId ?? null : null);
  const [detail, setDetail] = useState<Apartment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailRetryKey, setDetailRetryKey] = useState(0);
  const [lastMutationPatch, setLastMutationPatch] = useState<Record<string, unknown> | null>(null);
  const [detailMutation, setDetailMutation] = useState<AdminMutationSnapshot>({ state: 'idle' });
  const detailMutationBusy = detailMutation.state === 'validating' || detailMutation.state === 'submitting';
  const detailMutationError = detailMutation.state === 'recoverable-error' ? detailMutation.error : null;
  const [priceDraft, setPriceDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const mutationBusyRef = useRef(false);

  useEffect(() => subscribeToAdminRoute((next) => {
    setSearch(next.search ?? '');
    setDebouncedSearch(next.search ?? '');
    setProjectSlug(next.filters.projectSlug ?? 'all');
    setBuildingId(next.filters.buildingId ?? 'all');
    setStatus(next.filters.status ?? 'all');
    setType(next.filters.type ?? 'all');
    setPage(next.page ?? 1);
    setDetailId(next.entity === 'apartment' ? next.entityId ?? null : null);
  }), []);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ user?: { role?: string } }>('/api/admin/me', { signal: controller.signal })
      .then((json) => setRole(json.user?.role ?? null))
      .catch(() => { if (!controller.signal.aborted) setRole(null); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!detailId) { setDetail(null); setDetailError(null); return; }
    const controller = new AbortController();
    setDetailLoading(true); setDetailError(null);
    getJson<{ data?: Apartment }>(`/api/admin/apartments/${encodeURIComponent(detailId)}?${new URLSearchParams({ id: detailId })}`, { signal: controller.signal })
      .then((json) => setDetail(json.data ?? null))
      .catch((err: unknown) => { if (!(err instanceof DOMException && err.name === 'AbortError')) setDetailError(err instanceof Error ? err.message : 'Impossible de charger l’appartement.'); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [detailId, detailRetryKey]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const first = await getJson<{ data?: ProjectOption[] }>(
          '/api/admin/projects?limit=100&status=all',
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setProjects(first.data ?? []);
      } catch {
        if (!controller.signal.aborted) setProjects([]);
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (projectSlug !== 'all') params.set('projectSlug', projectSlug);
    if (buildingId !== 'all') params.set('buildingId', buildingId);
    if (status !== 'all') params.set('status', status);
    if (type !== 'all') params.set('type', type);
    if (debouncedSearch) params.set('search', debouncedSearch);
    getJson<{ data?: Apartment[]; pagination?: Pagination }>(`/api/admin/apartments?${params}`, { signal: controller.signal })
      .then((json) => {
        setApartments(json.data ?? []);
        setError(null);
        setPagination(json.pagination ?? { page, limit: PAGE_SIZE, total: json.data?.length ?? 0, totalPages: json.data?.length ? 1 : 0 });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setApartments([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les appartements.');
      })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); } });
    return () => controller.abort();
  }, [page, projectSlug, buildingId, status, type, retryKey, debouncedSearch]);

  const effectivePage = pagination.totalPages > 0 ? Math.min(page, pagination.totalPages) : page;
  const filteredApartments = useMemo(() => apartments, [apartments]);
  const rangeStart = pagination.total === 0 ? 0 : (effectivePage - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(effectivePage * pagination.limit, pagination.total);

  function resetPage() { setPage(1); }
  function syncRoute(next: { search?: string; projectSlug?: string; buildingId?: string; status?: string; type?: string; page?: number }) {
    navigateAdminRoute({
      workspace: 'apartments',
      search: next.search ?? search,
      filters: {
        projectSlug: next.projectSlug ?? projectSlug,
        buildingId: next.buildingId ?? buildingId,
        status: next.status ?? status,
        type: next.type ?? type,
      },
      page: next.page ?? page,
    }, 'replace');
  }
  function clearFilters() {
    setProjectSlug('all'); setBuildingId('all'); setStatus('all'); setType('all'); setSearch(''); setDebouncedSearch(''); resetPage();
    syncRoute({ search: '', projectSlug: 'all', buildingId: 'all', status: 'all', type: 'all', page: 1 });
  }
  function refresh() { setRefreshing(true); setRetryKey((value) => value + 1); }

  const operationalReadiness = useMemo(() => apartments.map((apartment) => {
    const signals: OperationalSignal[] = [
      apartment.apartmentNumber || apartment.unitNumber ? 'complete' : 'incomplete',
      apartment.project?.id ? 'complete' : 'incomplete',
      apartment.building?.id ? 'complete' : 'incomplete',
      apartment.surface > 0 && apartment.apartmentType ? 'complete' : 'incomplete',
      apartment.priceOnRequest || apartment.price != null ? 'complete' : 'incomplete',
      apartment.status ? 'complete' : 'incomplete',
      apartment.heroImage ? 'complete' : 'unknown',
      apartment.published ? 'complete' : 'unknown',
    ];
    return { id: apartment.id, ...evaluateOperationalSignals(signals) };
  }), [apartments]);

  const hasFilters = projectSlug !== 'all' || buildingId !== 'all' || status !== 'all' || type !== 'all' || search.trim() !== '';

  function getApartmentPublicationReadiness(apartment: Apartment) {
    return evaluateApartmentPublicationReadiness(apartment as unknown as Record<string, unknown>);
  }

  async function executeMutation() {
    if (!pendingAction || mutationBusyRef.current || !canStartMutation(mutationSnapshot.state)) return;
    const { kind, apartment } = pendingAction;
    if (kind === 'publish' && !apartment.published) {
      const readiness = getApartmentPublicationReadiness(apartment);
      if (!readiness.ready) {
        setMutationError(`Publication bloquée : ${readiness.blockers.join(', ')}`);
        return;
      }
    }
    mutationBusyRef.current = true;
    const requestId = createMutationRequestId(`apartment-${kind}`);
    setMutationSnapshot({ state: 'validating', requestId });
    setMutationError(null); setMutationSuccess(null);
    try {
      setMutationSnapshot({ state: 'submitting', requestId });
      if (kind === 'publish') {
        await getJson(`/api/admin/apartments/${encodeURIComponent(apartment.slug)}?id=${encodeURIComponent(apartment.id)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !apartment.published }),
        });
        setMutationSnapshot(mutationSucceeded(requestId));
        setMutationSuccess(!apartment.published ? `« ${apartment.typeName} » est maintenant publié.` : `« ${apartment.typeName} » a été retiré de la publication.`);
      } else {
        await getJson(`/api/admin/apartments/${encodeURIComponent(apartment.slug)}?id=${encodeURIComponent(apartment.id)}`, { method: 'DELETE' });
        setMutationSnapshot(mutationSucceeded(requestId));
        setMutationSuccess(`« ${apartment.typeName} » a été archivé.`);
      }
      setPendingAction(null); setRetryKey((value) => value + 1); window.dispatchEvent(new Event('asas-admin-data-changed'));
    } catch (err) {
      const failure = mutationAfterFailure(err, requestId);
      setMutationSnapshot(failure);
      setMutationError(failure.error ?? 'L’opération a échoué.'); }
    finally { mutationBusyRef.current = false; }
  }

  const mutationBusy = mutationSnapshot.state === 'validating' || mutationSnapshot.state === 'submitting';

  async function updateApartmentDetail(patch: Record<string, unknown>) {
    if (patch.price !== undefined) { const n = Number(patch.price); if (!Number.isFinite(n) || n < 0) return; }
    if (patch.status !== undefined && typeof patch.status === 'string' && !patch.status.trim()) return;
    if (!detail || detailMutationBusy || !canStartMutation(detailMutation.state)) return;
    setLastMutationPatch(patch);
    const requestId = createMutationRequestId('apartment-detail');
    setDetailMutation({ state: 'validating', requestId });
    try {
      setDetailMutation({ state: 'submitting', requestId });
      const result = await getJson<{ data?: Apartment }>(`/api/admin/apartments/${encodeURIComponent(detail.slug)}?id=${encodeURIComponent(detail.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      setDetailMutation({ state: 'success', requestId });
      if (result.data) { setDetail(result.data); setLastMutationPatch(null); }
      setRetryKey((value) => value + 1);
      window.dispatchEvent(new Event('asas-admin-data-changed'));
    } catch (error) {
      setDetailMutation(mutationAfterFailure(error, requestId));
    }
  }

  if (detailId) {
    return (
      <section className="admin-apartments-workspace w-full" aria-labelledby="apartment-detail-title">
        <div className="mx-auto max-w-[1400px] space-y-5">
          <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue · Appartement</p><h1 id="apartment-detail-title" className="text-2xl font-bold text-charcoal sm:text-3xl">{detail?.typeName ?? 'Appartement'}</h1><p className="mt-1 text-sm text-muted-foreground">{detail?.project?.name ?? '—'}{detail?.building ? ` · ${detail.building.name}` : ''}</p></div>
            <Button variant="outline" onClick={() => navigateAdminRoute({ workspace: 'apartments', entity: undefined, entityId: undefined })} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour aux appartements</Button>
          </header>
          {detailLoading ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement…</CardContent></Card> : detailError ? <Card role="alert"><CardContent className="space-y-3 py-12 text-center"><p className="font-semibold">Impossible de charger l’appartement</p><p className="text-sm text-muted-foreground">{detailError}</p><Button onClick={() => setDetailRetryKey((key) => key + 1)}>Réessayer</Button></CardContent></Card> : detail ? <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['Surface', detail.surface ? `${detail.surface} m²` : '—'], ['Étage', detail.floor != null ? String(detail.floor) : '—'], ['Prix', detail.priceOnRequest ? 'Sur demande' : detail.price != null ? formatPrice(detail.price) : '—'], ['Statut', statusLabel(detail.status)],
              ].map(([label,value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></CardContent></Card>)}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Contexte & physique</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-muted-foreground">Projet</span><p className="font-medium">{detail.project?.name ?? '—'}</p></div><div><span className="text-muted-foreground">Bâtiment</span><p className="font-medium">{detail.building?.name ?? 'Non associé'}</p></div><div><span className="text-muted-foreground">Unité</span><p className="font-medium">{detail.apartmentNumber ?? detail.unitNumber ?? '—'}</p></div><div><span className="text-muted-foreground">Type</span><p className="font-medium">{detail.apartmentType} · {detail.typeName}</p></div><div><span className="text-muted-foreground">Chambres</span><p className="font-medium">{detail.bedrooms}</p></div><div><span className="text-muted-foreground">Salles de bain</span><p className="font-medium">{detail.bathrooms ?? '—'}</p></div><div><span className="text-muted-foreground">Orientation</span><p className="font-medium">{detail.orientation ?? '—'}</p></div><div><span className="text-muted-foreground">Parking</span><p className="font-medium">{detail.hasParking ? `${detail.parkingSpots ?? 1} place(s)` : 'Non'}</p></div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Commercial & publication</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
                <div className="flex flex-wrap items-end gap-2"><div className="min-w-[180px] flex-1"><span className="text-muted-foreground">Prix de vente (DZD)</span><Input className="mt-1" inputMode="decimal" type="number" min="0" step="1000" value={priceDraft || (detail.price != null ? String(detail.price) : '')} onChange={(e) => setPriceDraft(e.target.value)} aria-label="Prix en DZD" /></div><Button size="sm" disabled={detailMutationBusy || role === 'VIEWER' || !priceDraft} onClick={() => updateApartmentDetail({ price: Number(priceDraft), priceOnRequest: false })}>Enregistrer</Button></div>
                <div className="flex flex-wrap items-center gap-2"><span className="text-muted-foreground">Statut</span><Select value={statusDraft || detail.status} onValueChange={setStatusDraft} disabled={detailMutationBusy || role === 'VIEWER'}><SelectTrigger className="w-[190px]" aria-label="Statut appartement"><SelectValue /></SelectTrigger><SelectContent>{[detail.status, ...(Object.keys({ AVAILABLE: true, SOLD: true, COMING_SOON: true, OFF_MARKET: true, DRAFT: true } as const)).filter((value) => value !== detail.status && canTransitionApartmentStatus(detail.status, value))].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Button size="sm" variant="outline" disabled={detailMutationBusy || role === 'VIEWER' || !statusDraft || statusDraft === detail.status} onClick={() => updateApartmentDetail({ status: statusDraft })}>Appliquer</Button></div>
                <div className="flex flex-wrap items-center gap-2"><Button size="sm" disabled={detailMutationBusy || role === 'VIEWER'} onClick={() => {
                  if (!detail.published) {
                    const readiness = evaluateApartmentPublicationReadiness(detail as unknown as Record<string, unknown>);
                    if (!readiness.ready) {
                      setDetailMutation({ state: 'recoverable-error', error: `Publication bloquée : ${readiness.blockers.join(', ')}` });
                      return;
                    }
                  }
                  updateApartmentDetail({ published: !detail.published });
                }}>{detailMutationBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : detail.published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}{detail.published ? 'Dépublier' : 'Publier'}</Button>{detailMutationError && <><span role="alert" className="text-sm text-destructive">{detailMutationError}</span><Button variant="outline" size="sm" onClick={() => lastMutationPatch && updateApartmentDetail(lastMutationPatch)}>Réessayer</Button></>}</div>
                <div><span className="text-muted-foreground">Plan de paiement</span><p className="font-medium whitespace-pre-wrap">{detail.paymentPlan ?? 'Non renseigné'}</p></div>
                <div className="flex flex-wrap gap-2"><Badge variant={detail.published ? 'default' : 'secondary'}>{detail.published ? 'Publié' : 'Brouillon'}</Badge><Badge variant="outline">{detail.archived ? 'Archivé' : 'Actif'}</Badge></div>
                <div><span className="text-muted-foreground">SEO</span><p className="font-medium">{detail.seoTitle ?? 'Non renseigné'}</p><p className="text-xs text-muted-foreground">{detail.canonicalUrl ?? 'Canonical non renseignée'}</p></div>
              </CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Média</CardTitle></CardHeader><CardContent>{detail.imagesRelation?.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{detail.imagesRelation.map((image) => <div key={image.id} className="overflow-hidden rounded-md border"><img src={image.url} alt={image.alt ?? detail.typeName} className="aspect-square w-full object-cover" loading="lazy" /><p className="truncate px-2 py-1 text-xs text-muted-foreground">{image.type}</p></div>)}</div> : <p className="text-sm text-muted-foreground">Aucun média associé disponible.</p>}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Contenu éditorial</CardTitle></CardHeader><CardContent className="grid gap-4 lg:grid-cols-2"><div><p className="mb-1 text-xs font-medium text-muted-foreground">Description FR</p><p className="whitespace-pre-wrap text-sm">{detail.description ?? 'Non renseignée'}</p></div><div dir="rtl"><p className="mb-1 text-xs font-medium text-muted-foreground">Description AR</p><p className="whitespace-pre-wrap text-sm">{detail.descriptionAr ?? 'غير متوفرة'}</p></div></CardContent></Card>
          </> : null}
        </div>
      </section>
    );
  }
  return (
    <section className="admin-apartments-workspace w-full" aria-labelledby="apartments-workspace-title">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue</p><h1 id="apartments-workspace-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Appartements</h1><p className="mt-1 text-sm text-muted-foreground">Espace de gestion paginé, filtrable et stable pour le catalogue.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => navigateAdminRoute({ workspace: 'dashboard' })} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour au tableau de bord</Button><Button variant="outline" size="sm" onClick={refresh} disabled={loading || refreshing} className="gap-2" aria-label="Actualiser les appartements"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser</Button></div>
        </header>
        {mutationError && <div role="alert" className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"><span>{mutationError}</span><Button variant="outline" size="sm" onClick={() => setMutationError(null)}>Fermer</Button></div>}
        {mutationSuccess && <div role="status" className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"><span>{mutationSuccess}</span><Button variant="outline" size="sm" onClick={() => setMutationSuccess(null)}>Fermer</Button></div>}
        <Card><CardHeader className="pb-3"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" /> Filtres</CardTitle>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="w-fit gap-2"><X className="h-4 w-4" /> Effacer</Button>}</div></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5 text-sm font-medium"><span>Recherche</span><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); syncRoute({ search: e.target.value, page: 1 }); }} placeholder="N° unité, type, projet…" className="pl-9" /></div></label>
          <label className="space-y-1.5 text-sm font-medium"><span>Projet</span><Select value={projectSlug} onValueChange={(value) => { setProjectSlug(value); resetPage(); syncRoute({ projectSlug: value, page: 1 }); }}><SelectTrigger><SelectValue placeholder="Tous les projets" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les projets</SelectItem>{projects.map((p) => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}</SelectContent></Select></label>
          <label className="space-y-1.5 text-sm font-medium"><span>Statut</span><Select value={status} onValueChange={(value) => { setStatus(value); resetPage(); syncRoute({ status: value, page: 1 }); }}><SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{STATUS_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
          <label className="space-y-1.5 text-sm font-medium"><span>Type</span><Select value={type} onValueChange={(value) => { setType(value); resetPage(); syncRoute({ type: value, page: 1 }); }}><SelectTrigger><SelectValue placeholder="Tous les types" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les types</SelectItem><SelectItem value="F1">F1</SelectItem><SelectItem value="F2">F2</SelectItem><SelectItem value="F3">F3</SelectItem><SelectItem value="F4">F4</SelectItem><SelectItem value="F5">F5+</SelectItem><SelectItem value="Duplex">Duplex</SelectItem><SelectItem value="Studio">Studio</SelectItem><SelectItem value="Villa">Villa</SelectItem></SelectContent></Select></label>
        </div></CardContent></Card>
        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>{pagination.total.toLocaleString('fr-FR')} appartement{pagination.total > 1 ? 's' : ''} · {rangeStart}-{rangeEnd}</span>{loading && <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span>}</div>
        {error ? <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-semibold text-charcoal">Impossible de charger les appartements</p><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button onClick={() => setRetryKey((value) => value + 1)} className="gap-2"><RefreshCw className="h-4 w-4" /> Réessayer</Button></CardContent></Card> : loading && apartments.length === 0 ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des appartements…</CardContent></Card> : filteredApartments.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><Home className="h-8 w-8 text-muted-foreground" /><p className="font-semibold text-charcoal">Aucun appartement trouvé</p><p className="text-sm text-muted-foreground">{hasFilters ? 'Modifiez les filtres ou effacez-les pour élargir la recherche.' : 'Aucun appartement n’est disponible dans cette page.'}</p>{hasFilters && <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>}</CardContent></Card> : <Card className="overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Unité</TableHead><TableHead>Projet</TableHead><TableHead>Type</TableHead><TableHead>Surface</TableHead><TableHead>Étage</TableHead><TableHead>Prix</TableHead><TableHead>Statut</TableHead><TableHead>Publication</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredApartments.map((a) => <TableRow key={a.id} className={loading ? 'opacity-70' : undefined} onDoubleClick={() => navigateAdminRoute({ workspace: 'apartments', entity: 'apartment', entityId: a.id })} onKeyDown={(event) => { if (event.key === 'Enter') navigateAdminRoute({ workspace: 'apartments', entity: 'apartment', entityId: a.id }); }} tabIndex={0} aria-label={`Ouvrir ${a.typeName}`}><TableCell className="font-medium"><div>{a.apartmentNumber ?? a.unitNumber ?? '—'}</div>{(() => { const readiness = operationalReadiness.find((item) => item.id === a.id); return readiness ? <div className="mt-1 text-[11px] text-muted-foreground" title="État opérationnel calculé à partir des données disponibles">{readiness.completionRatio}% renseigné</div> : null; })()}</TableCell><TableCell><div className="min-w-[150px]"><div className="font-medium">{a.project.name}</div><div className="text-xs text-muted-foreground">{a.project.district}, {a.project.city}</div></div></TableCell><TableCell><div>{a.apartmentType}</div><div className="text-xs text-muted-foreground">{a.typeName}</div></TableCell><TableCell>{a.surface} m²</TableCell><TableCell>{a.floor ?? '—'}</TableCell><TableCell className="whitespace-nowrap">{a.priceOnRequest ? 'Sur demande' : a.price != null ? formatPrice(a.price) : '—'}</TableCell><TableCell><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(a.status)}`}>{statusLabel(a.status)}</span></TableCell><TableCell><Badge variant={a.published ? 'default' : 'secondary'}>{a.published ? 'Publié' : 'Brouillon'}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="outline" size="sm" className="h-8 gap-1 px-2" onClick={() => navigateAdminRoute({ workspace: 'apartments', entity: 'apartment', entityId: a.id })} aria-label={`Ouvrir ${a.typeName}`}><ChevronRight className="h-4 w-4" /><span className="sr-only">Ouvrir</span></Button><Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={() => { setMutationError(null); setMutationSuccess(null); setPendingAction({ kind: 'publish', apartment: a }); }} disabled={loading || pendingAction !== null || !role || !['ADMIN', 'EDITOR'].includes(role)} title={!role || !['ADMIN', 'EDITOR'].includes(role) ? 'Privilèges insuffisants' : (a.published ? 'Retirer de la publication' : 'Publier')} aria-label={a.published ? `Retirer ${a.typeName} de la publication` : `Publier ${a.typeName}`}>
              {a.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}<span className="sr-only">{a.published ? 'Retirer de la publication' : 'Publier'}</span></Button><Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-red-600 hover:text-red-700" onClick={() => { setMutationError(null); setMutationSuccess(null); setPendingAction({ kind: 'archive', apartment: a }); }} disabled={loading || pendingAction !== null || role !== 'ADMIN'} title={role !== 'ADMIN' ? 'Réservé aux administrateurs' : 'Archiver'} aria-label={`Archiver ${a.typeName}`}><Archive className="h-4 w-4" /><span className="sr-only">Archiver</span></Button></div></TableCell></TableRow>)}</TableBody></Table></div></Card>}
        <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Pagination des appartements"><p className="text-sm text-muted-foreground">Page {pagination.page} sur {Math.max(pagination.totalPages, 1)}</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => { const next = Math.max(1, page - 1); setPage(next); syncRoute({ page: next }); }} disabled={loading || page <= 1} className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédent</Button><Button variant="outline" size="sm" onClick={() => { const next = Math.min(Math.max(pagination.totalPages, 1), page + 1); setPage(next); syncRoute({ page: next }); }} disabled={loading || page >= pagination.totalPages || pagination.totalPages === 0} className="gap-1">Suivant <ChevronRight className="h-4 w-4" /></Button></div></nav>
      </div>
      <Dialog open={pendingAction !== null} onOpenChange={(open) => { if (!open && !mutationBusy) setPendingAction(null); }}><DialogContent><DialogHeader><DialogTitle>{pendingAction?.kind === 'archive' ? 'Archiver cet appartement ?' : pendingAction?.apartment.published ? 'Retirer la publication ?' : 'Publier cet appartement ?'}</DialogTitle><DialogDescription>{pendingAction?.kind === 'archive' ? `« ${pendingAction.apartment.typeName} » sera archivé et retiré du site public. Cette action est réservée aux administrateurs.` : pendingAction?.apartment.published ? `« ${pendingAction.apartment.typeName} » sera retiré du site public sans être archivé.` : `« ${pendingAction?.apartment.typeName} » sera rendu visible sur le site public.`}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setPendingAction(null)} disabled={mutationBusy}>Annuler</Button><Button variant={pendingAction?.kind === 'archive' ? 'destructive' : 'default'} onClick={executeMutation} disabled={mutationBusy} className="gap-2">{mutationBusy && <Loader2 className="h-4 w-4 animate-spin" />}{mutationBusy ? 'Traitement…' : pendingAction?.kind === 'archive' ? 'Archiver' : pendingAction?.apartment.published ? 'Retirer la publication' : 'Publier'}</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}

export default AdminApartmentsWorkspace;
