'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Loader2, Mail, Phone, RefreshCw, Search, UserRound, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
interface LeadNote { id: string; authorEmail?: string | null; body: string; createdAt: string }
type StatusRequest = { lead: Lead; nextStatus: string } | null;

const STATUS_OPTIONS = [
  ['NEW', 'Nouveau'], ['CONTACTED', 'Contacté'], ['QUALIFIED', 'Qualifié'], ['VISIT', 'Visite prévue'],
  ['NEGOTIATION', 'Négociation'], ['SOLD', 'Vendu'], ['LOST', 'Perdu'],
] as const;

const INTENT_OPTIONS = [
  ['REQUEST_INFORMATION', 'Information'], ['REQUEST_PRICE', 'Prix'], ['REQUEST_FLOOR_PLAN', 'Plan'],
  ['BOOK_VISIT', 'Visite'], ['WHATSAPP', 'WhatsApp'], ['CALL', 'Appel'], ['RESERVATION', 'Réservation'],
] as const;

function labelOf(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  if (!response.ok) {
    let message = 'Opération impossible.';
    try {
      const json: unknown = await response.json();
      if (typeof json === 'object' && json !== null && 'error' in json && typeof json.error === 'string') message = json.error;
    } catch { /* fallback */ }
    if (response.status === 401) message = 'Session administrateur expirée.';
    if (response.status === 403) message = 'Vous n’avez pas les privilèges nécessaires pour cette opération.';
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function AdminLeadsPremiumWorkspace() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<LeadMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState('all');
  const [intent, setIntent] = useState('all');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusRequest, setStatusRequest] = useState<StatusRequest>(null);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notesLead, setNotesLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const notesRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    const query = deferredSearch.trim();
    const sourceQuery = source.trim();
    if (query) params.set('search', query);
    if (status !== 'all') params.set('status', status);
    if (intent !== 'all') params.set('intent', intent);
    if (sourceQuery) params.set('source', sourceQuery);

    setLoading(true);
    setError(null);
    getJson<{ data?: Lead[]; pagination?: LeadMeta }>(`/api/admin/leads?${params.toString()}`, { signal: controller.signal })
      .then((json) => {
        if (controller.signal.aborted) return;
        setLeads(json.data ?? []);
        setMeta(json.pagination ?? { page, limit: 20, total: 0, totalPages: 1 });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return;
        setLeads([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les leads.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, deferredSearch, status, intent, source, retryKey]);

  useEffect(() => { if (!loading) setRefreshing(false); }, [loading]);
  useEffect(() => { if (page > meta.totalPages) setPage(Math.max(1, meta.totalPages)); }, [meta.totalPages, page]);

  const hasFilters = useMemo(() => status !== 'all' || intent !== 'all' || source.trim() !== '' || search.trim() !== '', [status, intent, source, search]);
  const firstResult = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const lastResult = Math.min(meta.page * meta.limit, meta.total);

  function resetPage() { setPage(1); }
  function clearFilters() { setSearch(''); setStatus('all'); setIntent('all'); setSource(''); resetPage(); }
  function refresh() { setRefreshing(true); setRetryKey((value) => value + 1); }

  async function openNotes(lead: Lead) {
    notesRequestRef.current?.abort();
    const controller = new AbortController();
    notesRequestRef.current = controller;

    setNotesLead(lead);
    setNotes([]);
    setNoteDraft('');
    setNotesError(null);
    setNotesLoading(true);
    try {
      const json = await getJson<{ data?: LeadNote[] }>(
        `/api/admin/leads/${encodeURIComponent(lead.id)}/notes`,
        { signal: controller.signal },
      );
      if (controller.signal.aborted || notesRequestRef.current !== controller) return;
      setNotes(json.data ?? []);
    } catch (err) {
      if (controller.signal.aborted || notesRequestRef.current !== controller) return;
      setNotesError(err instanceof Error ? err.message : 'Impossible de charger les notes.');
    } finally {
      if (!controller.signal.aborted && notesRequestRef.current === controller) {
        setNotesLoading(false);
        notesRequestRef.current = null;
      }
    }
  }

  async function addNote() {
    if (!notesLead || !noteDraft.trim()) return;
    setNoteSaving(true);
    setNotesError(null);
    try {
      const json = await getJson<{ data?: LeadNote }>(`/api/admin/leads/${encodeURIComponent(notesLead.id)}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: noteDraft.trim() }),
      });
      if (json.data) setNotes((current) => [json.data!, ...current]);
      setNoteDraft('');
      setFeedback({ type: 'success', text: `Note ajoutée à « ${notesLead.name} ».` });
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : 'Impossible d’ajouter la note.');
    } finally {
      setNoteSaving(false);
    }
  }

  async function updateStatus() {
    if (!statusRequest) return;
    const request = statusRequest;
    if (request.nextStatus === request.lead.status) { setStatusRequest(null); return; }
    setMutationBusy(true);
    setFeedback(null);
    try {
      await getJson(`/api/admin/leads/${encodeURIComponent(request.lead.id)}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: request.nextStatus }),
      });
      setFeedback({ type: 'success', text: `« ${request.lead.name} » est maintenant « ${labelOf(STATUS_OPTIONS, request.nextStatus)} ».` });
      setStatusRequest(null);
      setSelectedLead((current) => current ? { ...current, status: request.nextStatus } : current);
      setRetryKey((value) => value + 1);
      window.dispatchEvent(new Event('asas-admin-data-changed'));
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'La mise à jour a échoué.' });
    } finally { setMutationBusy(false); }
  }

  function openStatusForLead(lead: Lead) {
    setSelectedLead(null);
    setStatusRequest({ lead, nextStatus: lead.status });
  }

  return (
    <section className="admin-leads-workspace w-full" aria-labelledby="leads-workspace-title">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Ventes</p><h1 id="leads-workspace-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Leads</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Pipeline commercial opérationnel. Recherchez, qualifiez et suivez chaque prospect sans perdre le contexte.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { window.location.hash = '#/admin'; }} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour</Button><Button variant="outline" size="sm" onClick={refresh} disabled={loading || refreshing} className="gap-2" aria-label="Actualiser les leads"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser</Button></div>
        </header>

        {feedback && <div role={feedback.type === 'error' ? 'alert' : 'status'} className="flex flex-col gap-2 rounded-md border border-border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{feedback.text}</span><Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>Fermer</Button></div>}

        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4" /> Recherche et filtres</CardTitle>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2"><X className="h-4 w-4" /> Effacer</Button>}</div></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5 text-sm font-medium lg:col-span-2"><span>Recherche</span><Input value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Nom, téléphone, email, projet…" aria-describedby="lead-search-help" /><span id="lead-search-help" className="text-xs font-normal text-muted-foreground">Recherche serveur après stabilisation de la saisie.</span></label>
          <label className="space-y-1.5 text-sm font-medium"><span>Statut</span><select value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="all">Tous les statuts</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="space-y-1.5 text-sm font-medium"><span>Intention</span><select value={intent} onChange={(event) => { setIntent(event.target.value); resetPage(); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="all">Toutes</option>{INTENT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="space-y-1.5 text-sm font-medium"><span>Source</span><Input value={source} onChange={(event) => { setSource(event.target.value); resetPage(); }} placeholder="Facebook, Google…" /></label>
        </div></CardContent></Card>

        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><span>{meta.total > 0 ? `${firstResult.toLocaleString('fr-FR')}–${lastResult.toLocaleString('fr-FR')} sur ${meta.total.toLocaleString('fr-FR')} lead${meta.total > 1 ? 's' : ''}` : '0 lead'}</span>{loading && <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span>}</div>

        {error ? <Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="font-semibold text-charcoal">Impossible de charger les leads</p><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button onClick={refresh} className="gap-2"><RefreshCw className="h-4 w-4" /> Réessayer</Button></CardContent></Card>
        : loading && leads.length === 0 ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des leads…</CardContent></Card>
        : leads.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><UserRound className="h-8 w-8 text-muted-foreground" /><p className="font-semibold text-charcoal">Aucun lead trouvé</p><p className="text-sm text-muted-foreground">Modifiez les critères ou effacez les filtres pour élargir la vue.</p>{hasFilters && <Button variant="outline" onClick={clearFilters}>Effacer les filtres</Button>}</CardContent></Card>
        : <Card className="overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Lead</TableHead><TableHead>Contact</TableHead><TableHead>Intention</TableHead><TableHead>Projet / lot</TableHead><TableHead>Source</TableHead><TableHead>Statut</TableHead><TableHead>Créé</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{leads.map((lead) => <TableRow key={lead.id} className={loading ? 'opacity-70' : undefined}>
          <TableCell><div className="min-w-[150px]"><div className="font-medium">{lead.name}</div>{lead.assignedTo && <div className="text-xs text-muted-foreground">Assigné à {lead.assignedTo}</div>}</div></TableCell>
          <TableCell><div className="min-w-[150px]"><a className="block text-sm hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a>{lead.email && <a className="block max-w-[220px] truncate text-xs text-muted-foreground hover:underline" href={`mailto:${lead.email}`} title={lead.email}>{lead.email}</a>}</div></TableCell>
          <TableCell><Badge variant="secondary">{labelOf(INTENT_OPTIONS, lead.intent)}</Badge></TableCell>
          <TableCell><div className="min-w-[140px]">{lead.projectName ?? lead.apartmentName ?? '—'}{lead.projectName && lead.apartmentName && <div className="text-xs text-muted-foreground">{lead.apartmentName}</div>}</div></TableCell>
          <TableCell className="text-sm">{lead.source ?? '—'}</TableCell>
          <TableCell><select aria-label={`Statut de ${lead.name}`} value={lead.status} onChange={(event) => { if (event.target.value !== lead.status) setStatusRequest({ lead, nextStatus: event.target.value }); }} disabled={mutationBusy} className="h-9 rounded-md border border-input bg-background px-2 text-sm">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></TableCell>
          <TableCell className="whitespace-nowrap text-sm">{formatDate(lead.createdAt)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>Détails</Button><Button variant="ghost" size="sm" className="gap-1" onClick={() => openNotes(lead)} aria-label={`Notes de ${lead.name}`}><FileText className="h-4 w-4" /><span className="sr-only">Notes</span></Button></div></TableCell>
        </TableRow>)}</TableBody></Table></div><div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted-foreground">Page {meta.page} sur {meta.totalPages}</span><nav aria-label="Pagination des leads" className="flex items-center gap-1"><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1} aria-label="Page précédente" className="gap-1"><ChevronLeft className="h-4 w-4" /> Précédente</Button><Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} disabled={loading || page >= meta.totalPages} aria-label="Page suivante" className="gap-1">Suivante <ChevronRight className="h-4 w-4" /></Button></nav></div></Card>}
      </div>

      <Dialog open={selectedLead !== null} onOpenChange={(open) => { if (!open) setSelectedLead(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Détails du lead{selectedLead ? ` — ${selectedLead.name}` : ''}</DialogTitle><DialogDescription>Contexte commercial et coordonnées disponibles pour traiter le prospect.</DialogDescription></DialogHeader>{selectedLead && <div className="grid gap-4 text-sm"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{labelOf(STATUS_OPTIONS, selectedLead.status)}</Badge><Badge variant="outline">{labelOf(INTENT_OPTIONS, selectedLead.intent)}</Badge></div><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs font-medium text-muted-foreground">Téléphone</p><a className="inline-flex min-h-11 items-center gap-2 hover:underline" href={`tel:${selectedLead.phone}`}><Phone className="h-4 w-4" />{selectedLead.phone}</a></div><div><p className="text-xs font-medium text-muted-foreground">Email</p>{selectedLead.email ? <a className="inline-flex min-h-11 items-center gap-2 break-all hover:underline" href={`mailto:${selectedLead.email}`}><Mail className="h-4 w-4" />{selectedLead.email}</a> : <p className="mt-2">—</p>}</div><div><p className="text-xs font-medium text-muted-foreground">Projet</p><p className="mt-1">{selectedLead.projectName ?? '—'}</p></div><div><p className="text-xs font-medium text-muted-foreground">Lot / appartement</p><p className="mt-1">{selectedLead.apartmentName ?? '—'}</p></div><div><p className="text-xs font-medium text-muted-foreground">Source</p><p className="mt-1">{selectedLead.source ?? '—'}</p></div><div><p className="text-xs font-medium text-muted-foreground">Assigné à</p><p className="mt-1">{selectedLead.assignedTo ?? 'Non assigné'}</p></div><div><p className="text-xs font-medium text-muted-foreground">Prochain suivi</p><p className="mt-1">{formatDate(selectedLead.followUpDate)}</p></div><div><p className="text-xs font-medium text-muted-foreground">Créé le</p><p className="mt-1">{formatDateTime(selectedLead.createdAt)}</p></div></div><div className="rounded-md border bg-muted/20 p-3"><p className="mb-1 text-xs font-medium text-muted-foreground">Message</p><p className="whitespace-pre-wrap leading-6">{selectedLead.message?.trim() || 'Aucun message fourni.'}</p></div></div>}<DialogFooter>{selectedLead && <Button variant="outline" onClick={() => openStatusForLead(selectedLead)}>Changer le statut</Button>}<Button variant="outline" onClick={() => setSelectedLead(null)}>Fermer</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={notesLead !== null} onOpenChange={(open) => { if (!open && !noteSaving) setNotesLead(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Notes — {notesLead?.name ?? ''}</DialogTitle><DialogDescription>Notes internes de suivi commercial. Elles ne sont jamais publiées sur le site.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><label htmlFor="lead-note" className="text-sm font-medium">Ajouter une note</label><Textarea id="lead-note" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Compte rendu d’appel, prochaine action, objection, rendez-vous…" rows={4} disabled={noteSaving} /><div className="flex justify-end"><Button onClick={addNote} disabled={noteSaving || !noteDraft.trim()} className="gap-2">{noteSaving && <Loader2 className="h-4 w-4 animate-spin" />} Ajouter la note</Button></div></div>{notesError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{notesError}</div>}<div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Historique</h3>{notesLoading && <Loader2 className="h-4 w-4 animate-spin" aria-label="Chargement" />}</div>{!notesLoading && notes.length === 0 ? <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune note pour le moment.</p> : <div className="space-y-3">{notes.map((note) => <article key={note.id} className="rounded-lg border bg-muted/20 p-3"><div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{note.authorEmail ?? 'Inconnu'}</span><time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time></div><p className="whitespace-pre-wrap text-sm leading-6">{note.body}</p></article>)}</div>}</div></div><DialogFooter><Button variant="outline" onClick={() => setNotesLead(null)} disabled={noteSaving}>Fermer</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={statusRequest !== null} onOpenChange={(open) => { if (!open && !mutationBusy) setStatusRequest(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Mettre à jour le statut</DialogTitle><DialogDescription>{statusRequest ? `Choisissez le nouveau statut de « ${statusRequest.lead.name} ».` : 'Choisissez un nouveau statut.'}</DialogDescription></DialogHeader>{statusRequest && <label className="space-y-2 text-sm font-medium"><span>Nouveau statut</span><select autoFocus value={statusRequest.nextStatus} onChange={(event) => setStatusRequest((current) => current ? { ...current, nextStatus: event.target.value } : current)} disabled={mutationBusy} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}<DialogFooter><Button variant="outline" onClick={() => setStatusRequest(null)} disabled={mutationBusy}>Annuler</Button><Button onClick={updateStatus} disabled={mutationBusy || !statusRequest || statusRequest.nextStatus === statusRequest.lead.status} className="gap-2">{mutationBusy && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}

export default AdminLeadsPremiumWorkspace;
