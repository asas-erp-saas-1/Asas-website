'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { ShareModal } from '@/components/shared/ShareModal';
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
  Sparkles,
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
  const [shareOpen, setShareOpen] = useState(false);
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
  const images = useMemo(() => (
    (apartment.images ?? [])
      .filter((img: ApartmentImage) => ['hero', 'gallery', 'interior', 'exterior', 'view'].includes(img.type))
      .sort((a: ApartmentImage, b: ApartmentImage) => a.order - b.order)
  ), [apartment.images]);
  const floorPlans = (apartment.images ?? []).filter((img: ApartmentImage) => img.type === 'floor-plan').sort((a, b) => a.order - b.order);
  const plans3D = (apartment.images ?? []).filter((img: ApartmentImage) => img.type === '3d-plan').sort((a, b) => a.order - b.order);

  let rooms: Array<{ name: string; surface: number }> = [];
  try { rooms = apartment.rooms ? JSON.parse(apartment.rooms) : []; } catch { rooms = []; }
  let features: string[] = [];
  try { features = apartment.features ? JSON.parse(apartment.features) : []; } catch { features = []; }

  const displayPrice = apartment.priceOnRequest || !apartment.price ? 'Prix sur demande' : formatPrice(apartment.price);
  const pricePerSqm = !apartment.priceOnRequest && apartment.price && apartment.surface ? formatPrice(Math.round(apartment.price / apartment.surface)) : null;
  const whatsAppMsg = `Bonjour, je suis intéressé(e) par l'appartement ${apartment.typeName} (${formatSurface(apartment.surface)}) dans le projet ${project?.name ?? ''}. Pouvez-vous me confirmer sa disponibilité et m'indiquer les prochaines étapes ?`;
  const primaryImage = images[activeImage];

  const facts = [
    { icon: Bed, label: 'Chambres', value: String(apartment.bedrooms) },
    { icon: Bath, label: 'Salle de bain', value: apartment.bathrooms != null ? String(apartment.bathrooms) : '—' },
    { icon: Layers3, label: 'Étage', value: apartment.floor != null ? `${apartment.floor}${apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}` : '—' },
    { icon: Compass, label: 'Orientation', value: apartment.orientation || '—' },
    { icon: Car, label: 'Parking', value: apartment.hasParking ? `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` : 'Non inclus' },
    { icon: DoorOpen, label: 'Balcon', value: apartment.balconies ? `${apartment.balconies}` : '—' },
  ];

  const benefits = [
    apartment.hasParking && { icon: Car, title: 'Parking', text: `${apartment.parkingSpots ?? 1} place${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''} indiquée${(apartment.parkingSpots ?? 1) > 1 ? 's' : ''}` },
    apartment.orientation && { icon: Compass, title: `Orientation ${apartment.orientation}`, text: 'Une information essentielle pour apprécier l’exposition du logement.' },
    apartment.hasTerrace && { icon: Flower2, title: 'Terrasse', text: apartment.terraceSurface ? `${apartment.terraceSurface} m² d’espace extérieur.` : 'Espace extérieur privatif.' },
    apartment.hasGarden && { icon: TreePine, title: 'Jardin', text: apartment.gardenSurface ? `${apartment.gardenSurface} m² de jardin privatif.` : 'Espace extérieur privatif.' },
    project?.hasElevator && { icon: Building2, title: 'Ascenseur', text: 'Équipement indiqué pour l’immeuble.' },
    project?.hasSecurity && { icon: ShieldCheck, title: 'Résidence sécurisée', text: 'Dispositif de sécurité indiqué pour la résidence.' },
  ].filter(Boolean) as Array<{ icon: typeof Car; title: string; text: string }>;

  return (
    <main className="min-h-screen bg-ivory pb-20 sm:pb-0">
      {/* 1 — ABOVE THE FOLD: identity, visual proof, price and one decision */}
      <section className="bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
          <Breadcrumbs items={[
            { label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' },
            ...(project ? [{ label: project.name, onClick: () => router.goProject(projectSlug), hashUrl: `/projects/${projectSlug}` }] : []),
            { label: apartment.typeName, hashUrl: `/projects/${projectSlug}/apartments/${apartmentSlug}` },
          ]} />

          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6 lg:gap-10 py-5 md:py-8 items-center">
            <div className="order-2 lg:order-1">
              <button onClick={() => router.goProject(projectSlug)} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-5 transition-colors">
                <ArrowLeft className="h-4 w-4" />Retour au projet
              </button>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <StatusBadge status={apartment.status} type="apartment" />
                {project && <span className="text-xs font-medium text-white/55 border border-white/15 rounded-full px-3 py-1">{project.name}</span>}
              </div>
              <p className="text-sm font-medium text-gold mb-2">Logement sélectionné</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.02] text-balance">{apartment.typeName}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-white/75">
                <span className="font-semibold text-white">{formatSurface(apartment.surface)}</span>
                {apartment.floor != null && <span>Étage {apartment.floor}{apartment.totalFloors ? ` / ${apartment.totalFloors}` : ''}</span>}
                {project && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{project.district}, {project.city}</span>}
              </div>
              <div className="mt-7 flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45 mb-1">Prix affiché</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gold tabular-nums">{displayPrice}</p>
                </div>
                {pricePerSqm && <p className="text-sm text-white/50 pb-1">{pricePerSqm} / m²</p>}
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Vous souhaitez vérifier la disponibilité, recevoir le plan ou organiser une visite ? Un conseiller ASAS peut vous accompagner directement.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href={getWhatsAppUrl(whatsAppMsg)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('apartment_cta_click', { apartment_id: apartment.id, cta: 'whatsapp_hero' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-bold text-charcoal hover:bg-gold/90 transition-colors">
                  <MessageCircle className="h-4 w-4" />Vérifier & demander une visite
                </a>
                <a href={getPhoneUrl()} onClick={() => trackEvent('phone_click', { apartment_id: apartment.id, source: 'apartment_hero' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  <Phone className="h-4 w-4" />Appeler
                </a>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <FavoriteButton apartmentId={apartment.id} variant="full" />
                <CompareButton apartmentId={apartment.id} variant="full" />
                <ShareButton variant="full" />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              {primaryImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/20 border border-white/10">
                  <img src={primaryImage.url} alt={primaryImage.alt ?? `${apartment.typeName} — photo ${activeImage + 1}`} className="h-full w-full object-cover" loading="eager" fetchPriority="high" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-14">
                    <div className="flex items-center justify-between text-xs text-white/80"><span>Visuel du logement</span><span>{activeImage + 1} / {images.length}</span></div>
                  </div>
                  {images.length > 1 && <>
                    <button type="button" onClick={() => setActiveImage(i => i > 0 ? i - 1 : images.length - 1)} aria-label="Image précédente" className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={() => setActiveImage(i => i < images.length - 1 ? i + 1 : 0)} aria-label="Image suivante" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65"><ChevronRight className="h-5 w-5" /></button>
                  </>}
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-center p-8">
                  <div><Building2 className="h-10 w-10 text-white/25 mx-auto mb-3" /><p className="font-semibold">Visuels du logement à venir</p><p className="text-sm text-white/45 mt-1">Demandez les photos et le dossier au conseiller.</p></div>
                </div>
              )}
              {images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{images.slice(0, 6).map((img, i) => <button key={img.id} type="button" onClick={() => setActiveImage(i)} aria-label={`Voir la photo ${i + 1}`} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-gold' : 'border-white/10'}`}><img src={img.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* 2 — DECISION STRIP: facts immediately after the emotional opening */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
          {facts.map(({ icon: Icon, label, value }) => <div key={label} className="bg-white px-4 py-3 min-w-0"><Icon className="h-4 w-4 text-forest mb-2" /><p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</p><p className="text-sm font-bold text-charcoal truncate mt-0.5">{value}</p></div>)}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* 3 — VISUAL PROOF + PLAN: the middle of the page is about reducing uncertainty */}
        <section className="py-10 md:py-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div>
            <div className="flex items-end justify-between gap-4 mb-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Se projeter</p><h2 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">Voyez comment le logement est organisé.</h2></div></div>
            {floorPlans.length > 0 ? <FloorPlanViewer src={floorPlans[0].url} alt={floorPlans[0].alt ?? `Plan ${apartment.typeName}`} /> : <div className="min-h-64 rounded-2xl border border-dashed border-forest/25 bg-white flex items-center justify-center text-center p-8"><div><FileText className="h-9 w-9 text-forest/35 mx-auto mb-3" /><p className="font-semibold text-charcoal">Plan disponible sur demande</p><p className="text-sm text-muted-foreground mt-1 mb-4">Recevez le plan détaillé directement auprès d&apos;ASAS.</p><a href={getWhatsAppUrl(`Bonjour, je souhaite recevoir le plan de l'appartement ${apartment.typeName} dans ${project?.name ?? 'ce projet'}.`)} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="border-forest text-forest"><MessageCircle className="h-4 w-4" />Demander le plan</Button></a></div></div>}
            {plans3D.length > 0 && <div className="grid sm:grid-cols-2 gap-3 mt-4">{plans3D.map(img => <div key={img.id} className="rounded-xl overflow-hidden bg-white border border-border"><img src={img.url} alt={img.alt ?? `Vue 3D ${apartment.typeName}`} className="w-full object-contain" loading="lazy" /></div>)}</div>}
          </div>
          <div className="lg:pt-8">
            <div className="bg-white rounded-2xl border border-border p-5 md:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">À retenir</p>
              <h2 className="text-xl md:text-2xl font-bold text-charcoal mt-2">Les informations qui comptent pour décider.</h2>
              <div className="mt-5 space-y-3">
                {benefits.slice(0, 5).map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><span className="h-9 w-9 shrink-0 rounded-lg bg-forest/8 flex items-center justify-center"><Icon className="h-4 w-4 text-forest" /></span><div><p className="text-sm font-semibold text-charcoal">{title}</p><p className="text-xs leading-5 text-muted-foreground mt-0.5">{text}</p></div></div>)}
                {apartment.paymentPlan && <div className="flex gap-3 pt-3 border-t border-border"><span className="h-9 w-9 shrink-0 rounded-lg bg-gold/15 flex items-center justify-center"><CircleDollarSign className="h-4 w-4 text-forest" /></span><div><p className="text-sm font-semibold text-charcoal">Plan de paiement</p><p className="text-xs leading-5 text-muted-foreground mt-0.5">{apartment.paymentPlan}</p></div></div>}
              </div>
            </div>
          </div>
        </section>

        {/* 4 — ROOM DISTRIBUTION: only when real data exists */}
        {rooms.length > 0 && <section className="pb-10 md:pb-14"><div className="bg-charcoal rounded-2xl p-6 md:p-8 text-white"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Répartition</p><h2 className="text-2xl font-bold mt-1">Une lecture simple des surfaces.</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">{rooms.map((room, i) => <div key={`${room.name}-${i}`} className="rounded-xl bg-white/[0.06] border border-white/10 p-4"><div className="flex justify-between gap-3 text-sm"><span className="text-white/80">{room.name}</span><span className="font-bold text-gold">{formatSurface(room.surface)}</span></div><div className="h-1 mt-3 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gold/70 rounded-full" style={{ width: `${Math.min(100, Math.max(4, apartment.surface ? room.surface / apartment.surface * 100 : 0))}%` }} /></div></div>)}</div></div></section>}

        {/* 5 — COMMERCIAL CLARITY: price, status and document access */}
        <section className="py-10 md:py-14 border-t border-border">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Clarté commerciale</p><h2 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">Tout ce qu&apos;il faut vérifier avant de vous engager.</h2><p className="text-sm leading-6 text-muted-foreground mt-3 max-w-lg">Le prix et la disponibilité affichés correspondent aux informations actuellement associées à ce logement. Pour confirmer la situation du lot et obtenir les documents utiles, échangez avec un conseiller ASAS.</p></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white border border-border p-5"><p className="text-xs text-muted-foreground">Prix</p><p className="text-2xl font-bold text-forest mt-1">{displayPrice}</p>{pricePerSqm && <p className="text-xs text-muted-foreground mt-1">{pricePerSqm} / m²</p>}</div>
              <div className="rounded-2xl bg-white border border-border p-5"><p className="text-xs text-muted-foreground">Disponibilité</p><div className="mt-2"><StatusBadge status={apartment.status} type="apartment" /></div></div>
              {apartment.paymentPlan && <div className="rounded-2xl bg-white border border-border p-5 sm:col-span-2"><p className="text-xs text-muted-foreground">Plan de paiement indiqué</p><p className="text-sm font-semibold text-charcoal mt-1">{apartment.paymentPlan}</p></div>}
              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1"><BrochureDownload apartment={apartment} project={project} variant="full" /><a href={getWhatsAppUrl(whatsAppMsg)} target="_blank" rel="noopener noreferrer"><Button className="bg-forest hover:bg-forest/90 text-white"><MessageCircle className="h-4 w-4" />Vérifier avec un conseiller</Button></a></div>
            </div>
          </div>
        </section>

        {/* 6 — DETAILS: progressive disclosure, not an information wall */}
        {(apartment.description || features.length > 0) && <section className="py-10 md:py-14 border-t border-border"><div className="grid lg:grid-cols-2 gap-10"><div>{apartment.description && <><p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Le logement</p><h2 className="text-2xl font-bold text-charcoal mt-1">Description</h2><p className="text-sm leading-7 text-muted-foreground mt-4 max-w-2xl">{apartment.description}</p></>}{apartment.building && <div className="mt-6 rounded-xl bg-white border border-border p-4"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-forest" /><span className="text-sm font-semibold">{apartment.building.name}</span></div><p className="text-xs text-muted-foreground mt-2">{apartment.building.code} · {apartment.building.floors} niveau{apartment.building.floors > 1 ? 'x' : ''}{apartment.building.hasElevator ? ' · Ascenseur' : ''}</p></div>}</div>{features.length > 0 && <div><h2 className="text-xl font-bold text-charcoal">Caractéristiques</h2><div className="grid sm:grid-cols-2 gap-2 mt-4">{features.map((feature, i) => <div key={`${feature}-${i}`} className="flex items-start gap-2 rounded-lg bg-white border border-border p-3 text-sm text-charcoal"><Check className="h-4 w-4 text-forest mt-0.5 shrink-0" />{feature}</div>)}</div></div>}</div></section>}

        {/* 7 — FINANCE: only if a real price exists */}
        {!apartment.priceOnRequest && apartment.price && <section className="py-10 md:py-14 border-t border-border"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Financement</p><h2 className="text-2xl md:text-3xl font-bold text-charcoal mt-1">Estimez vos mensualités.</h2><p className="text-sm text-muted-foreground mt-2 mb-5">Simulation indicative à utiliser comme point de départ de votre réflexion.</p><MortgageCalculator defaultPrice={apartment.price} /></div></section>}

        {/* 8 — PRIMARY CONVERSION: one clear low-friction action */}
        <section className="py-10 md:py-16"><div className="rounded-3xl bg-charcoal text-white p-6 md:p-10 lg:p-12"><div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Prochaine étape</p><h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2 leading-tight">Vous voulez savoir si ce logement est réellement fait pour vous ?</h2><p className="text-sm leading-6 text-white/60 mt-4">Demandez les informations utiles, vérifiez la disponibilité et échangez avec un conseiller sans parcours compliqué.</p><div className="mt-5 space-y-2 text-sm text-white/75"><p className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" />Réponse orientée vers ce logement</p><p className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" />Possibilité de demander une visite</p><p className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5" />Documents et précisions selon votre besoin</p></div></div><div className="rounded-2xl bg-white p-5 md:p-6 text-charcoal"><LeadForm projectId={project?.id} projectName={project?.name} apartmentId={apartment.id} apartmentName={`${apartment.typeName} (${formatSurface(apartment.surface)})`} intent="REQUEST_INFORMATION" showWhatsApp showPhone compact /><p className="mt-3 text-[11px] leading-4 text-muted-foreground text-center">Vos informations servent uniquement à traiter votre demande auprès d&apos;ASAS.</p></div></div></div></section>

        {/* 9 — ALTERNATIVES: after the decision, not before */}
        <section className="py-6 md:py-10 border-t border-border"><div className="flex items-end justify-between gap-4 mb-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Comparer</p><h2 className="text-xl md:text-2xl font-bold text-charcoal mt-1">Vous hésitez encore ?</h2></div><a href={`/projects/${projectSlug}`} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-forest">Voir le projet<ArrowRight className="h-4 w-4" /></a></div><PropertyRecommender currentApartmentType={apartment.apartmentType} currentProjectId={project?.id ?? ''} excludeId={apartment.id} /></section>
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} title={`${apartment.typeName} — ${project?.name ?? ''}`} url={typeof window !== 'undefined' ? window.location.href : ''} description={`${apartment.typeName} (${formatSurface(apartment.surface)}) — ${project?.name ?? ''}`} />

      {/* Mobile: one dominant CTA + phone, never four competing buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border bg-white/95 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="p-3 flex gap-2">
          <a href={getWhatsAppUrl(whatsAppMsg)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', { apartment_id: apartment.id, source: 'mobile_primary' })} className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest text-white text-sm font-bold"><MessageCircle className="h-4 w-4" />Demander une visite</a>
          <a href={getPhoneUrl()} onClick={() => trackEvent('phone_click', { apartment_id: apartment.id, source: 'mobile_secondary' })} aria-label="Appeler ASAS" className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl border border-forest text-forest"><Phone className="h-4 w-4" /></a>
        </div>
      </div>
    </main>
  );
}

function ApartmentDetailSkeleton() {
  return <main className="min-h-screen bg-ivory"><div className="bg-charcoal p-4 md:p-8"><div className="max-w-7xl mx-auto space-y-4"><div className="h-4 w-32 shimmer-premium rounded" /><div className="grid lg:grid-cols-2 gap-8"><div className="space-y-4"><div className="h-5 w-28 shimmer-premium rounded" /><div className="h-14 w-72 shimmer-premium rounded-xl" /><div className="h-5 w-56 shimmer-premium rounded" /><div className="h-10 w-44 shimmer-premium rounded-xl" /><div className="h-12 w-56 shimmer-premium rounded-xl" /></div><div className="aspect-[4/3] shimmer-premium rounded-2xl" /></div></div></div><div className="max-w-7xl mx-auto p-4"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 shimmer-premium rounded-xl" />)}</div><div className="grid lg:grid-cols-2 gap-8 mt-10"><div className="h-80 shimmer-premium rounded-2xl" /><div className="h-80 shimmer-premium rounded-2xl" /></div></div></main>;
}
