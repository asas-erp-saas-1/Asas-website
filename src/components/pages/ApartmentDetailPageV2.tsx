'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { useApartment } from '@/lib/api';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { trackEvent } from '@/lib/analytics';
import { formatPrice, formatSurface, getWhatsAppUrl, getPhoneUrl } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FloorPlanViewer } from '@/components/shared/FloorPlanViewer';
import { LeadForm } from '@/components/shared/LeadForm';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { CompareButton } from '@/components/shared/CompareButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { PropertyRecommender } from '@/components/shared/PropertyRecommender';
import { BrochureDownload } from '@/components/shared/BrochureDownload';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MortgageCalculator } from '@/components/shared/MortgageCalculator';
import { Button } from '@/components/ui/button';
import type { ApartmentImage } from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  Building2,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Compass,
  DoorOpen,
  FileText,
  Flower2,
  Layers3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  TreePine,
} from 'lucide-react';

interface Props {
  projectSlug: string;
  apartmentSlug: string;
}

export default function ApartmentDetailPageV2({ projectSlug, apartmentSlug }: Props) {
  const router = useRouter();
  const { data: apartment, isLoading, error } = useApartment(apartmentSlug);
  const addRecentlyViewed = useRecentlyViewed(s => s.addRecentlyViewed);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!apartment?.id) return;
    addRecentlyViewed(apartment.id);
    trackEvent('recently_viewed_add', { apartment_id: apartment.id, apartment_type: apartment.typeName });
  }, [apartment?.id, apartment?.typeName, addRecentlyViewed]);

  if (isLoading) return <ApartmentDetailSkeleton />;
  if (error || !apartment) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest mb-3">ASAS Immobilier</p>
          <h1 className="text-2xl font-bold text-charcoal mb-3">Appartement introuvable</h1>
          <p className="text-muted-foreground mb-6">Ce logement n&apos;est plus disponible ou l&apos;adresse demandée est incorrecte.</p>
          <Button onClick={() => router.goProject(projectSlug)}><ArrowLeft className="h-4 w-4" />Retour au projet</Button>
        </div>
      </main>
    );
  }

  const project = apartment.project;
  const images = (apartment.images ?? [])
    .filter((img: ApartmentImage) => ['hero', 'gallery', 'interior', 'exterior', 'view'].includes(img.type))
    .sort((a: ApartmentImage, b: ApartmentImage) => a.order - b.order);
  const floorPlans = (apartment.images ?? [])
    .filter((img: ApartmentImage) => img.type === 'floor-plan')
    .sort((a, b) => a.order - b.order);
  const plans3D = (apartment.images ?? [])
    .filter((img: ApartmentImage) => img.type === '3d-plan')
    .sort((a, b) => a.order - b.order);

  let rooms: Array<{ name: string; surface: number }> = [];
  try {
    const parsed = apartment.rooms ? JSON.parse(apartment.rooms) : [];
    if (Array.isArray(parsed)) {
      rooms = parsed.filter(item => item && typeof item.name === 'string' && typeof item.surface === 'number');
    }
  } catch {
    rooms = [];
  }

  let features: string[] = [];
  try {
    const parsed = apartment.features ? JSON.parse(apartment.features) : [];
    if (Array.isArray(parsed)) features = parsed.filter(item => typeof item === 'string');
  } catch {
    features = [];
  }

  const displayPrice = apartment.priceOnRequest || !apartment.price ? 'Prix sur demande' : formatPrice(apartment.price);
  const pricePerSqm = !apartment.priceOnRequest && apartment.price && apartment.surface
    ? `${formatPrice(Math.round(apartment.price / apartment.surface))} / m²`
    : null;
  const whatsAppMsg = `Bonjour, je suis intéressé(e) par l'appartement ${apartment.typeName} (${formatSurface(apartment.surface)}) dans le projet ${project?.name ?? ''}. Pouvez-vous me confirmer sa disponibilité et les modalités de visite ?`;
  const primaryImage = images[activeImage];

  const facts = [
    { icon: Bed, label: 'Chambres', value: String(apartment.bedrooms) },
    { icon: Bath, label: 'Salle de bain', value: apartment.bathrooms != null ? String(apartment.bathrooms) : '—' },
    { icon: Layers3, label: 'Étage', value: apartment.floor != null ? `${apartment.floor}${apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}` : '—' },
    { icon: Compass, label: 'Orientation', value: apartment.orientation || '—' },
    { icon: Car, label: 'Parking', value: apartment.hasParking ? `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` : 'Non inclus' },
    { icon: DoorOpen, label: 'Balcon', value: apartment.balconies ? String(apartment.balconies) : '—' },
  ];

  const benefits = [
    apartment.hasParking && { icon: Car, title: 'Parking', text: `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` },
    apartment.orientation && { icon: Compass, title: `Orientation ${apartment.orientation}`, text: null },
    apartment.hasTerrace && { icon: Flower2, title: 'Terrasse', text: apartment.terraceSurface ? `${apartment.terraceSurface} m²` : 'Oui' },
    apartment.hasGarden && { icon: TreePine, title: 'Jardin', text: apartment.gardenSurface ? `${apartment.gardenSurface} m²` : 'Oui' },
    project?.hasElevator && { icon: Building2, title: 'Ascenseur', text: 'Oui' },
    project?.hasSecurity && { icon: ShieldCheck, title: 'Résidence sécurisée', text: 'Oui' },
  ].filter(Boolean) as Array<{ icon: typeof Car; title: string; text: string | null }>;

  const showContactCta = apartment.status !== 'SOLD' && apartment.status !== 'OFF_MARKET';

  return (
    <main className="min-h-screen bg-ivory">
      {/* V5 — HERO: only identity, proof, price and the next action */}
      <section className="bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 pt-3 md:pt-5">
          <Breadcrumbs items={[
            { label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' },
            ...(project ? [{ label: project.name, onClick: () => router.goProject(projectSlug), hashUrl: `/projects/${projectSlug}` }] : []),
            { label: apartment.typeName, hashUrl: `/projects/${projectSlug}/apartments/${apartmentSlug}` },
          ]} />

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 lg:gap-8 py-4 md:py-6 items-stretch">
            <div className="order-2 lg:order-1 flex flex-col justify-center min-w-0">
              <button onClick={() => router.goProject(projectSlug)} className="inline-flex w-fit items-center gap-2 text-white/55 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />Retour au projet
              </button>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={apartment.status} type="apartment" />
                {project && <span className="text-xs font-medium text-white/60 border border-white/15 rounded-full px-3 py-1">{project.name}</span>}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-bold tracking-tight leading-[0.98] text-balance">{apartment.typeName}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-white/75">
                <span className="font-semibold text-white">{formatSurface(apartment.surface)}</span>
                {apartment.bedrooms != null && <span>{apartment.bedrooms} chambre{apartment.bedrooms > 1 ? 's' : ''}</span>}
                {apartment.floor != null && <span>Étage {apartment.floor}{apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}</span>}
                {project && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{project.district}, {project.city}</span>}
              </div>
              <div className="mt-7">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Prix</p>
                <p className="text-3xl sm:text-4xl font-bold text-gold tabular-nums mt-1">{displayPrice}</p>
                {pricePerSqm && <p className="text-xs text-white/45 mt-1">{pricePerSqm}</p>}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                {showContactCta ? (
                  <a href={getWhatsAppUrl(whatsAppMsg)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('apartment_cta_click', { apartment_id: apartment.id, cta: 'whatsapp_hero' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-bold text-charcoal hover:bg-gold/90 transition-colors">
                    <CalendarCheckIcon />Demander une visite
                  </a>
                ) : (
                  <button type="button" onClick={() => router.goProject(projectSlug)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-bold text-charcoal hover:bg-gold/90 transition-colors">
                    <ArrowRight className="h-4 w-4" />Voir les logements disponibles
                  </button>
                )}
                <a href={getPhoneUrl()} onClick={() => trackEvent('phone_click', { apartment_id: apartment.id, source: 'apartment_hero' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  <Phone className="h-4 w-4" />Appeler
                </a>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <FavoriteButton apartmentId={apartment.id} variant="full" />
                <CompareButton apartmentId={apartment.id} variant="full" />
                <ShareButton url={typeof window !== 'undefined' ? window.location.href : undefined} title={`${apartment.typeName} — ${project?.name ?? 'ASAS'}`} variant="full" />
              </div>
            </div>

            <div className="order-1 lg:order-2 min-w-0">
              {primaryImage ? (
                <div className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-2xl bg-black/20 border border-white/10 shadow-2xl">
                  <img src={primaryImage.url} alt={primaryImage.alt ?? `${apartment.typeName} — photo ${activeImage + 1}`} className="h-full w-full object-cover" loading="eager" fetchPriority="high" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-16">
                    <div className="flex items-center justify-between text-xs text-white/85"><span>Photo du logement</span><span>{activeImage + 1} / {images.length}</span></div>
                  </div>
                  {images.length > 1 && <>
                    <button type="button" onClick={() => setActiveImage(i => i > 0 ? i - 1 : images.length - 1)} aria-label="Photo précédente" className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={() => setActiveImage(i => i < images.length - 1 ? i + 1 : 0)} aria-label="Photo suivante" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65"><ChevronRight className="h-5 w-5" /></button>
                  </>}
                </div>
              ) : (
                <div className="aspect-[4/3] lg:aspect-[5/4] rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-center p-8">
                  <div><Building2 className="h-9 w-9 text-white/25 mx-auto mb-3" /><p className="font-semibold">Photos disponibles sur demande</p><a className="inline-flex mt-3 text-sm font-semibold text-gold hover:underline" href={getWhatsAppUrl(whatsAppMsg)} target="_blank" rel="noopener noreferrer">Recevoir les photos <ArrowRight className="h-4 w-4 ml-1" /></a></div>
                </div>
              )}
              {images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{images.slice(0, 6).map((img, i) => <button key={img.id} type="button" onClick={() => setActiveImage(i)} aria-label={`Voir la photo ${i + 1}`} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-gold' : 'border-white/10'}`}><img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" /></button>)}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* V5 — DECISION FACTS */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white px-4 py-3 min-w-0">
              <Icon className="h-4 w-4 text-forest mb-1.5" />
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground truncate">{label}</p>
              <p className="text-sm font-bold text-charcoal truncate mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* V5 — PLAN + GALLERY */}
        <section className="py-9 md:py-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Plan & visuels</p>
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">Découvrez le logement.</h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-4">
            <div className="rounded-2xl bg-white border border-border overflow-hidden min-h-[320px]">
              {floorPlans.length > 0 ? (
                <FloorPlanViewer src={floorPlans[0].url} alt={floorPlans[0].alt ?? `Plan ${apartment.typeName}`} />
              ) : (
                <div className="h-full min-h-[320px] flex items-center justify-center text-center p-8">
                  <div><FileText className="h-9 w-9 text-forest/35 mx-auto mb-3" /><p className="font-semibold text-charcoal">Plan disponible sur demande</p><a href={getWhatsAppUrl(`Bonjour, je souhaite recevoir le plan de l'appartement ${apartment.typeName} dans ${project?.name ?? 'ce projet'}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex mt-3 text-sm font-semibold text-forest hover:underline">Recevoir le plan <ArrowRight className="h-4 w-4 ml-1" /></a></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 auto-rows-fr">
              {images.slice(0, 4).map((img, i) => (
                <button key={img.id} type="button" onClick={() => setActiveImage(i)} className="relative min-h-36 overflow-hidden rounded-2xl bg-white border border-border group text-left">
                  <img src={img.url} alt={img.alt ?? `${apartment.typeName} — photo ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-8 text-xs font-semibold text-white">{img.type === 'interior' ? 'Intérieur' : img.type === 'exterior' ? 'Extérieur' : img.type === 'view' ? 'Vue' : 'Logement'}</span>
                </button>
              ))}
              {images.length === 0 && <div className="col-span-2 rounded-2xl border border-dashed border-border bg-white min-h-64 flex items-center justify-center text-sm text-muted-foreground">Photos disponibles sur demande</div>}
            </div>
          </div>
          {plans3D.length > 0 && <div className="grid sm:grid-cols-2 gap-3 mt-3">{plans3D.map(img => <div key={img.id} className="rounded-2xl overflow-hidden bg-white border border-border"><img src={img.url} alt={img.alt ?? `Vue 3D ${apartment.typeName}`} className="w-full object-contain" loading="lazy" /></div>)}</div>}
        </section>

        {/* V5 — KEY BENEFITS, only factual */}
        {benefits.length > 0 && <section className="pb-9 md:pb-12"><div className="rounded-2xl bg-white border border-border p-5 md:p-7"><div className="flex items-center justify-between gap-4 mb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Points clés</p><h2 className="text-xl md:text-2xl font-bold text-charcoal mt-1">Ce que vous achetez.</h2></div></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{benefits.slice(0, 6).map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3 rounded-xl bg-ivory/60 border border-border/70 p-3.5"><span className="h-9 w-9 shrink-0 rounded-lg bg-forest/8 flex items-center justify-center"><Icon className="h-4 w-4 text-forest" /></span><div className="min-w-0"><p className="text-sm font-semibold text-charcoal">{title}</p>{text && <p className="text-xs text-muted-foreground mt-0.5">{text}</p>}</div></div>)}</div></div></section>}

        {/* V5 — DETAILS, progressive disclosure */}
        {(apartment.description || features.length > 0 || apartment.building || rooms.length > 0) && <section className="py-9 md:py-12 border-t border-border"><div className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white border border-border p-5 md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Détails</p>
            <h2 className="text-xl md:text-2xl font-bold text-charcoal mt-1">Informations du logement.</h2>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
              <Detail label="Type" value={apartment.typeName} />
              <Detail label="Surface" value={formatSurface(apartment.surface)} />
              <Detail label="Chambres" value={apartment.bedrooms} />
              <Detail label="Salle de bain" value={apartment.bathrooms} />
              <Detail label="Étage" value={apartment.floor} />
              <Detail label="Orientation" value={apartment.orientation} />
              <Detail label="Balcon" value={apartment.balconies ? apartment.balconies : 'Non'} />
              <Detail label="Parking" value={apartment.hasParking ? `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` : 'Non'} />
              {apartment.hasTerrace && <Detail label="Terrasse" value={apartment.terraceSurface ? `${apartment.terraceSurface} m²` : 'Oui'} />}
              {apartment.hasGarden && <Detail label="Jardin" value={apartment.gardenSurface ? `${apartment.gardenSurface} m²` : 'Oui'} />}
            </div>
            {apartment.description && <details className="mt-6 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-semibold text-charcoal">Description</summary><p className="text-sm leading-7 text-muted-foreground mt-3">{apartment.description}</p></details>}
          </div>

          <div className="space-y-5">
            {rooms.length > 0 && <div className="rounded-2xl bg-charcoal text-white p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Distribution</p><h2 className="text-xl font-bold mt-1">Surfaces des pièces.</h2><div className="mt-5 space-y-2">{rooms.map((room, i) => <div key={`${room.name}-${i}`} className="flex items-center justify-between gap-4 border-b border-white/10 pb-2.5 text-sm"><span className="text-white/75">{room.name}</span><span className="font-bold text-gold">{formatSurface(room.surface)}</span></div>)}</div></div>}
            {features.length > 0 && <div className="rounded-2xl bg-white border border-border p-5 md:p-7"><h2 className="text-xl font-bold text-charcoal">Caractéristiques.</h2><div className="grid sm:grid-cols-2 gap-2 mt-4">{features.map((feature, i) => <div key={`${feature}-${i}`} className="flex items-start gap-2 rounded-lg bg-ivory border border-border p-3 text-sm text-charcoal"><Check className="h-4 w-4 text-forest mt-0.5 shrink-0" />{feature}</div>)}</div></div>}
            {apartment.building && <div className="rounded-2xl bg-white border border-border p-5"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-forest" /><span className="text-sm font-semibold">{apartment.building.name}</span></div><p className="text-xs text-muted-foreground mt-2">{apartment.building.code} · {apartment.building.floors} niveau{apartment.building.floors > 1 ? 'x' : ''}{apartment.building.hasElevator ? ' · Ascenseur' : ''}</p></div>}
          </div>
        </div></section>}

        {/* V5 — PRICE / CONDITIONS */}
        <section className="py-9 md:py-12 border-t border-border">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-5 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Prix & conditions</p>
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">Décidez avec les bonnes informations.</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white border border-border p-5"><p className="text-xs text-muted-foreground">Prix</p><p className="text-2xl font-bold text-forest mt-1">{displayPrice}</p>{pricePerSqm && <p className="text-xs text-muted-foreground mt-1">{pricePerSqm}</p>}</div>
              <div className="rounded-2xl bg-white border border-border p-5"><p className="text-xs text-muted-foreground">Disponibilité</p><div className="mt-2"><StatusBadge status={apartment.status} type="apartment" /></div></div>
              {apartment.paymentPlan && <div className="sm:col-span-2 rounded-2xl bg-white border border-border p-5"><div className="flex gap-3"><CircleDollarSign className="h-5 w-5 text-forest shrink-0" /><div><p className="text-xs text-muted-foreground">Plan de paiement</p><p className="text-sm font-semibold text-charcoal mt-1">{apartment.paymentPlan}</p></div></div></div>}
              <div className="sm:col-span-2 flex flex-wrap gap-2"><BrochureDownload apartment={apartment} project={project} variant="full" />{showContactCta && <a href={getWhatsAppUrl(whatsAppMsg)} target="_blank" rel="noopener noreferrer"><Button className="bg-forest hover:bg-forest/90 text-white"><MessageCircle className="h-4 w-4" />Vérifier la disponibilité</Button></a>}</div>
            </div>
          </div>
        </section>

        {/* V5 — FINANCE only when there is a real price */}
        {!apartment.priceOnRequest && apartment.price && <section className="py-9 md:py-12 border-t border-border"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Financement</p><h2 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">Estimez votre mensualité.</h2><MortgageCalculator defaultPrice={apartment.price} /></div></section>}

        {/* V5 — FINAL CONVERSION */}
        {showContactCta && <section className="py-9 md:py-14"><div className="rounded-3xl bg-charcoal text-white overflow-hidden"><div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-0"><div className="p-6 md:p-9 lg:p-11 flex flex-col justify-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Prochaine étape</p><h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2 leading-tight">Demandez une visite.</h2><p className="text-sm leading-6 text-white/60 mt-3 max-w-md">Recevez les informations de ce logement et échangez directement avec ASAS.</p><div className="mt-5 space-y-2 text-sm text-white/75"><p className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" />Disponibilité</p><p className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" />Plan & documents</p><p className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" />Visite</p></div></div><div className="bg-white text-charcoal p-5 md:p-7"><LeadForm projectId={project?.id} projectName={project?.name} apartmentId={apartment.id} apartmentName={`${apartment.typeName} (${formatSurface(apartment.surface)})`} intent="BOOK_VISIT" showWhatsApp showPhone compact /><p className="mt-3 text-[11px] leading-4 text-muted-foreground text-center">Vos informations servent uniquement à traiter votre demande auprès d&apos;ASAS.</p></div></div></div></section>}

        {/* V5 — ALTERNATIVES */}
        <section className="py-6 md:py-9 border-t border-border"><div className="flex items-end justify-between gap-4 mb-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Alternatives</p><h2 className="text-xl md:text-2xl font-bold text-charcoal mt-1">Autres logements du projet.</h2></div><a href={`/projects/${projectSlug}`} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-forest">Voir le projet<ArrowRight className="h-4 w-4" /></a></div><PropertyRecommender currentApartmentType={apartment.apartmentType} currentProjectId={project?.id ?? ''} excludeId={apartment.id} /></section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return <div className="border-b border-border pb-2.5 min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold text-charcoal truncate mt-0.5">{value !== null && value !== undefined && value !== '' ? String(value) : '—'}</p></div>;
}

function CalendarCheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 9.5h18M8.5 14l2 2 5-5" /></svg>;
}

function ApartmentDetailSkeleton() {
  return <main className="min-h-screen bg-ivory"><div className="bg-charcoal p-4 md:p-8"><div className="max-w-7xl mx-auto space-y-4"><div className="h-4 w-32 shimmer-premium rounded" /><div className="grid lg:grid-cols-2 gap-8"><div className="space-y-4"><div className="h-5 w-28 shimmer-premium rounded" /><div className="h-14 w-72 shimmer-premium rounded-xl" /><div className="h-5 w-56 shimmer-premium rounded" /><div className="h-10 w-44 shimmer-premium rounded-xl" /><div className="h-12 w-56 shimmer-premium rounded-xl" /></div><div className="aspect-[4/3] shimmer-premium rounded-2xl" /></div></div></div><div className="max-w-7xl mx-auto p-4"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 shimmer-premium rounded-xl" />)}</div><div className="grid lg:grid-cols-2 gap-8 mt-10"><div className="h-80 shimmer-premium rounded-2xl" /><div className="h-80 shimmer-premium rounded-2xl" /></div></div></main>;
}
