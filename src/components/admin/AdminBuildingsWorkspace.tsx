'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Project = { id: string; slug: string; name: string };
type Building = {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  code: string;
  floors: number;
  hasElevator: boolean;
  order: number;
  project: Project;
  apartmentCount: number;
};
type Meta = { page: number; limit: number; total: number; totalPages: number };

type FormState = {
  projectId: string;
  name: string;
  nameAr: string;
  code: string;
  floors: string;
  hasElevator: boolean;
  order: string;
};

const emptyForm: FormState = { projectId: '', name: '', nameAr: '', code: '', floors: '1', hasElevator: false, order: '0' };

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  if (!response.ok) {
    let message = 'Opération impossible.';
    try { const json = await response.json(); if (typeof json?.error === 'string') message = json.error; } catch { /* fallback */ }
    if (response.status === 401) message = 'Session administrateur expirée.';
    if (response.status === 403) message = 'Vous n’avez pas les privilèges nécessaires pour cette opération.';
    throw new Error(message);
  }
  return response.json();
}

export default function AdminBuildingsWorkspace() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [projectId, setProjectId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleRetryKey, setRoleRetryKey] = useState(0);
  const [projectRetryKey, setProjectRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setProjectError(null);

    (async () => {
      try {
        const first = await getJson<{ data?: Project[]; meta?: { totalPages?: number } }>(
          '/api/admin/projects?limit=100&page=1',
          { signal: controller.signal },
        );
        const pages = Math.max(1, first.meta?.totalPages ?? 1);
        const all = [...(first.data ?? [])];

        for (let page = 2; page <= pages; page += 1) {
          const next = await getJson<{ data?: Project[] }>(
            `/api/admin/projects?limit=100&page=${page}`,
            { signal: controller.signal },
          );
          all.push(...(next.data ?? []));
        }
        if (!controller.signal.aborted) setProjects(all);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setProjects([]);
        setProjectError(err instanceof Error ? err.message : 'Impossible de charger les projets.');
      }
    })();

    setRoleError(null);
    getJson<{ user?: { role?: string } }>('/api/admin/me', { signal: controller.signal })
      .then((json) => { if (!controller.signal.aborted) setRole(json.user?.role ?? null); })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setRole(null);
          setRoleError(err instanceof Error ? err.message : 'Impossible de vérifier vos privilèges.');
        }
      });

    return () => controller.abort();
  }, [projectRetryKey, roleRetryKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (projectId !== 'all') params.set('projectId', projectId);

    setLoading(true);
    setError(null);
    getJson<{ data?: Building[]; meta?: Meta }>(`/api/admin/buildings?${params.toString()}`, { signal: controller.signal })
      .then((json) => { setBuildings(json.data ?? []); if (json.meta) setMeta(json.meta); })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setBuildings([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les bâtiments.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, projectId, retryKey, search]);

  useEffect(() => { if (!loading) setRefreshing(false); }, [loading]);
  useEffect(() => { if (meta.totalPages > 0 && page > meta.totalPages) setPage(meta.totalPages); }, [meta.totalPages, page]);

  const hasFilters = useMemo(() => Boolean(search.trim()) || projectId !== 'all', [projectId, search]);
  const firstResult = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const lastResult = Math.min(meta.page * meta.limit, meta.total);

  function clearFilters() { setSearch(''); setProjectId('all'); setPage(1); }
  function refresh() { setRefreshing(true); setRetryKey((value) => value + 1); }

  function openCreate() {
    setForm({ ...emptyForm, projectId: projectId !== 'all' ? projectId : '' });
    setCreateError(null);
    setCreateOpen(true);
  }

  async function createBuilding() {
    const name = form.name.trim();
    const code = form.code.trim();
    const floors = Number(form.floors);
    const order = Number(form.order);
    if (!form.projectId || !name || !code || !Number.isInteger(floors) || floors < 1 || !Number.isInteger(order)) {
      setCreateError('Projet, nom, code, nombre d’étages valide et ordre entier sont obligatoires.');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await getJson('/api/admin/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: form.projectId,
          name,
          nameAr: form.nameAr.trim() || null,
          code,
          floors,
          hasElevator: form.hasElevator,
          order,
          slug: slugify(`${projects.find((project) => project.id === form.projectId)?.slug ?? 'project'}-${form.code}-${name}`),
        }),
      });
      setCreateOpen(false);
      setFeedback({ type: 'success', text: `Le bâtiment « ${name} » a été créé.` });
      setPage(1);
      setRetryKey((value) => value + 1);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'La création a échoué.');
    } finally { setCreating(false); }
  }

  return (
    <section className="admin-buildings-workspace w-full" aria-labelledby="buildings-workspace-title">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue</p><h1 id="buildings-workspace-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Bâtiments</h1><p className="mt-1 text-sm text-muted-foreground">Vue opérationnelle des bâtiments, de leur projet et du nombre de lots associés.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { window.location.hash = '#/admin'; }} className="gap-2"><X className="h-4 w-4" /> Retour</Button><Button variant="outline" size="sm" onClick={refresh} disabled={loading || refreshing} className="gap-2"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser</Button><Button size="sm" onClick={openCreate} disabled={role !== 'ADMIN' && role !== 'EDITOR'} title={role ? undefined : 'Vérification des privilèges…'} className="gap-2"><Plus className="h-4 w-4" /> Nouveau bâtiment</Button></div>
        </header>

        {feedback && <div role={feedback.type === 'error' ? 'alert' : 'status'} className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"><span>{feedback.text}</span><Button variant="outline" size="sm" onClick={() => setFeedback(null)}>Fermer</Button></div>}

        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4" /> Recherche et filtres</CardTitle>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">Effacer</Button>}</div></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium"><span>Recherche</span><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nom, code, slug ou projet…" /></label><label className="space-y-1.5 text-sm font-medium"><span>Projet</span>{projectError && <span role="alert" className="block text-xs font-normal text-red-700">{projectError} <button type="button" className="underline" onClick={() => setProjectRetryKey((value) => value + 1)}>Réessayer</button></span>}<select value={projectId} onChange={(event) => { setProjectId(event.target.value); setPage(1); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="all">Tous les projets</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div></CardContent></Card>

        {roleError && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><span>Vérification des privilèges impossible. La création reste désactivée jusqu’à confirmation de votre rôle.</span><Button variant="outline" size="sm" onClick={() => setRoleRetryKey((value) => value + 1)}>Réessayer</Button></div>}

        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>{meta.total > 0 ? `${firstResult.toLocaleString('fr-FR')}–${lastResult.toLocaleString('fr-FR')} sur ${meta.total.toLocaleString('fr-FR')} bâtiment${meta.total > 1 ? 's' : ''}` : '0 bâtiment'}</span>{loading && <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span>}</div>

        {error ? <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-semibold text-charcoal">Impossible de charger les bâtiments</p><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button onClick={() => setRetryKey((value) => value + 1)} className="gap-2"><RefreshCw className="h-4 w-4" /> Réessayer</Button></CardContent></Card>
        : loading && buildings.length === 0 ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des bâtiments…</CardContent></Card>
        : buildings.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><Building2 className="h-8 w-8 text-muted-foreground" /><p className="font-semibold text-charcoal">Aucun bâtiment trouvé</p><p className="text-sm text-muted-foreground">Modifiez les critères ou effacez les filtres.</p>{hasFilters && <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>}</CardContent></Card>
        : <Card className="overflow-hidden"><div className="overflow-x-auto"><Table className="min-w-[760px]"><TableHeader><TableRow><TableHead>Bâtiment</TableHead><TableHead>Projet</TableHead><TableHead>Code</TableHead><TableHead>Étages</TableHead><TableHead>Ascenseur</TableHead><TableHead>Lots</TableHead><TableHead>Ordre</TableHead></TableRow></TableHeader><TableBody>{buildings.map((building) => <TableRow key={building.id}><TableCell><div className="min-w-[180px]"><div className="font-medium">{building.name}</div>{building.nameAr && <div dir="rtl" className="text-xs text-muted-foreground">{building.nameAr}</div>}<div className="text-xs text-muted-foreground">{building.slug}</div></div></TableCell><TableCell><div className="min-w-[150px] text-sm">{building.project?.name ?? '—'}</div></TableCell><TableCell><Badge variant="secondary">{building.code}</Badge></TableCell><TableCell className="text-sm">{building.floors}</TableCell><TableCell className="text-sm">{building.hasElevator ? 'Oui' : 'Non'}</TableCell><TableCell className="text-sm font-medium">{building.apartmentCount}</TableCell><TableCell className="text-sm">{building.order}</TableCell></TableRow>)}</TableBody></Table></div><div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted-foreground">Page {meta.page} sur {meta.totalPages}</span><nav aria-label="Pagination des bâtiments" className="flex items-center gap-1"><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1} aria-label="Page précédente" className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédente</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} disabled={loading || page >= meta.totalPages} aria-label="Page suivante" className="gap-1">Suivante <ChevronRight className="h-4 w-4" /></Button></nav></div></Card>}
      </div>

      <Dialog open={createOpen} onOpenChange={(open) => { if (!creating) setCreateOpen(open); }}><DialogContent><DialogHeader><DialogTitle>Nouveau bâtiment</DialogTitle><DialogDescription>Ajoutez un bâtiment au catalogue. Le slug est généré automatiquement à partir du code et du nom.</DialogDescription></DialogHeader><div className="grid gap-3 py-2"><label className="space-y-1.5 text-sm font-medium"><span>Projet *</span><select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Sélectionner un projet</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium"><span>Nom *</span><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Bâtiment A" /></label><label className="space-y-1.5 text-sm font-medium"><span>Nom arabe</span><Input value={form.nameAr} onChange={(event) => setForm((current) => ({ ...current, nameAr: event.target.value }))} dir="rtl" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium"><span>Code *</span><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="A" /></label><label className="space-y-1.5 text-sm font-medium"><span>Nombre d’étages *</span><Input type="number" min="1" step="1" value={form.floors} onChange={(event) => setForm((current) => ({ ...current, floors: event.target.value }))} /></label></div><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium"><span>Ordre</span><Input type="number" step="1" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} /></label><label className="flex items-center gap-2 pt-7 text-sm font-medium"><input type="checkbox" checked={form.hasElevator} onChange={(event) => setForm((current) => ({ ...current, hasElevator: event.target.checked }))} /> Ascenseur</label></div>{createError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{createError}</p>}</div><DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Annuler</Button><Button onClick={createBuilding} disabled={creating} className="gap-2">{creating && <Loader2 className="h-4 w-4 animate-spin" />} Créer le bâtiment</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}
