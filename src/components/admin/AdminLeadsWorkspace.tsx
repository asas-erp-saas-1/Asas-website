'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  intent: string;
  message?: string | null;
  projectName?: string | null;
  apartmentName?: string | null;
  source?: string | null;
  status: string;
  assignedTo?: string | null;
  followUpDate?: string | null;
  createdAt: string;
}

interface LeadMeta { page: number; limit: number; total: number; totalPages: number }
type PendingStatus = { lead: Lead; nextStatus: string } | null;

const STATUS_OPTIONS = [
  ['NEW', 'Nouveau'],
  ['CONTACTED', 'Contacté'],
  ['QUALIFIED', 'Qualifié'],
  ['VISIT', 'Visite prévue'],
  ['NEGOTIATION', 'Négociation'],
  ['SOLD', 'Vendu'],
  ['LOST', 'Perdu'],
] as const;

const INTENT_OPTIONS = [
  ['REQUEST_INFORMATION', 'Information'],
  ['REQUEST_PRICE', 'Prix'],
  ['REQUEST_FLOOR_PLAN', 'Plan'],
  ['BOOK_VISIT', 'Visite'],
  ['WHATSAPP', 'WhatsApp'],
  ['CALL', 'Appel'],
  ['RESERVATION', 'Réservation'],
] as const;

