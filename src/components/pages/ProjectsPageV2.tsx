'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Building2, Calendar, CheckCircle2, ChevronDown, Filter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { usePublicProjectCards, useApartmentSearch } from '@/lib/api';
import { useRouter } from '@/lib/router';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import ProjectFilters, { DEFAULT_FILTERS, projectCardMatchesFilters, type ProjectFilters as ProjectFiltersType } from '@/components/shared/ProjectFilters';
import { ApartmentSearchFilters, DEFAULT_APARTMENT_FILTERS, type ApartmentFilterValues } from '@/components/shared/ApartmentSearchFilters';
import { RecentlyViewedSection } from '@/components/shared/RecentlyViewedSection';
import { ProjectMap } from '@/components/shared/ProjectMap';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/constants';
import type { PublicApartmentCard, PublicProjectCard } from '@/lib/catalog-contracts';

type SortOption = 'featured' | 'price-asc' | 'surface-asc' | 'delivery';

function sortProjects(projects: PublicProjectCard[], sort: SortOption) {
  const result = [...projects];
  if (sort === 'price-asc') result.sort((a, b) => (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity));
  if (sort === 'surface-asc') result.sort((a, b) => (a.minSurface ?? Infinity) - (b.minSurface ?? Infinity));
  if (sort === 'delivery') result.sort((a, b) => (a.deliveryYear ?? Infinity) - (b.deliveryYear ?? Infinity));
  return result;
}

