'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { useApartment } from '@/lib/api';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { trackEvent } from '@/lib/analytics';
import { formatPrice, formatSurface, APARTMENT_STATUS_LABELS, getWhatsAppUrl, getPhoneUrl, ASAS } from '@/lib/constants';
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
import { VideoSection, type VideoItem } from '@/components/shared/VideoPlayer';
import { JsonLd } from '@/components/seo/JsonLd';
import { apartmentSchema } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import {
  Maximize,
  Layers,
  Compass,
  Bed,
  Bath,
  DoorOpen,
  Car,
  ArrowLeft,
  Phone,
  PhoneCall,
  MessageCircle,
  FileText,
  CircleDollarSign,
  CreditCard,
  Share2,
  MapPin,
  Building2,
  Sparkles,
  LayoutGrid,
  Flower2,
  TreePine,
  CheckCircle2,
  Shield,
  TrendingUp,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Info,
} from 'lucide-react';
import type { ApartmentImage } from '@/lib/types';

/* ─── Subtle animation helpers (NO opacity:0 initial states) ─── */
const slideUp: Variants = {
  hidden: { y: 12 },
  visible: { y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.06 } },
};

interface ApartmentDetailPageProps {
  projectSlug: string;
  apartmentSlug: string;
}

export default function ApartmentDetailPage({ projectSlug, apartmentSlug }: ApartmentDetailPageProps) {
  const router = useRouter();
  const { data: apartment, isLoading, error } = useApartment(apartmentSlug);
  const addRecentlyViewed = useRecentlyViewed(s => s.addRecentlyViewed);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // Fetch published videos for this apartment (client-side).
  useEffect(() => {
    if (!apartment?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/videos?apartmentId=${apartment.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setVideos(json.data ?? []);
      } catch {
        // ignore — videos are optional
      }
    })();
    return () => { cancelled = true; };
  }, [apartment?.id]);

  // Track recently viewed — hook runs unconditionally before any early return.
  useEffect(() => {
    if (apartment?.id) {
      addRecentlyViewed(apartment.id);
      trackEvent('recently_viewed_add', {
        apartment_id: apartment.id,
        apartment_type: apartment.typeName,
      });
    }
  }, [apartment?.id, apartment?.typeName, addRecentlyViewed]);

  /* Open lightbox — hook must be before early returns */
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    if (apartment?.id) {
      trackEvent('gallery_open', { apartment_id: apartment.id, image_index: index });
    }
  }, [apartment?.id]);

  if (isLoading) return <ApartmentDetailSkeleton />;
  if (error || !apartment) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Appartement introuvable</h2>
          <p className="text-muted-foreground mb-6">L&apos;appartement que vous cherchez n&apos;existe pas.</p>
          <Button onClick={() => router.goProject(projectSlug)}>
            <ArrowLeft className="h-4 w-4" />
            Retour au projet
          </Button>
        </div>
      </main>
    );
  }

  const project = apartment.project;
  let rooms: Array<{ name: string; surface: number }> | null = null;
  try {
    rooms = apartment.rooms ? JSON.parse(apartment.rooms) : null;
  } catch {
    rooms = null;
  }

  /* Helper: get hero image from structured images array */
  const getHeroImage = (): string => {
    const hero = apartment.images?.find(img => img.type === 'hero');
    if (hero) return hero.url;
    const firstGallery = apartment.images?.find(img => img.type === 'gallery');
    if (firstGallery) return firstGallery.url;
    return apartment.images?.[0]?.url ?? '/images/brand/hero.jpg';
  };

  const heroImageUrl = getHeroImage();

  /* Gallery images (all visual types) */
  const galleryImages: ApartmentImage[] = (apartment.images ?? [])
    .filter(img => img.type === 'gallery' || img.type === 'interior' || img.type === 'exterior' || img.type === 'view' || img.type === 'hero')
    .sort((a, b) => a.order - b.order);

  /* Floor plan images */
  const floorPlanImages: ApartmentImage[] = (apartment.images ?? [])
    .filter(img => img.type === 'floor-plan')
    .sort((a, b) => a.order - b.order);

  /* 3D plan images */
  const plan3DImages: ApartmentImage[] = (apartment.images ?? [])
    .filter(img => img.type === '3d-plan')
    .sort((a, b) => a.order - b.order);

  /* Parse features JSON */
  let featuresList: string[] = [];
  try {
    featuresList = apartment.features ? JSON.parse(apartment.features) : [];
  } catch {
    featuresList = [];
  }

  const whatsAppMsg = `Bonjour, je suis intéressé(e) par l'appartement ${apartment.typeName} (${formatSurface(apartment.surface)}) dans le projet ${project?.name}. Pouvez-vous me donner plus d'informations ?`;

  const displayPrice = apartment.priceOnRequest
    ? 'Prix sur demande'
    : apartment.price
    ? formatPrice(apartment.price)
    : 'Prix sur demande';

  const pricePerSqm = !apartment.priceOnRequest && apartment.price && apartment.surface
    ? formatPrice(Math.round(apartment.price / apartment.surface))
    : null;

  const isAvailable = apartment.status === 'AVAILABLE';

  /* Selling points — curated value propositions */
  const sellingPoints: Array<{ icon: React.ReactNode; title: string; desc: string }> = [];
  if (isAvailable) {
    sellingPoints.push({
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      title: 'Disponible immédiatement',
      desc: 'Cet appartement est disponible à la réservation. Contactez-nous pour réserver.',
    });
  }
  if (apartment.paymentPlan) {
    sellingPoints.push({
      icon: <CreditCard className="h-5 w-5 text-forest" />,
      title: `Paiement ${apartment.paymentPlan}`,
      desc: 'Un plan de paiement flexible adapté à votre budget.',
    });
  }
  if (apartment.hasParking) {
    sellingPoints.push({
      icon: <Car className="h-5 w-5 text-forest" />,
      title: 'Parking inclus',
      desc: `${apartment.parkingSpots ?? 1} place(s) de parking sécurisée(s).`,
    });
  }
  if (apartment.orientation) {
    sellingPoints.push({
      icon: <Compass className="h-5 w-5 text-gold" />,
      title: `Orientation ${apartment.orientation}`,
      desc: 'Bonne exposition pour la luminosité naturelle.',
    });
  }
  if (apartment.hasTerrace) {
    sellingPoints.push({
      icon: <Flower2 className="h-5 w-5 text-forest" />,
      title: 'Terrasse',
      desc: apartment.terraceSurface ? `Terrasse de ${apartment.terraceSurface} m².` : 'Profitez d\'un espace extérieur privé.',
    });
  }
  if (apartment.hasGarden) {
    sellingPoints.push({
      icon: <TreePine className="h-5 w-5 text-forest" />,
      title: 'Jardin privé',
      desc: apartment.gardenSurface ? `Jardin de ${apartment.gardenSurface} m².` : 'Un jardin privatif pour votre famille.',
    });
  }
  if (project?.hasElevator) {
    sellingPoints.push({
      icon: <Building2 className="h-5 w-5 text-forest" />,
      title: 'Ascenseur',
      desc: 'Immeuble équipé d\'un ascenseur pour votre confort.',
    });
  }
  if (project?.hasSecurity) {
    sellingPoints.push({
      icon: <Shield className="h-5 w-5 text-forest" />,
      title: 'Sécurité 24/7',
      desc: 'Résidence sécurisée avec gardiennage permanent.',
    });
  }

  return (
    <main className="min-h-screen bg-background">
      {/* JSON-LD structured data for SEO */}
      <JsonLd data={apartmentSchema({
        typeName: apartment.typeName,
        surface: apartment.surface,
        bedrooms: apartment.bedrooms,
        bathrooms: apartment.bathrooms ?? undefined,
        balconies: apartment.balconies ?? undefined,
        floor: apartment.floor ?? undefined,
        orientation: apartment.orientation ?? undefined,
        price: apartment.price ?? undefined,
        priceOnRequest: apartment.priceOnRequest,
        status: apartment.status,
        paymentPlan: apartment.paymentPlan ?? undefined,
        renderImage: heroImageUrl ?? undefined,
        project: project ? {
          name: project.name,
          district: project.district,
          city: project.city,
          slug: project.slug,
        } : undefined,
      })} />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO — Price, Type, Surface, Status, CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-charcoal py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' },
                ...(project ? [{ label: project.name, onClick: () => router.goProject(projectSlug), hashUrl: `/projects/${projectSlug}` }] : []),
                { label: apartment.typeName, hashUrl: `/projects/${projectSlug}/apartments/${apartmentSlug}` },
              ]}
            />
          </div>

          {/* Back link */}
          <button
            onClick={() => router.goProject(projectSlug)}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à {project?.name || 'projet'}
          </button>

          {/* Main hero content */}
          <div className="flex flex-col gap-5">
            {/* Row 1: Type + Surface + Status */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                {apartment.typeName}
              </h1>
              <span className="text-2xl md:text-3xl font-light text-white/50">—</span>
              <span className="text-2xl md:text-3xl font-semibold text-white/90">
                {formatSurface(apartment.surface)}
              </span>
              <StatusBadge status={apartment.status} type="apartment" />
            </div>

            {/* Row 2: Location */}
            {project && (
              <p className="flex items-center gap-2 text-white/60 text-base">
                <MapPin className="h-4 w-4" />
                {project.name} — {project.district}, {project.city}
              </p>
            )}

            {/* Row 3: Price — prominent */}
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-bold text-gold">
                {displayPrice}
              </span>
              {pricePerSqm && (
                <span className="text-base text-white/50">
                  ({pricePerSqm}/m²)
                </span>
              )}
            </div>

            {/* Row 4: CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary CTA */}
              <a
                href={getWhatsAppUrl(whatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('apartment_cta_click', { apartment_id: apartment.id, cta: 'whatsapp_hero' })}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold h-11 px-5 text-sm shadow-lg shadow-green-600/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Demander des informations
              </a>
              {/* Secondary CTAs */}
              <a
                href={getPhoneUrl()}
                onClick={() => trackEvent('phone_click', { apartment_id: apartment.id, source: 'hero' })}
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 text-white/90 hover:text-white hover:bg-white/10 hover:border-white/50 font-medium h-11 px-4 text-sm transition-all"
              >
                <PhoneCall className="h-4 w-4" />
                Appeler
              </a>
              {/* Utility buttons */}
              <FavoriteButton apartmentId={apartment.id} variant="full" />
              <CompareButton apartmentId={apartment.id} variant="full" />
              <ShareButton variant="full" />
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium border border-white/30 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/50 h-9 px-3 transition-all"
                aria-label="Partager"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: KEY INFO STRIP — Quick evaluation bar
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-card border-b border-border py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <InfoItem icon={<Bed className="h-4 w-4" />} label="Chambres" value={`${apartment.bedrooms}`} />
            <InfoDivider />
            <InfoItem icon={<Bath className="h-4 w-4" />} label="SdB" value={`${apartment.bathrooms ?? '—'}`} />
            <InfoDivider />
            <InfoItem icon={<Layers className="h-4 w-4" />} label="Étage" value={apartment.floor != null ? `${apartment.floor}${apartment.totalFloors ? `/${apartment.totalFloors}` : ''}` : '—'} />
            <InfoDivider />
            <InfoItem icon={<Compass className="h-4 w-4" />} label="Orientation" value={apartment.orientation || '—'} />
            <InfoDivider />
            <InfoItem icon={<Car className="h-4 w-4" />} label="Parking" value={apartment.hasParking ? `${apartment.parkingSpots ?? 1}` : 'Non'} />
            <InfoDivider />
            <InfoItem icon={<DoorOpen className="h-4 w-4" />} label="Balcon" value={apartment.balconies ? `${apartment.balconies}` : '—'} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: GALLERY — Photos with lightbox
          ═══════════════════════════════════════════════════════════════ */}
      {galleryImages.length > 0 && (
        <section className="py-8 md:py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-forest" />
              Photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className={`relative overflow-hidden rounded-xl border border-border hover:border-forest/40 hover:shadow-md transition-all group ${
                    idx === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? `${apartment.typeName} — photo ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : undefined}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {idx === 0 && (
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                      <ZoomIn className="h-3 w-3" />
                      Voir
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos — only renders if videos exist for this apartment */}
      {videos.length > 0 && (
        <section className="py-8 md:py-10 px-4 bg-background border-t border-border">
          <div className="max-w-6xl mx-auto">
            <VideoSection videos={videos} title="Vidéo de l'appartement" />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: FLOOR PLAN — Core evaluation element
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-8 md:py-10 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-forest" />
              Plan de l&apos;appartement
            </h2>
            {floorPlanImages.length > 0 && (
              <a
                href={getWhatsAppUrl(`Bonjour, je souhaite recevoir le plan détaillé de l'appartement ${apartment.typeName} (${formatSurface(apartment.surface)}) dans ${project?.name ?? 'votre projet'}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-forest hover:text-forest/80 font-medium flex items-center gap-1 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Recevoir le plan HD
              </a>
            )}
          </div>

          {floorPlanImages.length > 0 ? (
            <FloorPlanViewer
              src={floorPlanImages[0].url}
              alt={floorPlanImages[0].alt ?? `Plan ${apartment.typeName}`}
            />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-forest/20 bg-card flex items-center justify-center h-64 md:h-80">
              <div className="text-center px-4">
                <FileText className="h-12 w-12 text-forest/25 mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Plan d&apos;appartement</p>
                <p className="text-muted-foreground text-sm mb-4">Plan disponible sur demande</p>
                <a
                  href={getWhatsAppUrl(whatsAppMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('apartment_cta_click', { apartment_id: apartment.id, cta: 'request_floorplan' })}
                >
                  <Button variant="outline" className="border-forest text-forest hover:bg-forest/5">
                    <MessageCircle className="h-4 w-4" />
                    Demander le plan via WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* 3D Plan images */}
          {plan3DImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-forest" />
                Vue 3D
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan3DImages.map((img) => (
                  <div key={img.id} className="rounded-xl overflow-hidden border border-border bg-card">
                    <img
                      src={img.url}
                      alt={img.alt ?? `Plan 3D ${apartment.typeName}`}
                      className="w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: ROOM BREAKDOWN — Surface distribution
          ═══════════════════════════════════════════════════════════════ */}
      {rooms && rooms.length > 0 && (
        <section className="py-8 md:py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Répartition des pièces
            </h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {rooms.map((room: { name: string; surface: number }, idx: number) => (
                <motion.div
                  key={idx}
                  variants={slideUp}
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{room.name}</span>
                    <span className="text-sm font-semibold text-forest">{formatSurface(room.surface)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-forest/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest/30"
                      style={{ width: `${Math.max(4, apartment.surface > 0 ? (room.surface / apartment.surface) * 100 : 0)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
              <motion.div
                variants={slideUp}
                className="flex items-center justify-between p-4 rounded-xl bg-forest/5 border-2 border-forest/30"
              >
                <span className="text-sm font-bold text-forest">Total</span>
                <span className="text-base font-bold text-forest">{formatSurface(apartment.surface)}</span>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: PRICE & AVAILABILITY — Clear commercial terms
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-8 md:py-10 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-forest" />
            Prix & Disponibilité
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price card */}
            <div className="p-5 rounded-xl border-l-4 border-l-forest bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1">Prix</p>
              <p className="text-2xl font-bold text-forest">
                {displayPrice}
              </p>
            </div>

            {/* Price per m² */}
            {pricePerSqm && (
              <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                <p className="text-xs text-muted-foreground font-medium mb-1">Prix au m²</p>
                <p className="text-lg font-bold text-foreground">{pricePerSqm}/m²</p>
              </div>
            )}

            {/* Payment plan */}
            {apartment.paymentPlan && (
              <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                <p className="text-xs text-muted-foreground font-medium mb-1">Plan de paiement</p>
                <p className="text-sm font-medium text-foreground">{apartment.paymentPlan}</p>
              </div>
            )}

            {/* Status */}
            <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1">Statut</p>
              <div className="mt-1">
                <StatusBadge status={apartment.status} type="apartment" />
              </div>
            </div>
          </div>

          {/* Check availability CTA */}
          {isAvailable && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={getWhatsAppUrl(whatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('apartment_cta_click', { apartment_id: apartment.id, cta: 'check_availability' })}
              >
                <Button className="bg-forest hover:bg-forest/90 text-white">
                  <Info className="h-4 w-4" />
                  Vérifier la disponibilité
                </Button>
              </a>
              <BrochureDownload apartment={apartment} project={project} variant="full" />
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7: POURQUOI CET APPARTEMENT — Decision guidance
          ═══════════════════════════════════════════════════════════════ */}
      {sellingPoints.length > 0 && (
        <section className="py-8 md:py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-forest" />
              Pourquoi cet appartement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sellingPoints.slice(0, 4).map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-forest/20 transition-all"
                >
                  <div className="mb-2">{point.icon}</div>
                  <p className="text-sm font-semibold text-foreground mb-1">{point.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8: DESCRIPTION & FEATURES
          ═══════════════════════════════════════════════════════════════ */}
      {(apartment.description || featuresList.length > 0 || apartment.building) && (
        <section className="py-8 md:py-10 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Building info */}
            {apartment.building && (
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-forest" />
                  <h3 className="text-sm font-semibold text-foreground">Bâtiment</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{apartment.building.name}</span>
                  <span className="inline-flex items-center rounded-md bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">
                    {apartment.building.code}
                  </span>
                  <span>{apartment.building.floors} étage{apartment.building.floors > 1 ? 's' : ''}</span>
                  {apartment.building.hasElevator && (
                    <span className="inline-flex items-center gap-1 text-forest">Ascenseur</span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {apartment.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{apartment.description}</p>
              </div>
            )}

            {/* Features list */}
            {featuresList.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-forest" />
                  Caractéristiques
                </h3>
                <div className="flex flex-wrap gap-2">
                  {featuresList.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Terrace & Garden info */}
            {(apartment.hasTerrace || apartment.hasGarden) && (
              <div className="flex flex-wrap items-center gap-4">
                {apartment.hasTerrace && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
                    <Flower2 className="h-5 w-5 text-forest" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Terrasse</p>
                      {apartment.terraceSurface && (
                        <p className="text-xs text-muted-foreground">{apartment.terraceSurface} m&sup2;</p>
                      )}
                    </div>
                  </div>
                )}
                {apartment.hasGarden && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
                    <TreePine className="h-5 w-5 text-forest" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Jardin</p>
                      {apartment.gardenSurface && (
                        <p className="text-xs text-muted-foreground">{apartment.gardenSurface} m&sup2;</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 9: MORTGAGE CALCULATOR
          ═══════════════════════════════════════════════════════════════ */}
      {!apartment.priceOnRequest && apartment.price && (
        <section className="py-8 md:py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Simulez votre crédit immobilier
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Estimez vos mensualités en quelques secondes
            </p>
            <div className="max-w-2xl">
              <MortgageCalculator defaultPrice={apartment.price} />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 10: LEAD FORM — Contact form (secondary position)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Je suis intéressé par cet appartement
            </h2>
            <p className="text-muted-foreground text-sm">
              {apartment.typeName} — {formatSurface(apartment.surface)}{project ? ` — ${project.name}` : ''}
            </p>
          </div>

          {/* Quick contact buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <a
              href={getWhatsAppUrl(whatsAppMsg)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { apartment_id: apartment.id, source: 'contact_section' })}
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white h-11 px-5">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
            <a
              href={getPhoneUrl()}
              onClick={() => trackEvent('phone_click', { apartment_id: apartment.id, source: 'contact_section' })}
            >
              <Button variant="outline" className="h-11 px-5">
                <PhoneCall className="h-4 w-4" />
                Appeler
              </Button>
            </a>
          </div>

          {/* Lead form */}
          <div className="rounded-xl border border-border bg-card p-6">
            <LeadForm
              projectId={project?.id}
              projectName={project?.name}
              apartmentId={apartment.id}
              apartmentName={`${apartment.typeName} (${formatSurface(apartment.surface)})`}
              intent="REQUEST_INFORMATION"
              showWhatsApp={true}
              showPhone={true}
              compact
            />
            <p className="mt-4 text-xs text-muted-foreground text-center">
              🔒 Vos données sont protégées — ASAS ne partage jamais vos informations.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 11: PROPERTY RECOMMENDER — De-emphasized
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <PropertyRecommender
            currentApartmentType={apartment.apartmentType}
            currentProjectId={project?.id ?? ''}
            excludeId={apartment.id}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE CONVERSION BAR — Fixed bottom on mobile
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center gap-2 p-3">
          <a
            href={getWhatsAppUrl(whatsAppMsg)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { apartment_id: apartment.id, source: 'mobile_bar' })}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold h-11 text-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={getPhoneUrl()}
            onClick={() => trackEvent('phone_click', { apartment_id: apartment.id, source: 'mobile_bar' })}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-forest text-forest hover:bg-forest/5 font-semibold h-11 text-sm transition-colors"
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          LIGHTBOX — Gallery fullscreen viewer
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation: Previous */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Navigation: Next */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={galleryImages[lightboxIndex]?.url}
              alt={galleryImages[lightboxIndex]?.alt ?? `${apartment.typeName} — photo ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title={`${apartment.typeName} — ${project?.name ?? ''}`}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        description={`${apartment.typeName} (${formatSurface(apartment.surface)}) dans ${project?.name ?? 'le projet'} — ${project?.district ?? ''}, ${project?.city ?? ''}`}
      />

      {/* Bottom spacer for mobile conversion bar */}
      <div className="h-20 sm:hidden" />
    </main>
  );
}

/* ─── Key Info Item Component ─── */
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-forest">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* ─── Divider between info items ─── */
function InfoDivider() {
  return <span className="text-border hidden sm:inline">|</span>;
}

/* ─── Loading Skeleton ─── */
function ApartmentDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="bg-charcoal py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-4 w-32 shimmer-premium rounded" />
          <div className="h-10 w-64 shimmer-premium rounded-lg" />
          <div className="h-5 w-48 shimmer-premium rounded" />
          <div className="h-8 w-40 shimmer-premium rounded-lg" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-28 shimmer-premium rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      {/* Key Info strip skeleton */}
      <div className="bg-card border-b border-border py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-center gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-5 w-20 shimmer-premium rounded" />
          ))}
        </div>
      </div>
      {/* Gallery skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-24 shimmer-premium rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2 row-span-2 h-64 md:h-80 rounded-xl shimmer-premium" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 md:h-40 rounded-xl shimmer-premium" />
          ))}
        </div>
      </div>
      {/* Floor plan skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-48 shimmer-premium rounded" />
        <div className="h-64 rounded-xl shimmer-premium" />
      </div>
      {/* Price section skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-40 shimmer-premium rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl shimmer-premium h-24" />
          ))}
        </div>
      </div>
    </main>
  );
}
