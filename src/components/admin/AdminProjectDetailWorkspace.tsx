'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { navigateAdminRoute } from '@/lib/admin-route';
import { canStartMutation, createMutationRequestId, mutationAfterFailure, mutationSuccess, type AdminMutationSnapshot } from '@/lib/admin-mutation';

interface ProjectDetail {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  tagline?: string | null;
  taglineAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  city?: string | null;
  cityAr?: string | null;
  district?: string | null;
  districtAr?: string | null;
  address?: string | null;
  addressAr?: string | null;
  projectType: string;
  status: string;
  published: boolean;
  featured: boolean;
  startingPrice?: number | null;
  priceOnRequest: boolean;
  minSurface?: number | null;
  maxSurface?: number | null;
  deliveryYear?: number | null;
  deliveryQuarter?: string | null;
  hasParking?: boolean | null;
  hasElevator?: boolean | null;
  hasGarden?: boolean | null;
  hasPool?: boolean | null;
  hasSecurity?: boolean | null;
  hasClim?: boolean | null;
  buildings?: Array<{ id: string; name: string; code: string; _count?: { apartments: number } }>;
  apartments?: Array<{ id: string; slug: string; typeName: string; apartmentType: string; surface: number; status: string; published: boolean; building?: { id: string; name: string; code: string } | null }>;
  imagesRelation?: Array<{ id: string; url: string; type: string; order: number; alt?: string | null }>;
  amenities?: Array<{ id: string; name: string }>;
  developer?: { id: string; name: string; slug: string } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  robotsIndex?: boolean | null;
  archived?: boolean;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  if (!response.ok) {
    let message = 'Opération impossible.';
    try { const json = await response.json(); if (typeof json?.error === 'string') message = json.error; } catch { /* fallback */ }
    if (response.status === 401) message = 'Session administrateur expirée.';
    if (response.status === 403) message = 'Privilèges insuffisants.';
    throw new Error(message);
  }
  return response.json();
}

