'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Calendar, Car, Check, Home, MapPin, Maximize2, MessageCircle, Phone, Share2, Shield, TreePine, Waves } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useProject } from '@/lib/api';
import { formatPrice, getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApartmentCard, ApartmentCardSkeleton } from '@/components/shared/ApartmentCard';
import { LeadForm } from '@/components/shared/LeadForm';
import { ProjectGallery } from '@/components/shared/ProjectGallery';
import { ProjectMap } from '@/components/shared/ProjectMap';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { projectSchema } from '@/lib/seo';
import type { ProjectImage } from '@/lib/types';

interface ProjectDetailPageProps { projectSlug: string; }
type Amenity = { label: string; icon: typeof Car };

function safeParseArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  } catch { return []; }
}

function ProjectDetailSkeleton() {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="h-[520px] animate-pulse bg-charcoal/10" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map((item) => <ApartmentCardSkeleton key={item} />)}</div></div>
    </main>
  );
}

export default function ProjectDetailPageV5({ projectSlug }: ProjectDetailPageProps) {
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectSlug);
  const [typeFilter, setTypeFilter] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [videoItems, setVideoItems] = useState<Array<{ id: string; title?: string; url: string }>>([]);

  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;
    fetch(`/api/videos?projectId=${project.id}`)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.data)) setVideoItems(payload.data);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [project?.id]);

  const apartmentTypes = useMemo(() => {
    if (!project) return [];
    const fromProject = safeParseArray(project.apartmentTypes);
    return fromProject.length ? fromProject : [...new Set((project.apartments ?? []).map((apartment) => apartment.apartmentType).filter(Boolean))];
  }, [project]);

  if (isLoading) return <ProjectDetailSkeleton />;
  if (error || !project) {
    return <main className="flex min-h-screen items-center justify-center bg-ivory px-4"><div className="max-w-md text-center"><h1 className="text-2xl font-semibold text-foreground">Projet introuvable</h1><p className="mt-3 text-muted-foreground">Le projet demandé n'est pas disponible.</p><Button className="mt-6" onClick={() => router.goProjects()}><ArrowLeft className="size-4" />Retour aux projets</Button></div></main>;
  }

  const apartments = project.apartments ?? [];
  const available = apartments.filter((apartment) => apartment.status === 'AVAILABLE' || apartment.status === 'COMING_SOON');
  const filtered = typeFilter ? available.filter((apartment) => apartment.apartmentType === typeFilter) : available;
  const heroImage = project.images?.find((image) => image.type === 'hero' && image.url)?.url ?? project.images?.find((image) => image.type === 'gallery' && image.url)?.url ?? '';
  const galleryImages: ProjectImage[] = (project.images ?? []).filter((image) => ['gallery', 'exterior', 'interior', 'amenity', 'architecture'].includes(image.type) && Boolean(image.url)).sort((a, b) => a.order - b.order);
  const amenities: Amenity[] = [
    project.hasParking ? { label: 'Parking', icon: Car } : null,
    project.hasElevator ? { label: 'Ascenseur', icon: Building2 } : null,
    project.hasGarden ? { label: 'Espaces verts', icon: TreePine } : null,
    project.hasPool ? { label: 'Piscine', icon: Waves } : null,
    project.hasSecurity ? { label: 'Sécurité', icon: Shield } : null,
  ].filter((item): item is Amenity => Boolean(item));
  const mapReady = typeof project.latitude === 'number' && typeof project.longitude === 'number';
  const whatsappMessage = `Bonjour, je suis intéressé(e) par le projet ${project.name} à ${project.district}. Je souhaite connaître les disponibilités.`;

  const scrollToInventory = () => document.getElementById('project-inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: project.name, text: `Découvrez ${project.name}`, url }); } catch { /* cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <main className="min-h-screen bg-ivory pb-16 sm:pb-0">
      <JsonLd data={projectSchema({ name: project.name, description: project.description ?? undefined, district: project.district, city: project.city, address: project.address ?? undefined, latitude: project.latitude ?? undefined, longitude: project.longitude ?? undefined, startingPrice: project.startingPrice ?? undefined, priceOnRequest: project.priceOnRequest, deliveryYear: project.deliveryYear ?? undefined, deliveryQuarter: project.deliveryQuarter ?? undefined, apartmentTypes: project.apartmentTypes, heroImage: heroImage || undefined, amenities: project.amenities?.map((item) => item.name), ...(project.slug ? { slug: project.slug } : {}) })} />

      <section className="relative min-h-[620px] overflow-hidden bg-charcoal text-white sm:min-h-[680px]">
        <div className="absolute inset-0">
          {heroImage ? <img src={heroImage} alt={project.name} className="h-full w-full object-cover" fetchPriority="high" /> : <div className="h-full w-full bg-charcoal" aria-hidden="true" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        </div>
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-between px-4 pb-8 pt-28 sm:min-h-[680px] sm:px-6 sm:pb-12 lg:px-8">
          <div>
            <Breadcrumbs items={[{ label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' }, { label: project.name, hashUrl: `/projects/${project.slug}` }]} />
            <button type="button" onClick={() => router.goProjects()} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"><ArrowLeft className="size-4" />Retour aux projets</button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4"><StatusBadge status={project.status} type="project" /></div>
              <p className="text-sm font-medium text-white/75">{project.projectType === 'RESIDENTIAL' ? 'Résidentiel' : project.projectType === 'MIXED_USE' ? 'Mixte' : project.projectType}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">{project.name}</h1>
              {project.tagline && <p className="mt-4 max-w-2xl text-lg leading-7 text-white/78 sm:text-xl">{project.tagline}</p>}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/78"><span className="inline-flex items-center gap-2"><MapPin className="size-4" />{project.district}, {project.city}</span>{project.deliveryYear && <span className="inline-flex items-center gap-2"><Calendar className="size-4" />Livraison {project.deliveryQuarter ? `Q${project.deliveryQuarter} ` : ''}{project.deliveryYear}</span>}</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-charcoal/80 p-5 shadow-2xl backdrop-blur-md sm:p-6">
              {project.startingPrice && !project.priceOnRequest ? <><p className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">À partir de</p><p className="mt-1 text-3xl font-semibold tracking-tight text-gold sm:text-4xl">{formatPrice(project.startingPrice)}</p></> : <p className="text-2xl font-semibold">Prix sur demande</p>}
              <p className="mt-2 text-sm text-white/60">{available.length > 0 ? `${available.length} logement${available.length > 1 ? 's' : ''} à découvrir` : 'Consultez les possibilités auprès d’ASAS'}</p>
              <Button onClick={scrollToInventory} size="lg" className="mt-5 min-h-12 w-full bg-white text-charcoal hover:bg-white/90">Voir les disponibilités <ArrowRight className="size-4" /></Button>
              <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"><MessageCircle className="size-4" />WhatsApp</a>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60"><button type="button" onClick={share} className="inline-flex min-h-10 items-center gap-2 hover:text-white"><Share2 className="size-4" />Partager</button><a href={getPhoneUrl()} className="inline-flex min-h-10 items-center gap-2 hover:text-white"><Phone className="size-4" />Appeler</a></div>
            </div>
          </div>
        </div>
      </section>

      {shareCopied && <div role="status" className="fixed right-4 top-24 z-50 rounded-lg bg-charcoal px-4 py-3 text-sm font-medium text-white shadow-xl">Lien copié</div>}

      <section className="border-b border-border bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {[
          { icon: MapPin, label: 'Emplacement', value: project.district },
          { icon: Home, label: 'Type', value: project.projectType === 'RESIDENTIAL' ? 'Résidentiel' : project.projectType === 'MIXED_USE' ? 'Mixte' : project.projectType },
          { icon: Building2, label: 'Logements', value: String(apartments.length) },
          { icon: Maximize2, label: 'Surfaces', value: project.minSurface && project.maxSurface ? `${project.minSurface}–${project.maxSurface} m²` : project.minSurface ? `${project.minSurface} m²+` : '—' },
          { icon: Car, label: 'Parking', value: project.hasParking ? 'Prévu' : '—' },
          { icon: Calendar, label: 'Livraison', value: project.deliveryYear ? `${project.deliveryQuarter ? `Q${project.deliveryQuarter} ` : ''}${project.deliveryYear}` : '—' },
        ].map((fact) => <div key={fact.label} className="flex min-h-[112px] flex-col justify-center gap-2 px-4 py-5 sm:px-5"><fact.icon className="size-5 text-forest" aria-hidden="true" /><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{fact.label}</span><span className="text-sm font-semibold text-foreground">{fact.value}</span></div>)}
      </div></section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto max-w-7xl"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Le projet</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Découvrez les espaces</h2></div>{galleryImages.length > 0 && <span className="text-sm text-muted-foreground">{galleryImages.length} visuel{galleryImages.length > 1 ? 's' : ''}</span>}</div><ProjectGallery images={galleryImages} projectName={project.name} fallbackImage={heroImage || undefined} /></div></section>

      {(project.description || amenities.length > 0) && <section className="bg-ivory px-4 py-12 sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">L'essentiel</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Un projet pensé pour le quotidien</h2>{project.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-7 text-muted-foreground">{project.description}</p>}</div>{amenities.length > 0 && <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-2">{amenities.map(({ label, icon: Icon }) => <div key={label} className="bg-white p-5"><Icon className="size-5 text-forest" /><p className="mt-3 text-sm font-semibold text-foreground">{label}</p></div>)}</div>}</div></section>}

      <section id="project-inventory" className="scroll-mt-20 bg-white px-4 py-12 sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Disponibilités</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Trouvez votre logement</h2><p className="mt-3 max-w-2xl text-muted-foreground">Consultez uniquement les logements actuellement proposés.</p></div>{apartmentTypes.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Filtrer par type"><button type="button" onClick={() => setTypeFilter('')} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${!typeFilter ? 'bg-charcoal text-white' : 'bg-ivory text-foreground ring-1 ring-border'}`}>Tous</button>{apartmentTypes.map((type) => <button type="button" key={type} onClick={() => setTypeFilter(type)} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${typeFilter === type ? 'bg-charcoal text-white' : 'bg-ivory text-foreground ring-1 ring-border'}`}>{type}</button>)}</div>}</div>{filtered.length > 0 ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((apartment) => <ApartmentCard key={apartment.id} apartment={apartment} projectSlug={projectSlug} />)}</div> : <div className="py-16 text-center"><Building2 className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 font-semibold text-foreground">Aucun logement dans cette sélection.</p><button type="button" onClick={() => setTypeFilter('')} className="mt-4 text-sm font-semibold text-forest">Voir tous les logements</button></div>}</div></section>

      <section className="bg-ivory px-4 py-12 sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">{mapReady && <div><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Localisation</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">L'emplacement du projet</h2><p className="mt-3 text-muted-foreground">{project.address || `${project.district}, ${project.city}`}</p></div><ProjectMap projects={[{ slug: project.slug, name: project.name, status: project.status, district: project.district, city: project.city, latitude: project.latitude!, longitude: project.longitude! }]} singleProject /></div>}<div className={`rounded-2xl bg-charcoal p-7 text-white sm:p-9 ${!mapReady ? 'lg:col-span-2' : ''}`}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Votre prochain choix</p><h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight">Voir les logements qui correspondent à votre projet.</h2><p className="mt-4 max-w-xl leading-7 text-white/65">Prix, surface, étage et disponibilité sont présentés sur chaque fiche.</p><Button onClick={scrollToInventory} size="lg" className="mt-7 bg-white text-charcoal hover:bg-white/90">Voir les disponibilités <ArrowRight className="size-4" /></Button></div></div></section>

      {videoItems.length > 0 && <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto max-w-7xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">En vidéo</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Voir le projet</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{videoItems.map((video) => <div key={video.id} className="overflow-hidden rounded-2xl border border-border bg-charcoal"><video controls preload="metadata" className="aspect-video w-full" src={video.url} />{video.title && <p className="p-4 text-sm font-semibold text-white">{video.title}</p>}</div>)}</div></div></section>}

      {project.developer && <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto max-w-7xl rounded-2xl border border-border bg-ivory p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Promoteur</p><div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold text-foreground">{project.developer.name}</h2>{project.developer.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{project.developer.description}</p>}</div>{project.developer.website && <a href={project.developer.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-semibold">Voir le site <ArrowRight className="ml-2 size-4" /></a>}</div></div></section>}

      <section id="project-contact" className="scroll-mt-20 bg-charcoal px-4 py-12 text-white sm:px-6 lg:px-8 sm:py-16"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><div className="lg:sticky lg:top-24"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Parlons de votre projet</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Une question sur ce projet ?</h2><p className="mt-4 max-w-xl leading-7 text-white/65">Recevez les informations utiles sur les logements, les prix et les disponibilités.</p><div className="mt-7 grid gap-3 text-sm text-white/75">{['Disponibilités actuelles', 'Prix et caractéristiques', 'Organisation d’une visite'].map((item) => <div key={item} className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10"><Check className="size-4 text-gold" /></span>{item}</div>)}</div><div className="mt-8 flex flex-wrap gap-3"><a href={getWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-charcoal"><MessageCircle className="size-4" />WhatsApp</a><a href={getPhoneUrl()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-4 text-sm font-semibold text-white"><Phone className="size-4" />Appeler</a></div></div><div className="rounded-2xl bg-white p-5 text-foreground shadow-2xl sm:p-7"><LeadForm projectId={project.id} projectName={project.name} intent="REQUEST_INFORMATION" showWhatsApp showPhone /></div></div></section>

      <section className="border-t border-border bg-ivory px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-foreground">Vous souhaitez comparer plusieurs projets ?</p><p className="mt-1 text-sm text-muted-foreground">Retournez au catalogue pour continuer votre recherche.</p></div><Button variant="outline" onClick={() => router.goProjects()}>Retour aux projets <ArrowRight className="size-4" /></Button></div></section>
    </main>
  );
}
