'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { usePublicProjectCards } from '@/lib/api';
import { ASAS, getWhatsAppUrl } from '@/lib/constants';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { PremiumTrustSection } from '@/components/shared/PremiumTrustSection';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  ChevronRight,
  MessageCircle,
  Phone,
  Building2,
  Home,
  Search,
  Users,
  Landmark,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

/** Homepage consumes only the public catalog contract. */
export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading } = usePublicProjectCards();
  const featuredProjects = useMemo(
    () => projects?.filter((p: PublicProjectCard) => p.featured) ?? [],
    [projects]
  );
  const displayedProjects = featuredProjects.length > 0 ? featuredProjects : (projects ?? []);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['Projets commercialisés', projects?.length ?? 0, Building2],
    ['Appartements', projects?.reduce((sum, p) => sum + p.apartmentCount, 0) ?? 0, Home],
    ['Disponibilités', projects?.reduce((sum, p) => sum + p.availableApartmentCount, 0) ?? 0, Search],
    ['Accompagnement', 'Sur mesure', Users],
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-forest px-4 py-16 text-white sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.09),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Une sélection immobilière présentée avec clarté
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/65">{ASAS.name}</p>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Trouvez le bien qui correspond réellement à votre projet.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Explorez les projets actuellement commercialisés par ASAS, consultez les disponibilités et les informations utiles, puis échangez avec un conseiller lorsque vous êtes prêt à avancer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="w-full bg-white text-forest hover:bg-white/90 sm:w-auto"
                onClick={() => router.goProjects()}
              >
                Explorer les projets
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 sm:w-auto"
                onClick={() => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.'), '_blank')}
              >
                Parler à un conseiller
                <MessageCircle className="ml-2 size-4" />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
              {['Projets réels', 'Informations vérifiables', 'Accompagnement humain'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="size-4 text-white/80" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-4 py-8 sm:py-10" aria-label="Repères ASAS">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map(([label, value, Icon]) => (
            <div key={label} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
              <Icon className="mb-3 size-5 text-forest" aria-hidden="true" />
              <div className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">{value}</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Sélection ASAS</p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Des projets à découvrir, pas simplement des annonces à parcourir.
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                Commencez par les programmes actuellement disponibles. Chaque fiche vous permet de comprendre le projet avant de décider si vous souhaitez aller plus loin.
              </p>
            </div>
            <Button variant="outline" className="w-full shrink-0 sm:w-auto" onClick={() => router.goProjects()}>
              Voir tous les projets
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : displayedProjects.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {displayedProjects.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} />)}
              </div>
              {displayedProjects.length > 6 && (
                <div className="mt-8 text-center">
                  <Button variant="outline" onClick={() => router.goProjects()}>
                    Découvrir les autres projets
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Aucun projet publié pour le moment.
            </div>
          )}
        </div>
      </section>

      <PremiumTrustSection />

      <section className="px-4 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3">
            <div className="border-b border-border p-6 md:border-b-0 md:border-r sm:p-8">
              <span className="text-sm font-semibold text-forest">01</span>
              <h2 className="mt-3 text-xl font-bold text-foreground">Explorez</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Identifiez les projets qui correspondent à votre recherche et prenez le temps de comparer les informations disponibles.
              </p>
            </div>
            <div className="border-b border-border p-6 md:border-b-0 md:border-r sm:p-8">
              <span className="text-sm font-semibold text-forest">02</span>
              <h2 className="mt-3 text-xl font-bold text-foreground">Comprenez</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Consultez les disponibilités, plans, prix et éléments du projet avant de prendre contact.
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <span className="text-sm font-semibold text-forest">03</span>
              <h2 className="mt-3 text-xl font-bold text-foreground">Décidez</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Lorsque le projet vous intéresse, un conseiller ASAS peut vous accompagner vers la prochaine étape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl rounded-2xl bg-muted/40 p-7 sm:p-10 lg:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl">
              <Landmark className="mb-4 size-8 text-forest" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Conseil personnalisé</p>
              <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                Vous hésitez entre plusieurs options ? Parlons de votre projet.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Donnez-nous simplement votre besoin. Nous pouvons vous aider à orienter votre recherche, comparer les possibilités et organiser la prochaine étape.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:flex-col">
              <Button className="w-full sm:w-auto" onClick={() => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.'), '_blank')}>
                WhatsApp
                <MessageCircle className="ml-2 size-4" />
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.href = `tel:${ASAS.phone}`}>
                Appeler un conseiller
                <Phone className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
