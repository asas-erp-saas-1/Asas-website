'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { usePublicProjectCards } from '@/lib/api';
import { ASAS, formatPrice, getWhatsAppUrl } from '@/lib/constants';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, Check, Home, Landmark, MapPin, MessageCircle, Phone, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import type { PublicProjectCard } from '@/lib/catalog-contracts';

export default function HomePage() {
  const router = useRouter();
  const { data: projects, isLoading, isError, refetch } = usePublicProjectCards();
  const featuredProjects = useMemo(() => projects?.filter((p: PublicProjectCard) => p.featured) ?? [], [projects]);
  const displayedProjects = featuredProjects.length > 0 ? featuredProjects : (projects ?? []);
  const heroProject = displayedProjects[0];
  const available = projects?.reduce((sum, p) => sum + p.availableApartmentCount, 0) ?? 0;
  const apartments = projects?.reduce((sum, p) => sum + p.apartmentCount, 0) ?? 0;
  const stats = [
    { label: 'Projets', value: isLoading ? '—' : String(projects?.length ?? 0), Icon: Landmark },
    { label: 'Appartements', value: isLoading ? '—' : String(apartments), Icon: Home },
    { label: 'Disponibilités', value: isLoading ? '—' : String(available), Icon: Search },
    { label: 'Accompagnement', value: 'Sur mesure', Icon: ShieldCheck },
  ];
  const openWhatsApp = () => window.open(getWhatsAppUrl('Bonjour ASAS, je souhaite être accompagné dans ma recherche immobilière.'), '_blank', 'noopener,noreferrer');

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#17232a]">
      <section className="relative min-h-[640px] overflow-hidden bg-[#17232a] text-white lg:min-h-[700px]">
        <div className="absolute inset-0">
          {heroProject?.image?.url ? <img src={heroProject.image.url} alt={heroProject.image.alt || heroProject.name} className="h-full w-full object-cover" fetchPriority="high" /> : <div className="h-full w-full bg-[#17232a]" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
        </div>
        <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-end px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:min-h-[700px] lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-semibold">ASAS Immobilier</span><span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] text-white/85">Sélection immobilière</span></div>
            <h1 className="max-w-4xl text-[45px] font-medium leading-[.96] tracking-[-.04em] sm:text-6xl lg:text-[78px]">L’immobilier de qualité, présenté avec clarté.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">Découvrez les projets commercialisés par ASAS, consultez les logements réellement disponibles et avancez vers la visite lorsque le bien correspond à votre recherche.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" onClick={() => router.goProjects()} className="min-h-12 bg-[#d9b16e] text-[#17232a] hover:bg-[#e4bd7c]">Explorer les projets <ArrowRight className="ml-2 size-4" /></Button><button type="button" onClick={openWhatsApp} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10">Parler à un conseiller <MessageCircle className="size-4" /></button></div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">{['Projets réels', 'Informations vérifiables', 'Accompagnement humain'].map((x) => <span key={x} className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#d9b16e]" />{x}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-5 sm:px-8 lg:px-10"><div className="mx-auto grid max-w-[1440px] grid-cols-2 overflow-hidden rounded-xl border border-[#e5e1d7] sm:grid-cols-4">{stats.map(({ label, value, Icon }) => <div key={label} className="min-h-[108px] border-b border-[#ebe8df] px-5 py-5 sm:border-b-0 sm:border-r last:border-r-0"><Icon className="size-5 text-[#17232a]" /><p className="mt-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[#85877f]">{label}</p><p className="mt-1 text-lg font-semibold text-[#17232a]">{value}</p></div>)}</div></section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#6c806f]">Sélection ASAS</p><h2 className="mt-2 font-semibold text-3xl tracking-[-.03em] sm:text-4xl">Des projets à découvrir.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#777a72]">Commencez par les programmes actuellement commercialisés et ouvrez leur fiche pour vérifier les disponibilités.</p></div><Button variant="outline" onClick={() => router.goProjects()} className="min-h-11 border-[#cfc7b8] bg-white">Voir tous les projets <ArrowRight className="ml-2 size-4" /></Button></div>{isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[0,1,2].map((i) => <ProjectCardSkeleton key={i} />)}</div> : isError ? <div className="rounded-xl border border-[#e5e1d7] bg-[#f8f7f2] p-8 text-center"><p className="font-semibold">Les projets ne peuvent pas être chargés pour le moment.</p><Button variant="outline" className="mt-5" onClick={() => void refetch()}><RefreshCw className="mr-2 size-4" />Réessayer</Button></div> : displayedProjects.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{displayedProjects.slice(0,6).map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="rounded-xl border border-dashed border-[#d9d4c9] p-10 text-center text-sm text-[#777a72]">Aucun projet publié pour le moment.</div>}</div></section>

      <section className="bg-[#f8f7f2] px-5 py-12 sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#6c806f]">Pourquoi ASAS</p><h2 className="mt-2 max-w-xl font-semibold text-3xl tracking-[-.03em] sm:text-4xl">Moins de bruit. Plus d’informations utiles à la décision.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-[#666a63] sm:text-base">Nous structurons la présentation des projets autour de ce qui permet réellement d’avancer : localisation, caractéristiques, plans, disponibilités et échange direct avec un conseiller.</p><div className="mt-8 grid gap-5 sm:grid-cols-3">{[['01','Explorez','Les projets commercialisés.'],['02','Vérifiez','Les informations du logement.'],['03','Avancez','Vers la visite et l’échange.']].map(([n,t,d]) => <div key={n} className="border-t border-[#d9d5ca] pt-4"><span className="text-xs font-semibold text-[#b9975b]">{n}</span><h3 className="mt-2 text-base font-semibold">{t}</h3><p className="mt-1 text-xs leading-5 text-[#777a72]">{d}</p></div>)}</div></div>{heroProject?.image?.url ? <div className="overflow-hidden rounded-xl"><img src={heroProject.image.url} alt={heroProject.name} className="aspect-[4/3] h-full w-full object-cover" loading="lazy" /></div> : <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-[#e5e1d7] bg-white text-sm text-[#777a72]">Visuels à venir</div>}</div></section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10"><div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-2xl bg-[#17232a] text-white lg:grid-cols-[1fr_1fr]"><div className="relative min-h-[360px]">{heroProject?.image?.url && <img src={heroProject.image.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" loading="lazy" />}<div className="absolute inset-0 bg-[#17232a]/65" /><div className="relative flex h-full flex-col justify-center p-7 sm:p-10"><p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#d9b16e]">Conseil immobilier</p><h2 className="mt-3 max-w-xl font-semibold text-3xl tracking-[-.03em]">Vous avez un projet immobilier ?</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/70">Parlez-nous de votre recherche. Nous vous aidons à identifier les informations utiles et la prochaine étape.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button onClick={() => router.goContact()} className="min-h-11 bg-[#d9b16e] text-[#17232a] hover:bg-[#e4bd7c]">Parler à un conseiller <ArrowRight className="ml-2 size-4" /></Button><button type="button" onClick={openWhatsApp} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 px-5 text-sm font-semibold">WhatsApp <MessageCircle className="size-4" /></button></div></div></div><div className="flex flex-col justify-center bg-white p-7 text-[#17232a] sm:p-10"><p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#6c806f]">Prochaine étape</p><h3 className="mt-3 text-2xl font-semibold">Une question précise ?</h3><p className="mt-3 text-sm leading-6 text-[#777a72]">Contactez directement ASAS pour vérifier un logement, demander un plan ou organiser une visite.</p><div className="mt-6 grid gap-3"><a href={getWhatsAppUrl('Bonjour ASAS, je souhaite obtenir des informations sur vos projets immobiliers.')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9d4c9] bg-[#f8f7f2] px-4 text-sm font-semibold">WhatsApp <MessageCircle className="size-4" /></a><a href={`tel:${ASAS.phone}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9d4c9] px-4 text-sm font-semibold">Appeler <Phone className="size-4" /></a></div></div></div></section>
    </main>
  );
}
