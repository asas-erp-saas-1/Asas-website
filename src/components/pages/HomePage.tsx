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
  Search,
  Users,
  Landmark,
} from 'lucide-react';
import type { Project } from '@/lib/types';

/**
 * Homepage information architecture:
 * 1. Intent-first hero
 * 2. Live inventory proof
 * 3. Curated projects
 * 4. Buyer journey
 * 5. Trust
 * 6. Developer pathway
 * 7. Low-friction contact
 *
 * No marketing metrics or property facts are fabricated here; inventory values
 * are derived exclusively from the API response.
 */
export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects();
  const featuredProjects = projects?.filter((p: Project) => p.featured) ?? [];

  const inventory = useMemo(() => {
    if (!projects?.length) {
      return { totalApartments: 0, availableCount: 0, districts: [] as string[], minPrice: 0 };
    }

    let totalApartments = 0;
    let availableCount = 0;
    let minPrice = Infinity;
    const districtSet = new Set<string>();

    for (const project of projects) {
      districtSet.add(project.district);
      const apartments = project.apartments ?? [];
      totalApartments += apartments.length;

      for (const apartment of apartments) {
        if (apartment.status === 'AVAILABLE' || apartment.status === 'COMING_SOON') availableCount++;
        if (apartment.price && apartment.price > 0) minPrice = Math.min(minPrice, apartment.price);
      }

      if (project.startingPrice && project.startingPrice > 0) {
        minPrice = Math.min(minPrice, project.startingPrice);
      }
    }

    return {
      totalApartments,
      availableCount,
      districts: Array.from(districtSet),
      minPrice: minPrice === Infinity ? 0 : minPrice,
    };
  }, [projects]);

  const displayProjects = featuredProjects.length > 0
    ? featuredProjects.slice(0, 3)
    : projects?.slice(0, 3) ?? [];

  return (
    <main>
      {/* HERO — intent before inventory */}
      <section className="relative isolate min-h-[min(760px,88vh)] overflow-hidden bg-charcoal">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="/images/brand/hero.jpg"
            alt=""
            className="h-full w-full object-cover object-center opacity-45"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,24,21,.94)_0%,rgba(20,24,21,.72)_48%,rgba(20,24,21,.42)_100%)]" />
          <div className="absolute inset-0 hero-dot-grid opacity-30" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(760px,88vh)] w-full max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              {ASAS.fullName}
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              Trouvez le bon projet immobilier,
              <span className="block text-sand">avec une information claire.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
              Explorez les programmes commercialisés par ASAS, comparez les disponibilités et les caractéristiques, puis choisissez la prochaine étape qui vous convient.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-lg bg-forest px-6 text-white shadow-xl shadow-black/20 hover:bg-forest-dark"
                onClick={() => router.goProjects()}
              >
                <Search className="mr-2 h-4 w-4" />
                Explorer les projets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a
                href={getWhatsAppUrl('Bonjour, je souhaite être accompagné(e) pour trouver un projet immobilier.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/8 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/14"
              >
                <MessageCircle className="h-4 w-4 text-green-400" />
                Être accompagné
              </a>
            </div>

            {/* Audience routing — avoids forcing every visitor through the same funnel */}
            <div className="mt-12 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
              <button onClick={() => router.goProjects()} className="group rounded-xl border border-white/10 bg-black/15 p-4 text-left backdrop-blur-md transition hover:border-white/20 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <Home className="mb-3 h-4 w-4 text-sand" />
                <span className="block text-sm font-semibold text-white">Acheter</span>
                <span className="mt-1 block text-xs leading-5 text-white/50">Voir les projets et disponibilités</span>
              </button>
              <button onClick={() => router.goProjects()} className="group rounded-xl border border-white/10 bg-black/15 p-4 text-left backdrop-blur-md transition hover:border-white/20 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <Landmark className="mb-3 h-4 w-4 text-sand" />
                <span className="block text-sm font-semibold text-white">Investir</span>
                <span className="mt-1 block text-xs leading-5 text-white/50">Comparer les programmes disponibles</span>
              </button>
              <button onClick={() => router.goForDevelopers()} className="group rounded-xl border border-white/10 bg-black/15 p-4 text-left backdrop-blur-md transition hover:border-white/20 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <Users className="mb-3 h-4 w-4 text-sand" />
                <span className="block text-sm font-semibold text-white">Promouvoir</span>
                <span className="mt-1 block text-xs leading-5 text-white/50">Parler à ASAS de votre programme</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE INVENTORY — only API-derived facts */}
      <section aria-label="Inventaire actuel" className="border-b border-white/10 bg-forest">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
          <div className="px-5 py-6 text-center sm:py-8">
            <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{isLoading ? '—' : inventory.availableCount}</p>
            <p className="mt-1 text-xs text-white/55 sm:text-sm">Disponibilités</p>
          </div>
          <div className="px-5 py-6 text-center sm:py-8">
            <p className="text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '—' : inventory.minPrice > 0 ? 'À partir de' : '—'}</p>
            <p className="mt-1 text-xs text-white/55 sm:text-sm">{isLoading ? '' : inventory.minPrice > 0 ? formatPrice(inventory.minPrice) : 'Prix sur demande'}</p>
          </div>
          <div className="px-5 py-6 text-center sm:py-8">
            <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{isLoading ? '—' : projects?.length ?? 0}</p>
            <p className="mt-1 text-xs text-white/55 sm:text-sm">Programmes</p>
          </div>
          <div className="px-5 py-6 text-center sm:py-8">
            <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{isLoading ? '—' : inventory.districts.length}</p>
            <p className="mt-1 text-xs text-white/55 sm:text-sm">Zones représentées</p>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="bg-background px-5 py-16 sm:px-8 md:py-24" aria-labelledby="projects-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-forest">Sélection actuelle</p>
              <h2 id="projects-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Programmes immobiliers</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Accédez aux informations disponibles sur chaque programme et explorez les unités selon vos critères.</p>
            </div>
            <button onClick={() => router.goProjects()} className="hidden items-center gap-1.5 pb-1 text-sm font-semibold text-forest transition hover:text-forest-dark sm:inline-flex">
              Tous les projets <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? <><ProjectCardSkeleton /><ProjectCardSkeleton /><ProjectCardSkeleton /></> : displayProjects.map((project: Project) => <ProjectCard key={project.id} project={project} />)}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => router.goProjects()} className="border-forest text-forest hover:bg-forest hover:text-white">
              Voir tous les projets <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* BUYER JOURNEY */}
      <section className="border-y border-border bg-ivory px-5 py-16 sm:px-8 md:py-24" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-forest">Parcours</p>
            <h2 id="journey-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Du premier regard à la visite</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Chaque étape doit répondre à une question concrète, sans multiplier les obstacles.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { num: '01', icon: Search, title: 'Explorer', desc: 'Filtrez les programmes selon vos critères.' },
              { num: '02', icon: Sparkles, title: 'Comparer', desc: 'Examinez prix, surfaces, types et disponibilités.' },
              { num: '03', icon: Building2, title: 'Approfondir', desc: 'Consultez la fiche du programme et ses unités.' },
              { num: '04', icon: MessageCircle, title: 'Échanger', desc: 'Demandez une information ou une visite.' },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.18em] text-forest/45">{step.num}</span>
                  <step.icon className="h-5 w-5 text-forest" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PremiumTrustSection />

      {/* DEVELOPERS */}
      <section className="relative overflow-hidden bg-charcoal px-5 py-16 sm:px-8 md:py-20" aria-labelledby="developer-heading">
        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-forest/60 via-gold/40 to-forest/10" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr] md:items-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">Pour les promoteurs</p>
              <h2 id="developer-heading" className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">Votre programme mérite un parcours commercial aussi structuré que son produit.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/58">Découvrez comment ASAS présente les programmes, organise l’acquisition et facilite le passage de l’intérêt à la prise de contact.</p>
            </div>
            <div className="md:text-right">
              <Button size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-white hover:bg-white/10" onClick={() => router.goForDevelopers()}>
                Découvrir l’offre promoteur <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CONTACT */}
      <section className="bg-background px-5 py-16 sm:px-8 md:py-24" aria-labelledby="contact-heading">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest">Prochaine étape</p>
          <h2 id="contact-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Une question sur un projet ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">Choisissez le canal qui vous convient pour demander une information, organiser une visite ou être orienté vers le bon programme.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 bg-forest px-6 text-white hover:bg-forest-dark" onClick={() => router.goProjects()}>
              Voir les projets <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a href={getWhatsAppUrl('Bonjour, je souhaite obtenir des informations sur les projets ASAS.')} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 text-sm font-semibold text-white transition hover:bg-green-700">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={`tel:${ASAS.phoneRaw}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:bg-muted">
              <Phone className="h-4 w-4" /> {ASAS.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