export function AdminProjectDetailWorkspace({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [priceDraft, setPriceDraft] = useState('');
  const [mutation, setMutation] = useState<AdminMutationSnapshot>({ state: 'idle' });
  const mutationBusyRef = useRef(false);
  const mutationBusy = mutation.state === 'validating' || mutation.state === 'submitting';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    getJson<{ data?: ProjectDetail }>(`/api/admin/projects/${encodeURIComponent(projectId)}`, { signal: controller.signal })
      .then((json) => setProject(json.data ?? null))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setProject(null); setError(err instanceof Error ? err.message : 'Impossible de charger le projet.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [projectId, retryKey]);

  const inventory = useMemo(() => ({
    apartments: project?.apartments?.length ?? 0,
    published: project?.apartments?.filter((a) => a.published).length ?? 0,
    available: project?.apartments?.filter((a) => a.status === 'AVAILABLE').length ?? 0,
  }), [project]);

  async function mutate(patch: Record<string, unknown>) {
    if (!project || mutationBusyRef.current || !canStartMutation(mutation.state)) return;
    mutationBusyRef.current = true;
    const requestId = createMutationRequestId('project-detail');
    setMutation({ state: 'validating', requestId });
    try {
      setMutation({ state: 'submitting', requestId });
      const result = await getJson<{ data?: ProjectDetail }>(`/api/admin/projects/${encodeURIComponent(project.slug)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
      });
      setProject(result.data ?? project);
      setMutation(mutationSuccess(requestId));
      setPriceDraft('');
      window.dispatchEvent(new Event('asas-admin-data-changed'));
    } catch (err) {
      setMutation(mutationAfterFailure(err, requestId));
    } finally { mutationBusyRef.current = false; }
  }

  if (loading) return <section className="w-full"><Card><CardContent className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Chargement du projet…</CardContent></Card></section>;
  if (error || !project) return <section className="w-full"><Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-16 text-center"><p className="font-semibold">Impossible de charger le projet</p><p className="text-sm text-muted-foreground">{error ?? 'Projet introuvable.'}</p><div className="flex gap-2"><Button variant="outline" onClick={() => navigateAdminRoute({ workspace: 'projects', entity: undefined, entityId: undefined })}>Retour</Button><Button onClick={() => setRetryKey((v) => v + 1)}>Réessayer</Button></div></CardContent></Card></section>;

  return (
    <section className="admin-project-detail-workspace w-full" aria-labelledby="project-detail-title">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue · Projet</p><h1 id="project-detail-title" className="text-2xl font-bold text-charcoal sm:text-3xl">{project.name}</h1><p className="mt-1 text-sm text-muted-foreground">{project.district ?? '—'}{project.city ? ` · ${project.city}` : ''} · {project.slug}</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => navigateAdminRoute({ workspace: 'projects', entity: undefined, entityId: undefined })} className="gap-2"><ChevronLeft className="h-4 w-4" /> Retour aux projets</Button><Button variant="outline" onClick={() => setRetryKey((v) => v + 1)} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" /> Actualiser</Button></div>
        </header>

        {mutation.state === 'recoverable-error' && <div role="alert" className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"><span>{mutation.error ?? 'L’opération a échoué.'}</span><Button variant="outline" size="sm" onClick={() => setMutation({ state: 'idle' })}>Fermer</Button></div>}
        {mutation.state === 'success' && <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Modification enregistrée.</div>}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Bâtiments</p><p className="mt-1 text-2xl font-semibold">{project.buildings?.length ?? 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lots</p><p className="mt-1 text-2xl font-semibold">{inventory.apartments}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lots disponibles</p><p className="mt-1 text-2xl font-semibold">{inventory.available}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Publication</p><p className="mt-1"><Badge variant={project.published ? 'default' : 'secondary'}>{project.published ? 'Publié' : 'Brouillon'}</Badge></p></CardContent></Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Identité & localisation</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 text-sm"><div><span className="text-muted-foreground">Nom</span><p className="font-medium">{project.name}</p></div><div><span className="text-muted-foreground">Type</span><p className="font-medium">{project.projectType}</p></div><div><span className="text-muted-foreground">Ville</span><p className="font-medium">{project.city ?? '—'}</p></div><div><span className="text-muted-foreground">Quartier</span><p className="font-medium">{project.district ?? '—'}</p></div><div className="sm:col-span-2"><span className="text-muted-foreground">Adresse</span><p className="font-medium">{project.address ?? '—'}</p></div><div><span className="text-muted-foreground">Promoteur</span><p className="font-medium">{project.developer?.name ?? 'Non renseigné'}</p></div><div><span className="text-muted-foreground">Statut</span><p className="font-medium">{project.status}</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Commercial & publication</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex flex-wrap items-end gap-2"><div className="min-w-[220px] flex-1"><span className="text-muted-foreground">Prix de départ (DZD)</span><Input className="mt-1" type="number" min="0" step="1000" value={priceDraft || (project.startingPrice != null ? String(project.startingPrice) : '')} onChange={(e) => setPriceDraft(e.target.value)} /></div><Button size="sm" disabled={mutationBusy || !priceDraft} onClick={() => mutate({ startingPrice: Number(priceDraft), priceOnRequest: false })}>Enregistrer</Button></div><div className="flex flex-wrap gap-2"><Button disabled={mutationBusy || project.published} onClick={() => mutate({ published: true })}><Eye className="mr-2 h-4 w-4" /> Publier</Button><Button variant="outline" disabled={mutationBusy || !project.published} onClick={() => mutate({ published: false })}><EyeOff className="mr-2 h-4 w-4" /> Dépublier</Button></div><div className="flex flex-wrap gap-2"><Badge variant={project.priceOnRequest ? 'outline' : 'secondary'}>{project.priceOnRequest ? 'Prix sur demande' : 'Prix renseigné'}</Badge><Badge variant="outline">{project.archived ? 'Archivé' : 'Actif'}</Badge><Badge variant="outline">{project.featured ? 'Mis en avant' : 'Standard'}</Badge></div></CardContent></Card>
        </div>

        <Card><CardHeader><CardTitle className="text-base">Structure & inventaire</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{project.buildings?.map((building) => <button key={building.id} type="button" onClick={() => navigateAdminRoute({ workspace: 'apartments', filters: { buildingId: building.id, projectSlug: project.slug }, page: 1 })} className="rounded-md border p-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"><p className="font-medium">{building.name}</p><p className="text-xs text-muted-foreground">{building.code} · {building._count?.apartments ?? 0} lots</p></button>)}</div>{!project.buildings?.length && <p className="text-sm text-muted-foreground">Aucun bâtiment associé.</p>}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Lots du projet</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b text-left"><th className="px-3 py-2">Lot</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Surface</th><th className="px-3 py-2">Bâtiment</th><th className="px-3 py-2">Statut</th></tr></thead><tbody>{project.apartments?.map((apartment) => <tr key={apartment.id} className="border-b"><td className="px-3 py-2"><button type="button" className="font-medium underline-offset-2 hover:underline" onClick={() => navigateAdminRoute({ workspace: 'apartments', entity: 'apartment', entityId: apartment.id })}>{apartment.typeName}</button></td><td className="px-3 py-2">{apartment.apartmentType}</td><td className="px-3 py-2">{apartment.surface} m²</td><td className="px-3 py-2">{apartment.building?.name ?? '—'}</td><td className="px-3 py-2">{apartment.status}</td></tr>)}</tbody></table></div>{!project.apartments?.length && <p className="text-sm text-muted-foreground">Aucun lot associé.</p>}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Médias</CardTitle></CardHeader><CardContent>{project.imagesRelation?.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{project.imagesRelation.map((image) => <div key={image.id} className="overflow-hidden rounded-md border"><img src={image.url} alt={image.alt ?? project.name} className="aspect-square w-full object-cover" loading="lazy" /><p className="truncate px-2 py-1 text-xs text-muted-foreground">{image.type}</p></div>)}</div> : <p className="text-sm text-muted-foreground">Aucun média associé disponible.</p>}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">SEO & contenu</CardTitle></CardHeader><CardContent className="grid gap-4 lg:grid-cols-2 text-sm"><div><span className="text-muted-foreground">SEO title</span><p className="font-medium">{project.seoTitle ?? 'Non renseigné'}</p></div><div><span className="text-muted-foreground">Canonical</span><p className="font-medium break-all">{project.canonicalUrl ?? 'Non renseignée'}</p></div><div><span className="text-muted-foreground">Description FR</span><p className="whitespace-pre-wrap">{project.description ?? 'Non renseignée'}</p></div><div dir="rtl"><span className="text-muted-foreground">Description AR</span><p className="whitespace-pre-wrap">{project.descriptionAr ?? 'غير متوفرة'}</p></div></CardContent></Card>
      </div>
    </section>
  );
}

export default AdminProjectDetailWorkspace;
