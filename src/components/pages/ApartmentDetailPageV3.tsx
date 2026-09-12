'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/lib/router';
import { useApartment } from '@/lib/api';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { trackEvent } from '@/lib/analytics';
import { formatPrice, formatSurface, getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FloorPlanViewer } from '@/components/shared/FloorPlanViewer';
import { LeadForm } from '@/components/shared/LeadForm';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { CompareButton } from '@/components/shared/CompareButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { PropertyRecommender } from '@/components/shared/PropertyRecommender';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import type { ApartmentImage } from '@/lib/types';
import { ArrowLeft, ArrowRight, Bath, Bed, Building2, Car, Check, ChevronLeft, ChevronRight, Compass, DoorOpen, Layers3, MapPin, MessageCircle, Phone, ShieldCheck, TreePine } from 'lucide-react';

interface Props { projectSlug: string; apartmentSlug: string; }

type Fact = { label: string; value: string; icon: typeof Bed };

function parseStringArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  } catch { return []; }
}

function parseRooms(value?: string | null): Array<{ name: string; surface: number }> {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.name === 'string' && typeof item.surface === 'number')
      : [];
  } catch { return []; }
}

function Skeleton() {
  return <main className="min-h-screen bg-[#f8f7f2]"><div className="min-h-[650px] animate-pulse bg-[#17232a]" /><div className="mx-auto max-w-[1440px] px-5 py-10"><div className="h-28 rounded-2xl bg-white" /></div></main>;
}

