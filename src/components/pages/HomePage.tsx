'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { usePublicProjectCards } from '@/lib/api';
import { ASAS, getWhatsAppUrl } from '@/lib/constants';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { PremiumTrustSection } from '@/components/shared/PremiumTrustSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Phone, Landmark } from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

/** Homepage consumes only the public catalog contract. */
export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading } = usePublicProjectCards();
  const featuredProjects = useMemo(
    () => projects?.filter((p: PublicProjectCard) => p.featured) ?? [],
    [projects],
  );
  const displayedProjects = featuredProjects.length > 0 ? featuredProjects : (projects ?? []);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-white/10 bg-forest text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-16 lg:px-10 lg:py-32">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">{ASAS.name} · Immobilier</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-8xl">
              Un bien qui mérite d’être compris avant d’être choisi.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
              Explorez les projets immobiliers publiés par ASAS, consultez les informations disponibles et échangez directement avec notre équipe lorsque vous êtes prêt à avancer.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button className="bg-white text-forest hover:bg-white/90" onClick={() => router.goProjects()}>
                Explorer les projets <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:bg-white/10"
                onClick={() => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.'), '_blank')}
              >
                Parler à un conseiller <MessageCircle className="ml-2 size-4" />
              </Button>
            </div>
          </div>

          <div className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Le catalogue ASAS</p>
            <p className="mt-4 max-w-sm font-serif text-2xl leading-tight text-white/90 sm:text-3xl">
              Des projets présentés avec les informations réellement disponibles.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm text-white/60">
              <span className="h-px w-10 bg-white/30" aria-hidden="true" />
              <span>{isLoading ? 'Catalogue en cours de chargement' : `${projects?.length ?? 0} projet${(projects?.length ?? 0) > 1 ? 's' : ''} publié${(projects?.length ?? 0) > 1 ? 's' : ''}`}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Sélection ASAS</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.02em] text-foreground sm:text-5xl">
                Des projets à découvrir, puis à approfondir.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Commencez par les programmes mis en avant. Si aucun projet n’est distingué, le catalogue public est utilisé comme sélection.
              </p>
            </div>
            <Button variant="outline" className="w-fit" onClick={() => router.goProjects()}>
              Voir tout le catalogue <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          <div className="pt-10">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
              </div>
            ) : displayedProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedProjects.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} />)}
              </div>
            ) : (
              <div className="border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
                Aucun projet publié pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>

      <PremiumTrustSection />

      <section className="px-5 pb-20 pt-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl border border-border bg-background px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <Landmark className="mb-5 size-7 text-gold" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Prochaine étape</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
                Une question sur un projet ? Parlons-en.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Demandez une information, précisez votre recherche ou préparez une prochaine visite avec notre équipe.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button onClick={() => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné.'), '_blank')}>
                WhatsApp <MessageCircle className="ml-2 size-4" />
              </Button>
              <Button variant="outline" onClick={() => window.location.href = `tel:${ASAS.phone}`}>
                Appeler <Phone className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
