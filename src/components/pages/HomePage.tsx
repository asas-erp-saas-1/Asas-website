'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { useProjects } from '@/lib/api';
import { ASAS, formatPrice, getWhatsAppUrl } from '@/lib/constants';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { PremiumTrustSection } from '@/components/shared/PremiumTrustSection';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  MessageCircle,
  Phone,
  Building2,
  Home,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Project } from '@/lib/types';

/* ────────────────────────────────────────────────────────────
   HomePage — Luxury Real Estate
   Conversion funnel: Hero → Inventory → Projects → Trust → CTA
   ──────────────────────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects();

  const featuredProjects = projects?.filter((p: Project) => p.featured) ?? [];

  /* ── Derived inventory data ── */
  const inventory = useMemo(() => {
    if (!projects || projects.length === 0) {
      return { totalApartments: 0, availableCount: 0, districts: [] as string[], minPrice: 0 };
    }
    let totalApartments = 0;
    let availableCount = 0;
    let minPrice = Infinity;
    const districtSet = new Set<string>();

    for (const p of projects) {
      districtSet.add(p.district);
      const apts = p.apartments ?? [];
      totalApartments += apts.length;
      for (const a of apts) {
        if (a.status === 'AVAILABLE' || a.status === 'COMING_SOON') {
          availableCount++;
        }
        if (a.price && a.price > 0 && a.price < minPrice) {
          minPrice = a.price;
        }
      }
      // Also check project startingPrice
      if (p.startingPrice && p.startingPrice > 0 && p.startingPrice < minPrice) {
        minPrice = p.startingPrice;
      }
    }

    return {
      totalApartments,
      availableCount,
      districts: Array.from(districtSet),
      minPrice: minPrice === Infinity ? 0 : minPrice,
    };
  }, [projects]);

  /* Projects to show in featured section */
  const displayProjects = featuredProjects.length > 0
    ? featuredProjects.slice(0, 3)
    : projects?.slice(0, 3) ?? [];

  return (
    <main>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-charcoal">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/brand/hero.jpg"
            alt="Immobilier neuf à Alger"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-charcoal/70" />
        </div>

        {/* Subtle side accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-forest via-gold to-forest/30" aria-hidden />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              {ASAS.fullName}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6">
              L&rsquo;immobilier neuf
              <br />
              <span className="text-sand">à Alger</span>, commercialisé
              <br />
              avec excellence
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-lg">
              Découvrez nos programmes immobiliers neufs dans les meilleurs quartiers d&rsquo;Alger. Appartements disponibles, prix clairs, livraison garantie.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-forest hover:bg-forest-dark text-white text-base px-8 py-6 h-auto rounded-lg font-semibold shadow-lg shadow-forest/20"
                onClick={() => router.goProjects()}
              >
                Voir les appartements
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>

              <a
                href={getWhatsAppUrl('Bonjour, je cherche un appartement neuf à Alger. Pouvez-vous m\'aider ?')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-6 h-auto text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-green-400" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ QUICK INVENTORY ═══════════════ */}
      <section className="bg-forest py-0">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {/* Available apartments */}
            <div className="py-6 md:py-8 px-4 md:px-6 text-center">
              <p className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                {isLoading ? '—' : inventory.availableCount}
              </p>
              <p className="text-sm text-white/60 mt-1">Appartements disponibles</p>
            </div>

            {/* Starting price */}
            <div className="py-6 md:py-8 px-4 md:px-6 text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">
                {isLoading ? '—' : inventory.minPrice > 0 ? `À partir de` : '—'}
              </p>
              <p className="text-sm text-white/60 mt-1">
                {isLoading ? '' : inventory.minPrice > 0 ? formatPrice(inventory.minPrice) : 'Prix sur demande'}
              </p>
            </div>

            {/* Projects */}
            <div className="py-6 md:py-8 px-4 md:px-6 text-center">
              <p className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                {isLoading ? '—' : projects?.length ?? 0}
              </p>
              <p className="text-sm text-white/60 mt-1">Projets en commercialisation</p>
            </div>

            {/* Districts */}
            <div className="py-6 md:py-8 px-4 md:px-6 text-center">
              <p className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                {isLoading ? '—' : inventory.districts.length}
              </p>
              <p className="text-sm text-white/60 mt-1">Quartiers d&rsquo;Alger</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED PROJECTS ═══════════════ */}
      <section className="py-16 md:py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-forest mb-2">Nos programmes</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Projets en commercialisation
              </h2>
            </div>
            <button
              onClick={() => router.goProjects()}
              className="hidden sm:inline-flex items-center gap-1.5 text-forest hover:text-forest-dark font-semibold text-sm transition-colors group"
            >
              Voir tous les projets
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Project cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </>
            ) : (
              displayProjects.map((project: Project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => router.goProjects()} className="border-forest text-forest hover:bg-forest hover:text-white">
              Voir tous les projets
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-16 md:py-24 px-6 bg-ivory">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-forest mb-2">Simple & transparent</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', icon: Home, title: 'Découvrir', desc: 'Parcourez nos projets neufs et trouvez votre futur appartement.' },
              { num: '02', icon: Sparkles, title: 'Comparer', desc: 'Comparez surfaces, prix et disponibilités pour faire le meilleur choix.' },
              { num: '03', icon: Building2, title: 'Visiter', desc: 'Planifiez une visite sur site avec notre équipe.' },
              { num: '04', icon: MessageCircle, title: 'Réserver', desc: 'Réservez votre appartement et concrétisez votre projet.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-forest/10 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-forest" />
                </div>
                <span className="text-xs font-bold text-forest/40 tracking-widest">{step.num}</span>
                <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST / WHY ASAS ═══════════════ */}
      <PremiumTrustSection />

      {/* ═══════════════ FOR DEVELOPERS ═══════════════ */}
      <section className="py-16 md:py-20 px-6 bg-charcoal relative overflow-hidden">
        {/* Subtle accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-forest/50 via-gold/30 to-forest/10" aria-hidden />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Vous êtes promoteur immobilier ?
          </h2>
          <p className="text-lg text-sand/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            ASAS vous offre un système de commercialisation complet pour vendre vos projets plus vite : marketing digital, génération de leads, équipe de vente dédiée.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-5 h-auto rounded-lg"
            onClick={() => router.goForDevelopers()}
          >
            Parler de votre projet
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-16 md:py-24 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Prêt à trouver votre appartement ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Contactez-nous pour recevoir les informations, planifier une visite, ou réserver votre futur logement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Browse projects */}
            <Button
              size="lg"
              className="bg-forest hover:bg-forest-dark text-white text-base px-8 py-6 h-auto rounded-lg font-semibold"
              onClick={() => router.goProjects()}
            >
              Voir les appartements
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>

            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl('Bonjour, je suis intéressé(e) par un appartement neuf. Pouvez-vous m\'aider ?')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base px-8 py-6 h-auto font-semibold transition-colors shadow-lg shadow-green-600/20"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>

            {/* Phone */}
            <a
              href={`tel:${ASAS.phoneRaw}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-base px-8 py-6 h-auto font-semibold transition-colors"
            >
              <Phone className="h-5 w-5" />
              {ASAS.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
