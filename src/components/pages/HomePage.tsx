'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { usePublicProjectCards } from '@/lib/api';
import { ASAS, formatPrice, getWhatsAppUrl } from '@/lib/constants';
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
  MapPin,
  CalendarDays,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

/** Homepage consumes only the public catalog contract. */
export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading, isError, refetch } = usePublicProjectCards();
  const featuredProjects = useMemo(
    () => projects?.filter((p: PublicProjectCard) => p.featured) ?? [],
    [projects]
  );
  const displayedProjects = featuredProjects.length > 0 ? featuredProjects : (projects ?? []);
  const leadProject = displayedProjects[0];
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['Projets commercialisés', isLoading ? '—' : (projects?.length ?? 0), Building2],
    ['Appartements', isLoading ? '—' : (projects?.reduce((sum, p) => sum + p.apartmentCount, 0) ?? 0), Home],
    ['Disponibilités', isLoading ? '—' : (projects?.reduce((sum, p) => sum + p.availableApartmentCount, 0) ?? 0), Search],
    ['Accompagnement', 'Sur mesure', Users],
  ];

  const openWhatsApp = (message: string) => {
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="min-h-screen bg-background">
      {/* HERO — one promise, one dominant route, immediate real-estate proof */}
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.11),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Une sélection immobilière présentée avec clarté
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">{ASAS.name}</p>
            <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.8rem] lg:leading-[1.05]">
              Trouvez le bien qui correspond réellement à votre projet.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Explorez les programmes actuellement commercialisés par ASAS, comparez les disponibilités et les informations utiles, puis avancez avec un conseiller lorsque le bon projet se présente.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="w-full bg-white text-forest shadow-lg hover:bg-white/90 sm:w-auto"
                onClick={() => router.goProjects()}
              >
                Explorer les projets
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <button
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                onClick={() => openWhatsApp('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.')}
              >
                Parler à un conseiller
                <MessageCircle className="size-4" />
              </button>
            </div>

            <div className="mt-7 grid gap-2 text-sm text-white/70 sm:grid-cols-3 sm:gap-4">
              {['Projets réels', 'Informations vérifiables', 'Accompagnement humain'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-white/80" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {leadProject?.image?.url ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={leadProject.image.url}
                  alt={leadProject.image.alt || leadProject.name}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-20 sm:p-6 sm:pt-24">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">À découvrir</p>
                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{leadProject.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden="true" />{leadProject.district}, {leadProject.city}</span>
                  {leadProject.deliveryYear && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />Livraison {leadProject.deliveryQuarter ? `Q${leadProject.deliveryQuarter} ` : ''}{leadProject.deliveryYear}</span>}
                </div>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    {leadProject.startingPrice && !leadProject.priceOnRequest ? (
                      <p className="text-lg font-bold text-gold">À partir de {formatPrice(leadProject.startingPrice)}</p>
                    ) : (
                      <p className="text-sm font-semibold text-white/85">Prix sur demande</p>
                    )}
                    {leadProject.availableApartmentCount > 0 && (
                      <p className="mt-0.5 text-xs text-white/60">{leadProject.availableApartmentCount} disponibilité{leadProject.availableApartmentCount > 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-white/90"
                    onClick={() => router.goProject(leadProject.slug)}
                  >
                    Découvrir
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block" aria-hidden="true" />
          )}
        </div>
      </section>

      {/* PROOF — real catalogue signals, no invented social proof */}
      <section className="border-b border-border bg-background px-4 py-7 sm:py-9" aria-label="Repères ASAS">
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

      {/* OFFER */}
      <section className="px-4 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Sélection ASAS</p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Commencez par les projets qui méritent votre attention.
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                Consultez les programmes actuellement commercialisés, leurs disponibilités et leurs informations essentielles. Passez ensuite à la fiche détaillée lorsque l'un d'eux correspond à votre recherche.
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
          ) : isError ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10" role="alert">
              <p className="text-base font-semibold text-foreground">Les projets ne peuvent pas être chargés pour le moment.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Réessayez maintenant ou explorez la page projets directement.</p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => void refetch()}>
                  <RefreshCw className="mr-2 size-4" />
                  Réessayer
                </Button>
                <Button onClick={() => router.goProjects()}>
                  Ouvrir les projets
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
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

      {/* DECISION PATH — reduce cognitive load before the contact step */}
      <section className="px-4 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Une démarche simple</p>
            <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Avancez avec une méthode simple.
            </h2>
          </div>
          <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3">
            <div className="border-b border-border p-6 md:border-b-0 md:border-r sm:p-8">
              <span className="text-sm font-semibold text-forest">01</span>
              <h3 className="mt-3 text-xl font-bold text-foreground">Explorez</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Trouvez les programmes qui correspondent à votre zone, votre budget et votre recherche.</p>
            </div>
            <div className="border-b border-border p-6 md:border-b-0 md:border-r sm:p-8">
              <span className="text-sm font-semibold text-forest">02</span>
              <h3 className="mt-3 text-xl font-bold text-foreground">Vérifiez</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Consultez disponibilités, plans, surfaces, prix et caractéristiques réellement publiées.</p>
            </div>
            <div className="p-6 sm:p-8">
              <span className="text-sm font-semibold text-forest">03</span>
              <h3 className="mt-3 text-xl font-bold text-foreground">Avancez</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Lorsque le projet vous intéresse, échangez avec un conseiller pour organiser la prochaine étape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION — one dominant action + low-friction alternatives */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-forest text-white">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div className="max-w-2xl">
              <Landmark className="mb-4 size-8 text-gold" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">Conseil personnalisé</p>
              <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                Vous avez identifié un projet intéressant ? Passons à l'étape suivante.
              </h2>
              <p className="mt-3 text-base leading-7 text-white/75">
                Indiquez simplement ce que vous recherchez. Un conseiller ASAS peut vous aider à vérifier les possibilités disponibles et à organiser la suite.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
              <Button
                size="lg"
                className="w-full bg-white text-forest hover:bg-white/90 sm:w-auto"
                onClick={() => router.goContact()}
              >
                Parler à un conseiller
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10"
                  onClick={() => openWhatsApp('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.')}
                >
                  <MessageCircle className="mr-2 size-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10"
                  onClick={() => window.location.href = `tel:${ASAS.phone}`}
                >
                  <Phone className="mr-2 size-4" />
                  Appeler
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}