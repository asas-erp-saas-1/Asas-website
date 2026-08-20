'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { useProject } from '@/lib/api';
import { ASAS, formatPrice, formatSurface, PROJECT_STATUS_LABELS, getWhatsAppUrl, getPhoneUrl } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApartmentCard, ApartmentCardSkeleton } from '@/components/shared/ApartmentCard';
import { LeadForm } from '@/components/shared/LeadForm';
import { MortgageSimulator } from '@/components/shared/MortgageSimulator';
import { MortgageCalculator } from '@/components/shared/MortgageCalculator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import NeighborhoodInfo from '@/components/shared/NeighborhoodInfo';
import { ShareButton } from '@/components/shared/ShareButton';
import { ShareModal } from '@/components/shared/ShareModal';
import { VideoSection, type VideoItem } from '@/components/shared/VideoPlayer';
import { BookingCalendar } from '@/components/shared/BookingCalendar';
import { FAQSection } from '@/components/shared/FAQSection';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProjectMap, type MapProject } from '@/components/shared/ProjectMap';
import { ProjectGallery } from '@/components/shared/ProjectGallery';
import DeliveryTimeline from '@/components/shared/DeliveryTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { projectSchema } from '@/lib/seo';
import type { ProjectImage } from '@/lib/types';
import {
  MapPin,
  Home,
  Maximize,
  Maximize2,
  Calendar,
  Car,
  Building2,
  ArrowLeft,
  ArrowRight,
  Phone,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Waves,
  TreePine,
  Shield,
  Snowflake,
  ArrowUpFromLine,
  Camera,
  Calculator,
  ChevronDown,
  Share2,
  Info,
  LayoutGrid,
  Layers,
} from 'lucide-react';