export default function ApartmentDetailPageV3({ projectSlug, apartmentSlug }: Props) {
  const router = useRouter();
  const { data: apartment, isLoading, error } = useApartment(apartmentSlug);
  const addRecentlyViewed = useRecentlyViewed((state) => state.addRecentlyViewed);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!apartment?.id) return;
    addRecentlyViewed(apartment.id);
    trackEvent('recently_viewed_add', { apartment_id: apartment.id, apartment_type: apartment.typeName });
  }, [apartment?.id, apartment?.typeName, addRecentlyViewed]);

  if (isLoading) return <Skeleton />;
  if (error || !apartment) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-5"><div className="text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c806f]">ASAS Immobilier</p><h1 className="mt-3 text-3xl font-semibold text-[#17232a]">Appartement introuvable</h1><p className="mt-3 text-sm text-[#777a72]">Ce logement n'est plus disponible ou l'adresse demandée est incorrecte.</p><Button className="mt-6 bg-[#17232a] text-white" onClick={() => router.goProject(projectSlug)}><ArrowLeft className="size-4" />Retour au projet</Button></div></main>;
  }

  const project = apartment.project;
  const images = useMemo(() => (apartment.images ?? []).filter((img: ApartmentImage) => ['hero', 'gallery', 'interior', 'exterior', 'view'].includes(img.type) && Boolean(img.url)).sort((a, b) => a.order - b.order), [apartment.images]);
  const plans = useMemo(() => (apartment.images ?? []).filter((img: ApartmentImage) => img.type === 'floor-plan' && Boolean(img.url)).sort((a, b) => a.order - b.order), [apartment.images]);
  const plans3D = useMemo(() => (apartment.images ?? []).filter((img: ApartmentImage) => img.type === '3d-plan' && Boolean(img.url)).sort((a, b) => a.order - b.order), [apartment.images]);
  const features = parseStringArray(apartment.features);
  const rooms = parseRooms(apartment.rooms);
  const displayPrice = apartment.priceOnRequest || !apartment.price ? 'Prix sur demande' : formatPrice(apartment.price);
  const pricePerSqm = !apartment.priceOnRequest && apartment.price && apartment.surface ? formatPrice(Math.round(apartment.price / apartment.surface)) : null;
  const primaryImage = images[activeImage];
  const isAvailable = apartment.status === 'AVAILABLE';
  const isComingSoon = apartment.status === 'COMING_SOON';
  const whatsappMessage = isAvailable
    ? `Bonjour, je suis intéressé(e) par l'appartement ${apartment.typeName} (${formatSurface(apartment.surface)}) dans le projet ${project?.name ?? ''}. Je souhaite demander une visite.`
    : `Bonjour, je souhaite connaître le calendrier et les conditions de commercialisation de l'appartement ${apartment.typeName} (${formatSurface(apartment.surface)}) dans le projet ${project?.name ?? ''}.`;

  const facts: Fact[] = [
    { icon: Bed, label: 'Chambres', value: String(apartment.bedrooms) },
    { icon: Bath, label: 'Salle de bain', value: apartment.bathrooms != null ? String(apartment.bathrooms) : '—' },
    { icon: Layers3, label: 'Étage', value: apartment.floor != null ? `${apartment.floor}${apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}` : '—' },
    { icon: Compass, label: 'Orientation', value: apartment.orientation || '—' },
    { icon: Car, label: 'Parking', value: apartment.hasParking ? `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` : 'Non inclus' },
    { icon: DoorOpen, label: 'Balcon', value: apartment.balconies ? `${apartment.balconies}` : '—' },
  ];

  return <main className="min-h-screen bg-[#f8f7f2] pb-14">
    <section className="relative overflow-hidden bg-[#17232a] text-white">
      <div className="mx-auto max-w-[1440px] px-5 pt-5 sm:px-8 lg:px-10">
        <Breadcrumbs items={[{ label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' }, ...(project ? [{ label: project.name, onClick: () => router.goProject(projectSlug), hashUrl: `/projects/${projectSlug}` }] : []), { label: apartment.typeName, hashUrl: `/projects/${projectSlug}/apartments/${apartmentSlug}` }]} />
        <div className="grid gap-8 py-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-10">
          <div className="order-2 lg:order-1">
            <button type="button" onClick={() => router.goProject(projectSlug)} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-white/60 hover:text-white"><ArrowLeft className="size-4" />Retour au projet</button>
            <div className="mt-5 flex flex-wrap gap-2"><StatusBadge status={apartment.status} type="apartment" />{project && <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/75">{project.name}</span>}</div>
            <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">{apartment.typeName}</h1>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70"><span className="font-semibold text-white">{formatSurface(apartment.surface)}</span><span>{apartment.bedrooms} chambre{apartment.bedrooms > 1 ? 's' : ''}</span>{apartment.floor != null && <span>Étage {apartment.floor}{apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}</span>}{project && <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{project.district}, {project.city}</span>}</div>
            <div className="mt-8"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Prix</p><p className="mt-1 text-3xl font-semibold text-[#d9b16e] sm:text-4xl">{displayPrice}</p>{pricePerSqm && <p className="mt-1 text-xs text-white/45">{pricePerSqm} / m²</p>}</div>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row"><a href={isAvailable ? getWhatsAppUrl(whatsappMessage) : getWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('apartment_cta_click', { apartment_id: apartment.id, cta: 'whatsapp_hero' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#d9b16e] px-6 text-sm font-semibold text-[#17232a] hover:bg-[#e4bd7c]"><MessageCircle className="size-4" />{isAvailable ? 'Demander une visite' : isComingSoon ? 'Demander les conditions' : 'Contacter ASAS'}</a><a href={getPhoneUrl()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10"><Phone className="size-4" />Appeler</a></div>
            <div className="mt-4 flex flex-wrap gap-2"><FavoriteButton apartmentId={apartment.id} variant="full" /><CompareButton apartmentId={apartment.id} variant="full" /><ShareButton url={typeof window !== 'undefined' ? window.location.href : undefined} title={`${apartment.typeName} — ${project?.name ?? 'ASAS'}`} variant="full" /></div>
          </div>
          <div className="order-1 lg:order-2">
            {primaryImage ? <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-2xl"><img src={primaryImage.url} alt={primaryImage.alt || `${apartment.typeName} — visuel ${activeImage + 1}`} className="h-full w-full object-cover" fetchPriority="high" />{images.length > 1 && <><button type="button" onClick={() => setActiveImage((index) => index === 0 ? images.length - 1 : index - 1)} aria-label="Visuel précédent" className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"><ChevronLeft className="size-5" /></button><button type="button" onClick={() => setActiveImage((index) => index === images.length - 1 ? 0 : index + 1)} aria-label="Visuel suivant" className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"><ChevronRight className="size-5" /></button></>}<div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-5 pb-4 pt-16 text-xs text-white/80"><span>Visuel du logement</span><span>{activeImage + 1} / {images.length}</span></div></div> : <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center"><div><Building2 className="mx-auto size-9 text-white/25" /><p className="mt-3 font-semibold">Visuels du logement à venir</p><p className="mt-1 text-xs text-white/50">Contactez ASAS pour obtenir les informations disponibles.</p></div></div>}
            {images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{images.slice(0, 8).map((image, index) => <button type="button" key={image.id} onClick={() => setActiveImage(index)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${index === activeImage ? 'border-[#d9b16e]' : 'border-white/10'}`} aria-label={`Voir le visuel ${index + 1}`}><img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" /></button>)}</div>}
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-[#e5e1d7] bg-white px-5 py-4 sm:px-8 lg:px-10"><div className="mx-auto grid max-w-[1440px] grid-cols-2 overflow-hidden rounded-xl border border-[#e5e1d7] sm:grid-cols-3 lg:grid-cols-6">{facts.map(({ icon: Icon, label, value }) => <div key={label} className="min-h-[105px] border-b border-r border-[#e5e1d7] px-4 py-5 last:border-r-0 lg:border-b-0"><Icon className="size-5 text-[#183c31]" /><p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#85877f]">{label}</p><p className="mt-1 text-sm font-semibold text-[#17232a]">{value}</p></div>)}</div></section>

    <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c806f]">Le logement</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17232a]">Les informations essentielles, sans surcharge.</h2>{apartment.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-7 text-[#646860]">{apartment.description}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-2">{[
      apartment.hasParking ? { icon: Car, title: 'Parking', value: `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` } : null,
      apartment.orientation ? { icon: Compass, title: 'Orientation', value: apartment.orientation } : null,
      apartment.hasTerrace ? { icon: DoorOpen, title: 'Terrasse', value: apartment.terraceSurface ? `${apartment.terraceSurface} m²` : 'Oui' } : null,
      apartment.hasGarden ? { icon: TreePine, title: 'Jardin', value: apartment.gardenSurface ? `${apartment.gardenSurface} m²` : 'Oui' } : null,
      project?.hasElevator ? { icon: Building2, title: 'Ascenseur', value: 'Oui' } : null,
      project?.hasSecurity ? { icon: ShieldCheck, title: 'Résidence sécurisée', value: 'Oui' } : null,
    ].filter(Boolean).map((item) => { const value = item as { icon: typeof Car; title: string; value: string }; const Icon = value.icon; return <div key={value.title} className="flex items-center gap-4 rounded-xl border border-[#e5e1d7] bg-[#f8f7f2] p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white"><Icon className="size-5 text-[#183c31]" /></span><div><p className="text-sm font-semibold text-[#17232a]">{value.title}</p><p className="mt-1 text-xs text-[#777a72]">{value.value}</p></div></div>; })}</div></div><aside className="rounded-2xl bg-[#17232a] p-6 text-white sm:p-8"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9b16e]">À retenir</p><div className="mt-5 space-y-4">{[
      `${formatSurface(apartment.surface)} de surface`,
      `${apartment.bedrooms} chambre${apartment.bedrooms > 1 ? 's' : ''}`,
      apartment.floor != null ? `Étage ${apartment.floor}${apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}` : null,
      apartment.orientation ? `Orientation ${apartment.orientation}` : null,
      apartment.hasParking ? 'Parking inclus' : null,
    ].filter(Boolean).map((text) => <p key={text as string} className="flex gap-3 text-sm text-white/75"><Check className="mt-0.5 size-4 shrink-0 text-[#d9b16e]" />{text}</p>)}</div><div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs text-white/50">Prix</p><p className="mt-1 text-2xl font-semibold text-[#d9b16e]">{displayPrice}</p>{apartment.paymentPlan && <p className="mt-2 text-xs text-white/55">Modalités : {apartment.paymentPlan}</p>}<a href={getWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-[#17232a] hover:bg-[#f0eee8]"><MessageCircle className="size-4" />Échanger avec ASAS</a></div></aside></div></section>

    {(plans.length > 0 || plans3D.length > 0) && <section className="bg-[#f8f7f2] px-5 py-12 sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c806f]">Plans</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17232a]">Visualisez l'organisation du logement.</h2><p className="mt-3 text-sm leading-6 text-[#777a72]">Consultez le plan réel disponible et zoomez pour lire les détails.</p></div><div className="mt-7 grid gap-5 lg:grid-cols-2">{plans.slice(0, 2).map((plan) => <div key={plan.id} className="rounded-2xl border border-[#e5e1d7] bg-white p-3 sm:p-4"><FloorPlanViewer src={plan.url} alt={plan.alt || `Plan ${apartment.typeName}`} /></div>)}{plans3D.slice(0, 1).map((plan) => <div key={plan.id} className="rounded-2xl border border-[#e5e1d7] bg-white p-3 sm:p-4"><img src={plan.url} alt={plan.alt || `Plan 3D ${apartment.typeName}`} className="aspect-[4/3] w-full rounded-lg object-contain bg-[#f1efe9]" loading="lazy" /></div>)}</div></div></section>}

    {rooms.length > 0 && <section className="bg-white px-5 py-12 sm:px-8 lg:px-10"><div className="mx-auto max-w-[1440px]"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c806f]">Répartition</p><h2 className="mt-2 text-3xl font-semibold text-[#17232a]">Les espaces du logement</h2><div className="mt-6 divide-y divide-[#e5e1d7] border-y border-[#e5e1d7]">{rooms.map((room) => <div key={`${room.name}-${room.surface}`} className="flex items-center justify-between gap-5 py-4 text-sm"><span className="font-medium text-[#30383d]">{room.name}</span><span className="font-semibold text-[#17232a]">{room.surface} m²</span></div>)}</div></div></section>}

    {features.length > 0 && <section className="bg-[#f8f7f2] px-5 py-12 sm:px-8 lg:px-10"><div className="mx-auto max-w-[1440px]"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c806f]">Caractéristiques</p><h2 className="mt-2 text-3xl font-semibold text-[#17232a]">Ce qui compose ce logement</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature) => <div key={feature} className="flex items-start gap-3 rounded-xl border border-[#e5e1d7] bg-white p-4 text-sm text-[#555b56]"><Check className="mt-0.5 size-4 shrink-0 text-[#183c31]" />{feature}</div>)}</div></div></section>}

    {isAvailable && <section className="bg-[#17232a] px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9b16e]">Prochaine étape</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Demandez une visite.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/60">Recevez les informations utiles sur ce logement et échangez directement avec ASAS.</p><div className="mt-6 space-y-3 text-sm text-white/70"><p className="flex gap-3"><Check className="size-4 text-[#d9b16e]" />Disponibilité confirmée avec l'équipe</p><p className="flex gap-3"><Check className="size-4 text-[#d9b16e]" />Plan et documents disponibles selon le logement</p><p className="flex gap-3"><Check className="size-4 text-[#d9b16e]" />Organisation d'une visite</p></div></div><div className="rounded-2xl bg-white p-5 text-[#17232a] sm:p-7"><LeadForm projectId={project?.id} projectName={project?.name} apartmentId={apartment.id} apartmentName={`${apartment.typeName} (${formatSurface(apartment.surface)})`} intent="BOOK_VISIT" showWhatsApp showPhone compact /><p className="mt-3 text-center text-[11px] text-[#777a72]">Vos informations servent uniquement à traiter votre demande auprès d'ASAS.</p></div></div></div></section>}

    {(isComingSoon || apartment.status === 'RESERVED') && <section className="bg-[#17232a] px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9b16e]">{isComingSoon ? 'Prochainement' : 'Statut du logement'}</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{isComingSoon ? 'Préparez votre demande.' : 'Ce logement est actuellement réservé.'}</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/60">{isComingSoon ? 'Demandez le calendrier de commercialisation et les conditions disponibles auprès d’ASAS.' : 'Contactez ASAS pour connaître les alternatives actuellement disponibles.'}</p></div><div className="rounded-2xl bg-white p-5 text-[#17232a] sm:p-7"><LeadForm projectId={project?.id} projectName={project?.name} apartmentId={apartment.id} apartmentName={`${apartment.typeName} (${formatSurface(apartment.surface)})`} intent="REQUEST_INFORMATION" showWhatsApp showPhone compact /><p className="mt-3 text-center text-[11px] text-[#777a72]">Vos informations servent uniquement à traiter votre demande auprès d'ASAS.</p></div></div></div></section>}

    <section className="bg-[#f8f7f2] px-5 py-5 sm:px-8 lg:px-10"><div className="mx-auto max-w-[1440px]"><PropertyRecommender currentApartmentType={apartment.apartmentType} currentProjectId={project?.id ?? ''} excludeId={apartment.id} /></div></section>

    <section className="border-t border-[#e5e1d7] bg-white px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-[#17232a]">Vous préférez découvrir le projet ?</p><p className="mt-1 text-xs text-[#777a72]">Retournez à la présentation du projet et explorez les autres logements.</p></div><Button variant="outline" onClick={() => router.goProject(projectSlug)} className="min-h-11 w-full border-[#cfc7b8] bg-white text-[#17232a] sm:w-auto">Voir le projet <ArrowRight className="size-4" /></Button></div></section>
  </main>;
}