function labelOf(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
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

export function AdminLeadsWorkspace() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<LeadMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [intent, setIntent] = useState('all');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PendingStatus>(null);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search.trim()) params.set('search', search.trim());
    if (status !== 'all') params.set('status', status);
    if (intent !== 'all') params.set('intent', intent);
    if (source.trim()) params.set('source', source.trim());

    setLoading(true);
    setError(null);
    getJson<{ data?: Lead[]; pagination?: LeadMeta }>(`/api/admin/leads?${params.toString()}`, { signal: controller.signal })
      .then((json) => {
        setLeads(json.data ?? []);
        if (json.pagination) setMeta(json.pagination);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLeads([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les leads.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page, search, status, intent, source, retryKey]);

  useEffect(() => { if (!loading) setRefreshing(false); }, [loading]);
  useEffect(() => { if (meta.totalPages > 1 && page > meta.totalPages) setPage(meta.totalPages); }, [meta.totalPages, page]);

  const hasFilters = useMemo(() => status !== 'all' || intent !== 'all' || source.trim() !== '' || search.trim() !== '', [status, intent, source, search]);
  const firstResult = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const lastResult = Math.min(meta.page * meta.limit, meta.total);

  function refresh() { setRefreshing(true); setRetryKey((value) => value + 1); }
  function clearFilters() { setSearch(''); setStatus('all'); setIntent('all'); setSource(''); setPage(1); }

  async function updateStatus() {
    if (!pendingStatus) return;
    setMutationBusy(true); setFeedback(null);
    try {
      await getJson(`/api/admin/leads/${encodeURIComponent(pendingStatus.lead.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus.nextStatus }),
      });
      setFeedback({ type: 'success', text: `« ${pendingStatus.lead.name} » est maintenant « ${labelOf(STATUS_OPTIONS, pendingStatus.nextStatus)} ».` });
      setPendingStatus(null);
      setRetryKey((value) => value + 1);
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'La mise à jour a échoué.' });
    } finally { setMutationBusy(false); }
  }

  return (
    <section className="admin-leads-workspace min-h-screen bg-ivory p-4 sm:p-6 lg:p-8" aria-labelledby="leads-workspace-title">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Ventes</p><h1 id="leads-workspace-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Leads</h1><p className="mt-1 text-sm text-muted-foreground">Pipeline commercial opérationnel avec recherche, filtres et mise à jour sécurisée des statuts.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { window.location.hash = '#admin'; }} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour au tableau de bord</Button><Button variant="outline" size="sm" onClick={refresh} disabled={loading || refreshing} className="gap-2" aria-label="Actualiser les leads"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser</Button></div>
        </header>

        {feedback && <div role={feedback.type === 'error' ? 'alert' : 'status'} className={`flex flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><span>{feedback.text}</span><Button variant="outline" size="sm" onClick={() => setFeedback(null)}>Fermer</Button></div>}

        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4" /> Recherche et filtres</CardTitle>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2"><X className="h-4 w-4" /> Effacer</Button>}</div></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="space-y-1.5 text-sm font-medium lg:col-span-2"><span>Recherche</span><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nom, téléphone, email, projet…" /></label><label className="space-y-1.5 text-sm font-medium"><span>Statut</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="all">Tous les statuts</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium"><span>Intention</span><select value={intent} onChange={(event) => { setIntent(event.target.value); setPage(1); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="all">Toutes</option>{INTENT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium"><span>Source</span><Input value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} placeholder="Facebook, Google…" /></label></div></CardContent></Card>

        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>{meta.total > 0 ? `${firstResult.toLocaleString('fr-FR')}–${lastResult.toLocaleString('fr-FR')} sur ${meta.total.toLocaleString('fr-FR')} lead${meta.total > 1 ? 's' : ''}` : '0 lead'}</span>{loading && <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span>}</div>

        {error ? <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-semibold text-charcoal">Impossible de charger les leads</p><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button onClick={() => setRetryKey((value) => value + 1)} className="gap-2"><RefreshCw className="h-4 w-4" /> Réessayer</Button></CardContent></Card>
        : loading && leads.length === 0 ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des leads…</CardContent></Card>
        : leads.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><Users className="h-8 w-8 text-muted-foreground" /><p className="font-semibold text-charcoal">Aucun lead trouvé</p><p className="text-sm text-muted-foreground">Modifiez les critères ou effacez les filtres pour élargir la vue.</p>{hasFilters && <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>}</CardContent></Card>
        : <Card className="overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Lead</TableHead><TableHead>Contact</TableHead><TableHead>Intention</TableHead><TableHead>Projet / lot</TableHead><TableHead>Source</TableHead><TableHead>Statut</TableHead><TableHead>Créé</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{leads.map((lead) => <TableRow key={lead.id} className={loading ? 'opacity-70' : undefined}><TableCell><div className="min-w-[150px]"><div className="font-medium">{lead.name}</div>{lead.assignedTo && <div className="text-xs text-muted-foreground">Assigné à {lead.assignedTo}</div>}</div></TableCell><TableCell><div className="min-w-[150px]"><div className="text-sm">{lead.phone}</div>{lead.email && <div className="max-w-[220px] truncate text-xs text-muted-foreground" title={lead.email}>{lead.email}</div>}</div></TableCell><TableCell><Badge variant="secondary">{labelOf(INTENT_OPTIONS, lead.intent)}</Badge></TableCell><TableCell><div className="min-w-[140px]">{lead.projectName ?? lead.apartmentName ?? '—'}{lead.projectName && lead.apartmentName && <div className="text-xs text-muted-foreground">{lead.apartmentName}</div>}</div></TableCell><TableCell className="text-sm">{lead.source ?? '—'}</TableCell><TableCell><select aria-label={`Statut de ${lead.name}`} value={lead.status} onChange={(event) => setPendingStatus({ lead, nextStatus: event.target.value })} disabled={mutationBusy} className="h-9 rounded-md border border-input bg-background px-2 text-sm">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></TableCell><TableCell className="whitespace-nowrap text-sm">{formatDate(lead.createdAt)}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setPendingStatus({ lead, nextStatus: lead.status })}>Détails</Button></TableCell></TableRow>)}</TableBody></Table></div><div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted-foreground">Page {meta.page} sur {meta.totalPages}</span><nav aria-label="Pagination des leads" className="flex items-center gap-1"><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1} aria-label="Page précédente" className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédente</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} disabled={loading || page >= meta.totalPages} aria-label="Page suivante" className="gap-1">Suivante <ChevronRight className="h-4 w-4" /></Button></nav></div></Card>}
      </div>

      <Dialog open={pendingStatus !== null} onOpenChange={(open) => { if (!open && !mutationBusy) setPendingStatus(null); }}><DialogContent><DialogHeader><DialogTitle>{pendingStatus && pendingStatus.nextStatus === pendingStatus.lead.status ? `Détails — ${pendingStatus.lead.name}` : 'Confirmer le changement de statut'}</DialogTitle><DialogDescription>{pendingStatus && pendingStatus.nextStatus === pendingStatus.lead.status ? pendingStatus.lead.message || 'Aucun message fourni par le prospect.' : `Le lead « ${pendingStatus?.lead.name} » passera de « ${labelOf(STATUS_OPTIONS, pendingStatus?.lead.status ?? '')} » à « ${labelOf(STATUS_OPTIONS, pendingStatus?.nextStatus ?? '') } ».`}</DialogDescription></DialogHeader>{pendingStatus && pendingStatus.nextStatus === pendingStatus.lead.status ? <div className="space-y-3 text-sm"><div><span className="font-medium">Téléphone :</span> {pendingStatus.lead.phone}</div>{pendingStatus.lead.email && <div><span className="font-medium">Email :</span> {pendingStatus.lead.email}</div>}{pendingStatus.lead.projectName && <div><span className="font-medium">Projet :</span> {pendingStatus.lead.projectName}</div>}{pendingStatus.lead.apartmentName && <div><span className="font-medium">Lot :</span> {pendingStatus.lead.apartmentName}</div>}{pendingStatus.lead.followUpDate && <div><span className="font-medium">Suivi :</span> {formatDate(pendingStatus.lead.followUpDate)}</div>}</div> : null}<DialogFooter>{pendingStatus && pendingStatus.nextStatus === pendingStatus.lead.status ? <Button variant="outline" onClick={() => setPendingStatus(null)}>Fermer</Button> : <><Button variant="outline" onClick={() => setPendingStatus(null)} disabled={mutationBusy}>Annuler</Button><Button onClick={updateStatus} disabled={mutationBusy} className="gap-2">{mutationBusy && <Loader2 className="h-4 w-4 animate-spin" />} {mutationBusy ? 'Traitement…' : 'Confirmer'}</Button></>}</DialogFooter></DialogContent></Dialog>
    </section>
  );
}

export default AdminLeadsWorkspace;