export default function ProjectsPageV2() {
  const router = useRouter();
  const { data: projects, isLoading } = usePublicProjectCards();
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [filters, setFilters] = useState<ProjectFiltersType>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [apartmentFilters, setApartmentFilters] = useState<ApartmentFilterValues>(DEFAULT_APARTMENT_FILTERS);

  const districts = useMemo(() => projects ? Array.from(new Set(projects.map((p) => p.district).filter(Boolean))).sort() : [], [projects]);
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const q = query.trim().toLowerCase();
    return sortProjects(projects.filter((project) => {
      const matchesQuery = !q || [project.name, project.city, project.district].some((value) => value?.toLowerCase().includes(q));
      return matchesQuery && (!district || project.district === district) && projectCardMatchesFilters(project, filters);
    }), sort);
  }, [projects, query, district, filters, sort]);

  const apartmentParams = useMemo(() => {
    const p: Record<string, string | number> = {};
    if (apartmentFilters.type) p.type = apartmentFilters.type;
    if (apartmentFilters.minPrice) p.minPrice = Number(apartmentFilters.minPrice);
    if (apartmentFilters.maxPrice) p.maxPrice = Number(apartmentFilters.maxPrice);
    if (apartmentFilters.minSurface) p.minSurface = Number(apartmentFilters.minSurface);
    if (apartmentFilters.maxSurface) p.maxSurface = Number(apartmentFilters.maxSurface);
    if (apartmentFilters.bedrooms) p.bedrooms = Number(apartmentFilters.bedrooms);
    if (apartmentFilters.status) p.status = apartmentFilters.status;
    if (apartmentFilters.district) p.district = apartmentFilters.district;
    return p;
  }, [apartmentFilters]);
  const { data: apartments, isLoading: apartmentsLoading } = useApartmentSearch(apartmentParams);
  const hasApartmentFilters = Object.values(apartmentFilters).some(Boolean);
  const hasFilters = Boolean(query || district || filters.city || filters.projectType || filters.apartmentType || filters.status || filters.hasParking || filters.hasPool);

  const clearFilters = () => { setQuery(''); setDistrict(''); setFilters(DEFAULT_FILTERS); };

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#17232a]">
      <section className="relative overflow-hidden bg-[#17232a] text-white">
        <div className="mx-auto max-w-[1440px] px-5 pb-14 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9b16e]">ASAS Immobilier · Catalogue</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[.94] tracking-[-.045em] sm:text-6xl lg:text-[82px]">Des projets sélectionnés pour décider avec confiance.</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Explorez les programmes commercialisés par ASAS. Comparez les informations essentielles, consultez les disponibilités réelles et avancez vers le bien qui correspond à votre projet.</p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/65"><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#d9b16e]" />Projets réels</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#d9b16e]" />Informations vérifiables</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#d9b16e]" />Accompagnement humain</span></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-sm lg:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/45">Commencer une recherche</p>
              <label className="mt-3 block text-sm font-medium text-white/80" htmlFor="project-search">Ville, quartier ou projet</label>
              <div className="relative mt-2"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" /><Input id="project-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex. projet, quartier, ville…" className="h-12 border-white/10 bg-white/[.07] pl-11 text-white placeholder:text-white/30 focus-visible:ring-[#d9b16e]" /></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><Button type="button" onClick={() => setShowFilters(!showFilters)} variant="outline" className="h-11 border-white/15 bg-transparent text-white hover:bg-white/10"><SlidersHorizontal className="mr-2 size-4" />Filtres</Button><button type="button" onClick={() => document.getElementById('catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#d9b16e] px-4 text-sm font-semibold text-[#17232a]">Voir les projets<ArrowRight className="size-4" /></button></div>
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewedSection />

      <section id="catalog-results" className="scroll-mt-20 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-5 border-b border-[#e5e1d7] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6c806f]">La sélection ASAS</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Trouvez votre prochain projet.</h2><p className="mt-2 text-sm text-[#777a72]">{isLoading ? 'Chargement du catalogue…' : `${filteredProjects.length} projet${filteredProjects.length > 1 ? 's' : ''} correspondant à votre recherche.`}</p></div>
            <div className="flex flex-wrap items-center gap-2">
              {districts.slice(0, 5).map((item) => <button key={item} type="button" onClick={() => setDistrict(district === item ? '' : item)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${district === item ? 'border-[#183c31] bg-[#183c31] text-white' : 'border-[#dcd9cf] bg-white text-[#4e554f] hover:border-[#183c31]'}`}><MapPin className="size-3" />{item}</button>)}
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} aria-label="Trier les projets" className="h-9 rounded-md border border-[#dcd9cf] bg-white px-3 text-xs font-semibold text-[#4e554f] outline-none focus:ring-2 focus:ring-[#b9975b]"><option value="featured">Sélection ASAS</option><option value="price-asc">Prix croissant</option><option value="surface-asc">Surface croissante</option><option value="delivery">Livraison</option></select>
            </div>
          </div>

          {showFilters && <div className="mt-6 rounded-2xl border border-[#e5e1d7] bg-white p-5"><ProjectFilters onFilterChange={setFilters} projects={projects ?? []} /></div>}
          {hasFilters && <div className="mt-4 flex items-center gap-2"><span className="text-xs text-[#777a72]">Recherche active</span><button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-[#183c31]"><X className="size-3" />Tout effacer</button></div>}

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{isLoading ? Array.from({ length: 6 }, (_, i) => <ProjectCardSkeleton key={i} />) : filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
          {!isLoading && filteredProjects.length === 0 && <div className="mt-8 rounded-2xl border border-[#e5e1d7] bg-white px-6 py-14 text-center"><Building2 className="mx-auto size-8 text-[#6c806f]" /><h3 className="mt-4 text-xl font-semibold">Aucun projet ne correspond à ces critères.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777a72]">Élargissez votre recherche ou échangez directement avec un conseiller ASAS pour identifier les options pertinentes.</p><Button onClick={clearFilters} className="mt-6 bg-[#17232a] text-white">Réinitialiser</Button></div>}
        </div>
      </section>

      <section className="border-y border-[#e5e1d7] bg-white px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6c806f]">Recherche appartement</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Vous connaissez déjà vos critères ?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#777a72]">Filtrez directement les logements disponibles par type, budget, surface, nombre de chambres ou localisation.</p></div><div className="flex items-center gap-2 text-xs text-[#777a72]"><Calendar className="size-4 text-[#183c31]" />Les disponibilités affichées dépendent des données actuellement publiées.</div></div>
          <div className="mt-8 rounded-2xl border border-[#e5e1d7] bg-[#f8f7f2] p-5"><ApartmentSearchFilters filters={apartmentFilters} onFilterChange={setApartmentFilters} districts={districts.length ? districts : undefined} /></div>
          {hasApartmentFilters && <div className="mt-6">{apartmentsLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-[#eeeae1]" />)}</div> : apartments && apartments.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{apartments.map((apt: PublicApartmentCard) => <button key={apt.id} type="button" onClick={() => apt.project && router.goApartment(apt.project.slug, apt.slug)} className="group text-left rounded-xl border border-[#e5e1d7] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#183c31]/30 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold text-[#17232a]">{apt.typeName}</p><p className="mt-1 text-xs text-[#777a72]">{apt.surface} m² · {apt.bedrooms} chambre{apt.bedrooms > 1 ? 's' : ''}</p></div><StatusBadge status={apt.status} type="apartment" /></div><p className="mt-7 text-xl font-semibold text-[#183c31]">{apt.priceOnRequest || !apt.price ? 'Prix sur demande' : formatPrice(apt.price)}</p><div className="mt-4 flex items-center justify-between border-t border-[#eeeae1] pt-3 text-xs text-[#777a72]"><span className="inline-flex items-center gap-1"><MapPin className="size-3" />{apt.project?.district ?? 'Projet ASAS'}</span><ArrowRight className="size-4 text-[#b9975b] transition group-hover:translate-x-1" /></div></button>)}</div> : <p className="py-8 text-center text-sm text-[#777a72]">Aucun logement ne correspond à ces critères.</p>}</div>}
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><div className="mx-auto max-w-[1440px]"><div className="mb-6"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6c806f]">Implantation</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Situez les projets dans leur environnement.</h2></div>{projects && projects.length ? <ProjectMap projects={projects.filter((p) => p.latitude != null && p.longitude != null).map((p) => ({ slug: p.slug, name: p.name, status: p.status, district: p.district, city: p.city, latitude: p.latitude as number, longitude: p.longitude as number }))} /> : <div className="rounded-2xl border border-[#e5e1d7] bg-white p-12 text-center text-sm text-[#777a72]">La carte sera disponible lorsque les coordonnées des projets seront publiées.</div>}</div></section>

      <section className="bg-[#183c31] px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-20"><div className="mx-auto flex max-w-[1100px] flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/45">Besoin d'un regard humain ?</p><h2 className="mt-3 max-w-3xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Nous pouvons vous aider à réduire la recherche à quelques options pertinentes.</h2></div><Button onClick={() => router.goContact()} className="min-h-12 shrink-0 bg-[#d9b16e] px-6 font-semibold text-[#17232a] hover:bg-[#e4bd7c]">Parler à un conseiller<ArrowRight className="ml-2 size-4" /></Button></div></section>
    </main>
  );
}
