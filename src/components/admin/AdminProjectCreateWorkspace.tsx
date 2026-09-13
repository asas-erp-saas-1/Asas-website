'use client';

import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { navigateAdminRoute } from '@/lib/admin-route';

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

interface CreateProjectResponse {
  data?: { id: string; slug: string };
  error?: string;
}

export default function AdminProjectCreateWorkspace() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [projectType, setProjectType] = useState('RESIDENTIAL');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const normalizedSlug = useMemo(() => slugify(name), [name]);
  const effectiveSlug = slugTouched ? slug : normalizedSlug;
  const priceValue = startingPrice.trim() === '' ? null : Number(startingPrice);
  const priceValid = priceOnRequest || (priceValue !== null && Number.isFinite(priceValue) && priceValue >= 0);
  const canSubmit = name.trim().length > 0 && effectiveSlug.length > 0 && city.trim().length > 0 && district.trim().length > 0 && priceValid && !submitting;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          name: name.trim(),
          slug: effectiveSlug,
          city: city.trim(),
          district: district.trim(),
          projectType: projectType.trim() || 'RESIDENTIAL',
          description: description.trim() || null,
          startingPrice: priceOnRequest ? null : priceValue,
          priceOnRequest,
          status: 'DRAFT',
          published: false,
          featured: false,
          order: 0,
          apartmentTypes: [],
          hasParking: false,
          hasElevator: false,
          hasGarden: false,
          hasPool: false,
          hasSecurity: false,
          hasClim: false,
          robotsIndex: true,
        }),
      });
      const json = (await response.json()) as CreateProjectResponse;
      if (!response.ok || !json.data?.id) throw new Error(json.error || 'Impossible de créer le projet.');
      window.dispatchEvent(new Event('asas-admin-data-changed'));
      navigateAdminRoute({ workspace: 'projects', entity: 'project', entityId: json.data.id }, 'replace');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de créer le projet.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-project-create-workspace w-full" aria-labelledby="project-create-title">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest">Catalogue</p>
            <h1 id="project-create-title" className="text-2xl font-bold text-charcoal sm:text-3xl">Nouveau projet</h1>
            <p className="mt-1 text-sm text-muted-foreground">Création minimale et sécurisée. Le projet démarre en brouillon et pourra ensuite être complété.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => navigateAdminRoute({ workspace: 'projects' })} className="gap-2 self-start sm:self-auto">
            <ArrowLeft className="h-4 w-4" /> Retour aux projets
          </Button>
        </header>

        {error && (
          <div role="alert" className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setError(null)}>Fermer</Button>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Identité du projet</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="project-name">Nom *</Label>
                <Input id="project-name" value={name} onChange={(event) => { setName(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} placeholder="Nom du projet" autoComplete="off" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-slug">Slug *</Label>
                <Input id="project-slug" value={effectiveSlug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }} placeholder="nom-du-projet" autoComplete="off" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-type">Type</Label>
                <Input id="project-type" value={projectType} onChange={(event) => setProjectType(event.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Localisation</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="project-city">Ville *</Label><Input id="project-city" value={city} onChange={(event) => setCity(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="project-district">Quartier *</Label><Input id="project-district" value={district} onChange={(event) => setDistrict(event.target.value)} required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="project-description">Description</Label><Textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={5} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Commercial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <input type="checkbox" checked={priceOnRequest} onChange={(event) => setPriceOnRequest(event.target.checked)} />
                <span>Prix sur demande</span>
              </label>
              {!priceOnRequest && <div className="max-w-sm space-y-2"><Label htmlFor="project-price">Prix de départ *</Label><Input id="project-price" type="number" min="0" step="any" value={startingPrice} onChange={(event) => setStartingPrice(event.target.value)} required={!priceOnRequest} /></div>}
              <p className="text-xs text-muted-foreground">Le serveur impose également l’invariant commercial avant création.</p>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => navigateAdminRoute({ workspace: 'projects' })} disabled={submitting}>Annuler</Button>
            <Button type="submit" disabled={!canSubmit} className="gap-2 bg-forest text-white hover:bg-forest/90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? 'Création…' : 'Créer le projet'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
