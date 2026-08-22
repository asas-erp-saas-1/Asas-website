'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { usePublicProjectCards } from '@/lib/api';
import { ASAS, getWhatsAppUrl } from '@/lib/constants';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { PremiumTrustSection } from '@/components/shared/PremiumTrustSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Phone, Building2, Home, Search, Users, Landmark, type LucideIcon } from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

/** Homepage consumes only the public catalog contract. */
export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading } = usePublicProjectCards();
  const featuredProjects = useMemo(() => projects?.filter((p: PublicProjectCard) => p.featured) ?? [], [projects]);
  const displayedProjects = featuredProjects.length > 0 ? featuredProjects : (projects ?? []);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['Projets', projects?.length ?? 0, Building2],
    ['Appartements', projects?.reduce((sum, p) => sum + p.apartmentCount, 0) ?? 0, Home],
    ['Disponibles', projects?.reduce((sum, p) => sum + p.availableApartmentCount, 0) ?? 0, Search],
    ['Accompagnement', 'Sur mesure', Users],
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-forest px-4 py-16 text-white sm:py-24"><div className="mx-auto max-w-6xl"><div className="max-w-3xl"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{ASAS.name}</p><h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Trouvez votre prochain chez-vous.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">Découvrez les projets immobiliers actuellement commercialisés par ASAS et trouvez l’appartement adapté à votre projet.</p><div className="mt-8 flex flex-wrap gap-3"><Button className="bg-white text-forest hover:bg-white/90" onClick={() => router.goProjects()}>Voir les projets <ArrowRight className="ml-2 size-4" /></Button><Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.'), '_blank')}>Parler à un conseiller <MessageCircle className="ml-2 size-4" /></Button></div></div></div></section>
      <section className="border-b border-border bg-background px-4 py-10"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">{stats.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-border bg-card p-4"><Icon className="mb-2 size-5 text-forest" /><div className="text-xl font-bold text-foreground">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>)}</div></section>
      <section className="px-4 py-14"><div className="mx-auto max-w-6xl"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-forest">Catalogue</p><h2 className="mt-1 text-3xl font-bold text-foreground">Nos projets</h2><p className="mt-2 text-muted-foreground">Une sélection de programmes immobiliers disponibles à la commercialisation.</p></div><Button variant="outline" onClick={() => router.goProjects()}>Tout voir <ArrowRight className="ml-2 size-4" /></Button></div>{isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}</div> : displayedProjects.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{displayedProjects.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Aucun projet publié pour le moment.</div>}</div></section>
      <PremiumTrustSection />
      <section className="px-4 pb-16"><div className="mx-auto max-w-6xl rounded-2xl bg-muted/40 p-8 sm:p-12"><div className="grid gap-8 md:grid-cols-2 md:items-center"><div><Landmark className="mb-4 size-8 text-forest" /><h2 className="text-2xl font-bold">Besoin d’un accompagnement personnalisé ?</h2><p className="mt-3 text-muted-foreground">Notre équipe vous aide à comparer les projets, comprendre les offres et avancer sereinement.</p></div><div className="flex flex-wrap gap-3 md:justify-end"><Button onClick={() => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné.'), '_blank')}>WhatsApp <MessageCircle className="ml-2 size-4" /></Button><Button variant="outline" onClick={() => window.location.href = `tel:${ASAS.phone}`}>Appeler <Phone className="ml-2 size-4" /></Button></div></div></div></section>
    </main>
  );
}
