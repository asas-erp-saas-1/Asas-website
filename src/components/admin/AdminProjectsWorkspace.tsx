'use client';

import { useEffect, useState } from 'react';
import { Archive, Building2, ChevronLeft, ChevronRight, Eye, EyeOff, Filter, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Project {
  id: string;
  slug: string;
  name: string;
  city: string;
  district: string;
  projectType: string;
  status: string;
  published: boolean;
  featured: boolean;
  startingPrice?: number;
  priceOnRequest: boolean;
  deliveryYear?: number;
  deliveryQuarter?: string;
  apartmentCount: number;
  heroImage: string | null;
  developer?: { id: string; name: string; slug: string };
  order: number;
}

interface ProjectMeta { page: number; limit: number; total: number; totalPages: number }
type PendingAction = { kind: 'publish' | 'archive'; project: Project } | null;

const STATUS_OPTIONS = [
  ['AVAILABLE', 'Disponible'],
  ['COMING_SOON', 'Bientôt'],
  ['SOLD_OUT', 'Épuisé'],
  ['DRAFT', 'Brouillon'],
] as const;

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

function statusLabel(status: string) { return STATUS_OPTIONS.find(([value]) => value === status)?.[1] ?? status; }

export function AdminProjectsWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<ProjectMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search.trim()) params.set('search', search.trim());
    if (status !== 'all') params.set('status', status);

    setLoading(true);
    setError(null);
    getJson<{ data?: Project[]; meta?: ProjectMeta }>(`/api/admin/projects?${params.toString()}`, { signal: controller.signal })
      .then((json) => {
        setProjects(json.data ?? []);
        if (json.meta) setMeta(json.meta);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setProjects([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les projets.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, search, status, retryKey]);

  useEffect(() => { if (!loading) setRefreshing(false); }, [loading]);

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) setPage(meta.totalPages);
  }, [meta.totalPages, page]);

  const normalizedSearch = search.trim();
  const hasFilters = status !== 'all' || normalizedSearch !== '';

  function refresh() { setRefreshing(true); setRetryKey((value) => value + 1); }
  function clearFilters() { setSearch(''); setStatus('all'); setPage(1); }
  function changeSearch(value: string) { setSearch(value); setPage(1); }
  function changeStatus(value: string) { setStatus(value); setPage(1); }

  async function executeMutation() {
    if (!pendingAction) return;
    const { kind, project } = pendingAction;
    setMutationError(null); setMutationSuccess(null);
    try {
      if (kind === 'publish') {
        await getJson(`/api/admin/projects/${encodeURIComponent(project.slug)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: !project.published }),
        });
        setMutationSuccess(!project.published ? `« ${project.name} » est maintenant publié.` : `« ${project.name} » a été retiré de la publication.`);
      } else {
        await getJson(`/api/admin/projects/${encodeURIComponent(project.slug)}`, { method: 'DELETE' });
        setMutationSuccess(`« ${project.name} » a été archivé.`);
      }
      setPendingAction(null);
      setRetryKey((value) => value + 1);
    } catch (err) { setMutationError(err instanceof Error ? err.message : 'L’opération a échoué.'); }
  }

  const mutationBusy = pendingAction !== null && mutationError === null && mutationSuccess === null;
  const firstResult = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const lastResult = Math.min(meta.page * meta.limit, meta.total);

  return (
    <section className="admin-projects-workspace w-full" aria-labelledby="projects-workspace-title">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue</p><h1 id="projects-workspace-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Projets</h1><p className="mt-1 text-sm text-muted-foreground">Vue opérationnelle du portefeuille immobilier avec recherche, pagination et actions sécurisées.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { window.location.hash = '#/admin'; }} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour au tableau de bord</Button><Button variant="outline" size="sm" onClick={refresh} disabled={loading || refreshing} className="gap-2" aria-label="Actualiser les projets"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser</Button></div>
        </header>

        {mutationError && <div role="alert" className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"><span>{mutationError}</span><Button variant="outline" size="sm" onClick={() => setMutationError(null)}>Fermer</Button></div>}
        {mutationSuccess && <div role="status" className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"><span>{mutationSuccess}</span><Button variant="outline" size="sm" onClick={() => setMutationSuccess(null)}>Fermer</Button></div>}

        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" /> Filtres</CardTitle>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2"><X className="h-4 w-4" /> Effacer</Button>}</div></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium"><span>Recherche</span><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Projet, ville, quartier, promoteur…" className="pl-9" /></div></label><label className="space-y-1.5 text-sm font-medium"><span>Statut</span><select value={status} onChange={(event) => changeStatus(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="all">Tous les statuts</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></CardContent></Card>

        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>{meta.total > 0 ? `${firstResult.toLocaleString('fr-FR')}–${lastResult.toLocaleString('fr-FR')} sur ${meta.total.toLocaleString('fr-FR')} projet${meta.total > 1 ? 's' : ''}` : '0 projet'}</span>{loading && <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span>}</div>

        {error ? <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-semibold text-charcoal">Impossible de charger les projets</p><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button onClick={() => setRetryKey((value) => value + 1)} className="gap-2"><RefreshCw className="h-4 w-4" /> Réessayer</Button></CardContent></Card>
        : loading && projects.length === 0 ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des projets…</CardContent></Card>
        : projects.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><Building2 className="h-8 w-8 text-muted-foreground" /><p className="font-semibold text-charcoal">Aucun projet trouvé</p><p className="text-sm text-muted-foreground">Modifiez les critères ou effacez les filtres pour élargir la vue.</p>{hasFilters && <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>}</CardContent></Card>
        : <Card className="overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Projet</TableHead><TableHead>Localisation</TableHead><TableHead>Statut</TableHead><TableHead>Appartements</TableHead><TableHead>Publication</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{projects.map((project) => <TableRow key={project.id} className={loading ? 'opacity-70' : undefined}>
          <TableCell><div className="min-w-[180px]"><div className="font-medium">{project.name}</div><div className="text-xs text-muted-foreground">{project.slug}</div></div></TableCell><TableCell><div>{project.district}</div><div className="text-xs text-muted-foreground">{project.city}</div></TableCell><TableCell><span className="inline-flex items-center rounded-md border bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{statusLabel(project.status)}</span></TableCell><TableCell>{project.apartmentCount.toLocaleString('fr-FR')}</TableCell><TableCell><Badge variant={project.published ? 'default' : 'secondary'}>{project.published ? 'Publié' : 'Brouillon'}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setMutationError(null); setMutationSuccess(null); setPendingAction({ kind: 'publish', project }); }} disabled={loading || pendingAction !== null} title={project.published ? 'Retirer de la publication' : 'Publier'} aria-label={project.published ? `Retirer ${project.name} de la publication` : `Publier ${project.name}`}><span aria-hidden="true">{project.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</span><span className="sr-only">{project.published ? 'Retirer de la publication' : 'Publier'}</span></Button><Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700" onClick={() => { setMutationError(null); setMutationSuccess(null); setPendingAction({ kind: 'archive', project }); }} disabled={loading || pendingAction !== null} title="Archiver" aria-label={`Archiver ${project.name}`}><Archive className="h-4 w-4" /><span className="sr-only">Archiver</span></Button></div></TableCell>
        </TableRow>)}</TableBody></Table></div><div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted-foreground">Page {meta.page} sur {meta.totalPages}</span><nav aria-label="Pagination des projets" className="flex items-center gap-1"><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1} aria-label="Page précédente" className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédente</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} disabled={loading || page >= meta.totalPages} aria-label="Page suivante" className="gap-1">Suivante <ChevronRight className="h-4 w-4" /></Button></nav></div></Card>}
      </div>

      <Dialog open={pendingAction !== null} onOpenChange={(open) => { if (!open && !mutationBusy) setPendingAction(null); }}><DialogContent><DialogHeader><DialogTitle>{pendingAction?.kind === 'archive' ? 'Archiver ce projet ?' : pendingAction?.project.published ? 'Retirer la publication ?' : 'Publier ce projet ?'}</DialogTitle><DialogDescription>{pendingAction?.kind === 'archive' ? `« ${pendingAction.project.name} » sera archivé et retiré du site public. Cette action est réservée aux administrateurs.` : pendingAction?.project.published ? `« ${pendingAction.project.name} » sera retiré du site public sans être archivé.` : `« ${pendingAction?.project.name} » sera rendu visible sur le site public.`}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setPendingAction(null)} disabled={mutationBusy}>Annuler</Button><Button variant={pendingAction?.kind === 'archive' ? 'destructive' : 'default'} onClick={executeMutation} disabled={mutationBusy} className="gap-2">{mutationBusy && <Loader2 className="h-4 w-4 animate-spin" />}{mutationBusy ? 'Traitement…' : pendingAction?.kind === 'archive' ? 'Archiver' : pendingAction?.project.published ? 'Retirer la publication' : 'Publier'}</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}

export default AdminProjectsWorkspace;