const fadeUp = {
  hidden: { y: 12 },
  visible: { y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Stagger for apartment cards (slower for dramatic entrance) ─── */
const cardStagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const AMENITY_ICONS: Record<string, any> = {
  parking: Car,
  elevator: ArrowUpFromLine,
  garden: TreePine,
  pool: Waves,
  security: Shield,
  clim: Snowflake,
};

interface ProjectDetailPageProps {
  projectSlug: string;
}

export default function ProjectDetailPage({ projectSlug }: ProjectDetailPageProps) {
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectSlug);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [conversionTab, setConversionTab] = useState<'info' | 'visit'>('info');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // Fetch published videos for this project (client-side).
  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/videos?projectId=${project.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setVideos(json.data ?? []);
      } catch {
        // ignore — videos are optional
      }
    })();
    return () => { cancelled = true; };
  }, [project?.id]);

  if (isLoading) return <ProjectDetailSkeleton />;
  if (error || !project) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Projet introuvable</h2>
          <p className="text-muted-foreground mb-6">Le projet que vous cherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => router.goProjects()}>
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
          </Button>
        </div>
      </main>
    );
  }

  let apartmentTypes: string[] = [];
  try {
    apartmentTypes = project.apartmentTypes
      ? JSON.parse(project.apartmentTypes)
      : [...new Set(project.apartments?.map((a: any) => a.apartmentType) ?? [])];
  } catch {
    apartmentTypes = [...new Set(project.apartments?.map((a: any) => a.apartmentType) ?? [])];
  }

  const availableApartments = project.apartments?.filter((a: any) =>
    a.status === 'AVAILABLE' || a.status === 'COMING_SOON'
  ) ?? [];

  const filteredApartments = typeFilter
    ? availableApartments.filter((a: any) => a.apartmentType === typeFilter)
    : availableApartments;

  const whatsAppMsg = `Bonjour, je suis intéressé(e) par le projet ${project.name} à ${project.district}. Pouvez-vous me donner plus d'informations ?`;

  /* Helper: get hero image from structured images array */
  const getHeroImage = (): string => {
    const hero = project.images?.find(img => img.type === 'hero');
    if (hero) return hero.url;
    const firstGallery = project.images?.find(img => img.type === 'gallery');
    if (firstGallery) return firstGallery.url;
    return project.images?.[0]?.url ?? '/images/brand/hero.jpg';
  };

  const heroImageUrl = getHeroImage();

  /* Gallery images — from structured images array */
  const galleryImages: ProjectImage[] = (project.images ?? [])
    .filter(img => img.type === 'gallery' || img.type === 'exterior' || img.type === 'interior' || img.type === 'amenity' || img.type === 'architecture')
    .sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-ivory">
      {/* JSON-LD structured data for SEO */}
      <JsonLd data={projectSchema({
        name: project.name,
        description: project.description ?? undefined,
        district: project.district,
        city: project.city,
        address: project.address ?? undefined,
        latitude: project.latitude ?? undefined,
        longitude: project.longitude ?? undefined,
        startingPrice: project.startingPrice ?? undefined,
        priceOnRequest: project.priceOnRequest,
        deliveryYear: project.deliveryYear ?? undefined,
        deliveryQuarter: project.deliveryQuarter ?? undefined,
        apartmentTypes: project.apartmentTypes,
        heroImage: heroImageUrl ?? undefined,
        amenities: project.amenities?.map(a => a.name),
        ...(project.slug ? { slug: project.slug } : {}),
      })} />

      {/* Project Hero — Sales-focused with price and CTAs */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/50 to-charcoal/20" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-10">
          <Breadcrumbs
            items={[
              { label: 'Projets', onClick: () => router.goProjects(), hashUrl: '/projects' },
              { label: project.name, hashUrl: `/projects/${project.slug}` },
            ]}
          />
          <button
            onClick={() => router.goProjects()}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
          </button>
          <div className="mb-3">
            <StatusBadge status={project.status} type="project" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {project.name}
          </h1>
          {project.tagline && (
            <p className="text-lg text-white/70 mb-3">{project.tagline}</p>
          )}
          <div className="flex items-center gap-1.5 text-white/80 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{project.district}, {project.city}</span>
          </div>

          {/* Price + Available units + CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-8 gap-3">
            <div>
              {project.startingPrice && !project.priceOnRequest && (
                <div className="mb-1">
                  <span className="text-sm text-white/60">À partir de</span>
                  <p className="text-3xl font-bold text-gold">{formatPrice(project.startingPrice)}</p>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {availableApartments.length} lot{availableApartments.length > 1 ? 's' : ''} disponible{availableApartments.length > 1 ? 's' : ''}
                </span>
                {project.deliveryYear && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Livraison Q{project.deliveryQuarter} {project.deliveryYear}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={getWhatsAppUrl(whatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Button
                onClick={() => {
                  const el = document.getElementById('apartments');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="bg-white text-charcoal hover:bg-white/90"
              >
                Voir les lots
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <ShareButton variant="full" className="border-white/40 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Project Gallery — Enhanced with fullscreen button & image counter */}
      <section className="py-10 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-forest" />
                <h2 className="text-2xl font-bold text-foreground">Galerie du projet</h2>
              </div>
              {/* Image counter badge */}
              {galleryImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-medium"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {galleryImages.length} photo{galleryImages.length > 1 ? 's' : ''}
                </motion.div>
              )}
            </motion.div>
            <motion.div variants={fadeUp} className="group/gallery relative">
              <ProjectGallery
                images={galleryImages}
                projectName={project.name}
                fallbackImage={heroImageUrl}
              />
              {/* Fullscreen button on hover */}
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                aria-label="Plein écran"
              >
                <Maximize2 className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Project Videos — only renders if videos exist */}
      {videos.length > 0 && (
        <section className="py-10 px-4 bg-sand/20 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <VideoSection videos={videos} title="Vidéo du projet" />
          </div>
        </section>
      )}

      {/* Project Facts — Enhanced with colored icon backgrounds */}
      <section className="bg-white border-b border-border py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { icon: MapPin, label: 'Localisation', value: project.district, iconBg: 'bg-forest/10', iconColor: 'text-forest' },
              { icon: Calendar, label: 'Livraison', value: project.deliveryYear ? `${project.deliveryQuarter || ''} ${project.deliveryYear}` : '—', iconBg: 'bg-gold/10', iconColor: 'text-gold' },
              { icon: Home, label: 'Type', value: project.projectType === 'RESIDENTIAL' ? 'Résidentiel' : project.projectType === 'MIXED_USE' ? 'Mixte' : project.projectType, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
              { icon: Building2, label: 'Appartements', value: `${project.apartments?.length ?? 0} lots`, iconBg: 'bg-forest/10', iconColor: 'text-forest' },
              { icon: Maximize, label: 'Surface', value: project.minSurface && project.maxSurface ? `${project.minSurface}–${project.maxSurface} m²` : '—', iconBg: 'bg-gold/10', iconColor: 'text-gold' },
              { icon: Car, label: 'Parking', value: project.hasParking ? 'Oui' : 'Non', iconBg: 'bg-forest/10', iconColor: 'text-forest' },
            ].map((fact) => (
              <motion.div
                key={fact.label}
                variants={fadeUp}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="text-center p-4 rounded-xl bg-sand/50 border border-border hover:shadow-md hover:border-forest/20 transition-all duration-200 group/fact"
              >
                <div className={`w-10 h-10 rounded-xl ${fact.iconBg} flex items-center justify-center mx-auto mb-2 group-hover/fact:scale-110 transition-transform duration-200`}>
                  <fact.icon className={`h-5 w-5 ${fact.iconColor}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5 font-medium">{fact.label}</p>
                <p className="text-sm font-bold text-foreground">{fact.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Delivery Timeline */}
      {project.deliveryYear && project.deliveryQuarter && (
        <section className="bg-sand/30 py-6 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <DeliveryTimeline
              deliveryYear={project.deliveryYear}
              deliveryQuarter={project.deliveryQuarter}
              status={project.status}
              projectName={project.name}
            />
          </div>
        </section>
      )}

      {/* Delivery Progress Indicator */}
      {project.deliveryYear && project.deliveryQuarter && (() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
        const deliveryQ = parseInt(String(project.deliveryQuarter).replace(/^Q/i, ''), 10) || 1;
        const totalQuarters = (project.deliveryYear - 2024) * 4 + deliveryQ;
        const elapsedQuarters = (currentYear - 2024) * 4 + currentQuarter;
        const rawProgress = Math.max(0, Math.min(100, (elapsedQuarters / totalQuarters) * 100));
        const isDelivered = currentYear > project.deliveryYear || (currentYear === project.deliveryYear && currentQuarter >= deliveryQ);
        const progress = isDelivered ? 100 : rawProgress;
        return (
          <section className="bg-sand/30 py-6 px-4 border-b border-border">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-forest" />
                    <span className="text-sm font-medium text-foreground">
                      Livraison prévue : Q{project.deliveryQuarter} {project.deliveryYear}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isDelivered ? 'bg-forest/15 text-forest' : 'bg-gold/15 text-gold'}`}>
                    {isDelivered ? 'Livré' : 'Construction en cours'}
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-forest/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full bg-forest"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Début projet</span>
                  <span className="font-medium text-forest">Q{project.deliveryQuarter} {project.deliveryYear}</span>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })()}

      {/* Buildings Section */}
      {project.buildings && project.buildings.length > 0 && (
        <section className="py-10 px-4 bg-sand/30 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2"
            >
              <Building2 className="h-6 w-6 text-forest" />
              Bâtiments
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {project.buildings.map((building) => (
                <motion.div
                  key={building.id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-xl border border-border bg-card hover:shadow-md hover:border-forest/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">{building.name}</h3>
                    <span className="inline-flex items-center rounded-md bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest">
                      {building.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-4 w-4 text-forest" />
                      {building.floors} étage{building.floors > 1 ? 's' : ''}
                    </span>
                    {building.hasElevator && (
                      <span className="inline-flex items-center gap-1">
                        <ArrowUpFromLine className="h-4 w-4 text-forest" />
                        Ascenseur
                      </span>
                    )}
                  </div>
                  {building.apartments && building.apartments.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {building.apartments.length} appartement{building.apartments.length > 1 ? 's' : ''}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Project Story */}
      {project.description && (
        <section className="py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-4">
                À propos du projet
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed max-w-3xl">
                {project.description}
              </motion.p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Available Apartments — Sales-focused with anchor for "Voir les lots" CTA */}
      <section id="apartments" className="py-10 px-4 bg-ivory scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-8"
          >
            <div className="flex items-end justify-between mb-4">
              <motion.div variants={fadeUp} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-forest" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Appartements disponibles
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
                {filteredApartments.length} lot{filteredApartments.length > 1 ? 's' : ''}
              </motion.p>
            </div>

            {/* Availability Summary Banner */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              {(() => {
                const allApts = project.apartments ?? [];
                const availableCount = allApts.filter((a: any) => a.status === 'AVAILABLE').length;
                const reservedCount = allApts.filter((a: any) => a.status === 'RESERVED').length;
                const comingSoonCount = allApts.filter((a: any) => a.status === 'COMING_SOON').length;
                return (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/10 text-forest font-medium">
                      <span className="w-2 h-2 rounded-full bg-forest" />
                      {availableCount} disponible{availableCount > 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 text-gold font-medium">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      {reservedCount} réservé{reservedCount > 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {comingSoonCount} à venir
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground font-medium">{allApts.length} au total</span>
                  </>
                );
              })()}
            </motion.div>

            {/* Type filter tabs with animated indicator */}
            <motion.div variants={fadeUp} className="relative flex flex-wrap gap-2 mb-6">
              {[{ key: '', label: 'Tous' }, ...apartmentTypes.map((type: string) => ({ key: type, label: type }))].map((tab) => {
                const isActive = typeFilter === tab.key;
                const count = tab.key === ''
                  ? availableApartments.length
                  : availableApartments.filter((a: any) => a.apartmentType === tab.key).length;
                return (
                  <button
                    key={tab.key || '__all__'}
                    onClick={() => setTypeFilter(tab.key)}
                    className={`relative px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-forest text-white scale-105 shadow-sm'
                        : 'bg-white border border-border text-foreground hover:border-forest/30 hover:text-forest'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute inset-0 bg-forest rounded-md"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    <span className={`relative z-10 ml-1 text-xs ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>

          {filteredApartments.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardStagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredApartments.map((apt: any) => (
                <motion.div
                  key={apt.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <ApartmentCard apartment={apt} projectSlug={projectSlug} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={Building2}
              title="Aucun appartement disponible"
              description="Aucun appartement ne correspond à votre filtre actuel. Essayez de changer le type d'appartement."
              size="sm"
            />
          )}
        </div>
      </section>

      {/* Amenities */}
      {project.amenities && project.amenities.length > 0 && (
        <section className="py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              className="text-2xl font-bold text-foreground mb-6"
            >
              Équipements & Services
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {project.amenities.map((amenity: any) => {
                const IconComp = amenity.icon ? AMENITY_ICONS[amenity.icon] || CheckCircle2 : CheckCircle2;
                return (
                  <motion.div
                    key={amenity.id}
                    variants={fadeUp}
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-forest/30 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                      <IconComp className="h-5 w-5 text-forest" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{amenity.name}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Neighborhood Info */}
      <NeighborhoodInfo city={project.city} district={project.district} />

      {/* FAQ Section with structured data */}
      <FAQSection project={project} />

      {/* Location */}
      <section className="py-10 px-4 bg-ivory">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-2xl font-bold text-foreground mb-6"
          >
            Localisation
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-forest" />
                <span className="font-medium">{project.district}, {project.city}</span>
              </div>
              {project.address && (
                <p className="text-muted-foreground ml-7">{project.address}</p>
              )}
            </div>
            {/* Interactive Map */}
            <ProjectMap
              projects={
                project.latitude && project.longitude
                  ? [
                      {
                        slug: project.slug,
                        name: project.name,
                        status: project.status,
                        district: project.district,
                        city: project.city,
                        latitude: project.latitude,
                        longitude: project.longitude,
                      },
                    ]
                  : []
              }
              singleProject
            />
          </div>
        </div>
      </section>

      {/* Mortgage Calculator (Collapsible) */}
      {!project.priceOnRequest && project.startingPrice && (
        <section className="py-10 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-forest text-forest hover:bg-forest/5 gap-2 mb-4"
                    size="lg"
                  >
                    <Calculator className="h-5 w-5" />
                    Simuler un crédit
                    <ChevronDown className="h-4 w-4 ml-1 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      Simulez votre crédit immobilier
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Estimez vos mensualités pour ce projet à partir de {formatPrice(project.startingPrice)}
                    </p>
                    <div className="max-w-2xl">
                      <MortgageCalculator defaultPrice={project.startingPrice} />
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          </div>
        </section>
      )}

      {/* Final Conversion — Clean, sales-focused CTA */}
      <section className="py-16 px-4 bg-forest relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Intéressé par ce projet ?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Contactez notre équipe pour recevoir les informations ou planifier une visite.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
            <a
              href={getWhatsAppUrl(whatsAppMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="h-5 w-5" />
              Contacter via WhatsApp
            </a>
            <a
              href={getPhoneUrl()}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-white text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="h-5 w-5" />
              Appeler {ASAS.phone}
            </a>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-left max-w-lg mx-auto">
            <LeadForm
              projectId={project.id}
              projectName={project.name}
              showWhatsApp={false}
              showPhone={false}
              compact
            />
          </div>
        </div>
      </section>

      {/* Mobile Sticky Conversion Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background/95 backdrop-blur-md border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppUrl(whatsAppMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
          <Button
            onClick={() => {
              const el = document.getElementById('apartments');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="flex-1 h-10 bg-forest hover:bg-forest-dark text-white"
          >
            Voir les lots
          </Button>
          <a
            href={getPhoneUrl()}
            className="flex items-center justify-center size-10 rounded-md bg-primary text-primary-foreground"
          >
            <Phone className="size-4" />
          </a>
        </div>
      </div>
      {/* Spacer for mobile sticky bar */}
      <div className="h-16 sm:hidden" />

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title={project.name}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        description={`${project.name} — ${project.district}, ${project.city}`}
      />
    </main>
  );
}

function ProjectDetailSkeleton() {
  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero skeleton with shimmer */}
      <div className="h-[60vh] min-h-[400px] shimmer-premium rounded-none" />
      {/* Facts skeleton */}
      <div className="bg-white border-b border-border py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="text-center p-4 rounded-xl shimmer-premium">
              <div className="h-6 w-6 rounded-full bg-sand mx-auto mb-2 shimmer" />
              <div className="h-3 w-12 bg-sand mx-auto mb-1 shimmer" />
              <div className="h-4 w-16 bg-sand mx-auto shimmer" />
            </div>
          ))}
        </div>
      </div>
      {/* Story skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-3">
        <div className="h-7 w-48 shimmer-premium rounded-lg" />
        <div className="h-4 w-full shimmer-premium rounded-lg" />
        <div className="h-4 w-5/6 shimmer-premium rounded-lg" />
        <div className="h-4 w-2/3 shimmer-premium rounded-lg" />
      </div>
      {/* Apartments section skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-end justify-between mb-4">
          <div className="h-7 w-56 shimmer-premium rounded-lg" />
          <div className="h-4 w-20 shimmer-premium rounded-lg" />
        </div>
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 shimmer-premium rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <ApartmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
