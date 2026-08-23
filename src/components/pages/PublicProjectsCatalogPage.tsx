'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ArrowUpDown, MapPin, Building2, Home, Filter, Trash2, Ruler, Car, Waves, ArrowUpNarrowWide, ArrowDownWideNarrow, Calendar, Map, Maximize2, FolderSearch, ArrowRight, LayoutGrid, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { usePublicProjectCards, useApartmentSearch } from '@/lib/api';
import type { PublicApartmentCard, PublicProjectCard } from '@/lib/catalog-contracts';
import type { ApartmentFilterValues } from '@/components/shared/ApartmentSearchFilters';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { ApartmentSearchFilters, DEFAULT_APARTMENT_FILTERS } from '@/components/shared/ApartmentSearchFilters';
import ProjectFilters, { DEFAULT_FILTERS, type ProjectFilters as ProjectFiltersType } from '@/components/shared/ProjectFilters';
import { AISearch } from '@/components/shared/AISearch';
import { ProjectMap } from '@/components/shared/ProjectMap';
import { RecentlyViewedSection } from '@/components/shared/RecentlyViewedSection';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ScrollRevealSection } from '@/components/shared/ScrollRevealSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from '@/lib/router';

type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'surface-asc';
const SORT_OPTIONS: Record<SortOption, { label: string; icon: React.ElementType }> = {
  'price-asc': { label: 'Prix croissant', icon: ArrowUpNarrowWide },
  'price-desc': { label: 'Prix décroissant', icon: ArrowDownWideNarrow },
  newest: { label: 'Plus récent', icon: Calendar },
  'surface-asc': { label: 'Surface croissante', icon: Ruler },
};

function parseApartmentTypes(value: string): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
  } catch { /* legacy comma-separated value */ }
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function matchesFilters(project: PublicProjectCard, filters: ProjectFiltersType): boolean {
  if (filters.city && project.city !== filters.city) return false;
  if (filters.projectType && project.projectType !== filters.projectType) return false;
  if (filters.apartmentType && !parseApartmentTypes(project.apartmentTypes).includes(filters.apartmentType)) return false;
  if (filters.status && project.status !== filters.status) return false;
  if (filters.hasParking === true && !project.hasParking) return false;
  if (filters.hasPool === true && !project.hasPool) return false;
  if (project.startingPrice && !project.priceOnRequest && (project.startingPrice > filters.priceRange[1] || project.startingPrice < filters.priceRange[0])) return false;
  const minSurface = project.minSurface ?? 0;
  const maxSurface = project.maxSurface ?? minSurface;
  if (minSurface > filters.surfaceRange[1] || maxSurface < filters.surfaceRange[0]) return false;
  return true;
}

function sortProjects(projects: PublicProjectCard[], sort: SortOption): PublicProjectCard[] {
  return [...projects].sort((a, b) => {
    if (sort === 'price-asc') return (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity);
    if (sort === 'price-desc') return (b.startingPrice ?? 0) - (a.startingPrice ?? 0);
    if (sort === 'newest') return (b.deliveryYear ?? 0) - (a.deliveryYear ?? 0);
    return (a.minSurface ?? 0) - (b.minSurface ?? 0);
  });
}

export default function PublicProjectsCatalogPage() {
  const router = useRouter();
  const { data: projects, isLoading, isError, refetch } = usePublicProjectCards();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<ProjectFiltersType>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apartmentFilters, setApartmentFilters] = useState<ApartmentFilterValues>(DEFAULT_APARTMENT_FILTERS);

  const apartmentSearchParams = useMemo(() => {
    const p: Record<string, string | number | undefined> = {};
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
  const { data: apartmentResults, isLoading: apartmentsLoading } = useApartmentSearch(apartmentSearchParams);
  const hasApartmentFilters = Object.values(apartmentFilters).some((v) => v !== '' && v !== undefined);

  const districts = useMemo(() => [...new Set((projects ?? []).map((p) => p.district).filter(Boolean))].sort(), [projects]);
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = (projects ?? []).filter((p) => {
      const textMatch = !q || [p.name, p.district, p.city].some((v) => v.toLowerCase().includes(q));
      return textMatch && (!selectedDistrict || p.district === selectedDistrict) && matchesFilters(p, advancedFilters);
    });
    return sortProjects(result, sortBy);
  }, [projects, searchQuery, selectedDistrict, advancedFilters, sortBy]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedDistrict('');
    setAdvancedFilters(DEFAULT_FILTERS);
  }, []);
  const hasActiveFilters = Boolean(searchQuery || selectedDistrict || advancedFilters.city || advancedFilters.projectType || advancedFilters.apartmentType || advancedFilters.status || advancedFilters.hasParking || advancedFilters.hasPool);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-background px-4 py-6"><div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-foreground md:text-3xl">Nos Projets</h1><p className="mt-0.5 text-sm text-muted-foreground">Découvrez les programmes immobiliers commercialisés par ASAS</p></div><div className="flex w-full items-center gap-2 sm:w-auto"><div className="relative flex-1 sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un projet, une ville..." className="h-10 pl-9 text-sm" />{searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Effacer la recherche"><X className="h-3.5 w-3.5" /></button>}</div><Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowAiSearch((v) => !v)} aria-label="Recherche par IA"><Sparkles className="h-4 w-4" /></Button></div></div></section>
      <AnimatePresence>{showAiSearch && <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-muted/30"><div className="mx-auto max-w-4xl px-4 py-6 text-center"><h2 className="mb-1 flex items-center justify-center gap-2 text-lg font-semibold"><Sparkles className="h-4 w-4 text-forest" />Recherche intelligente</h2><p className="mb-4 text-sm text-muted-foreground">Décrivez ce que vous cherchez en langage naturel</p><AISearch /></div></motion.section>}</AnimatePresence>
      <RecentlyViewedSection />
      <section className="border-b border-border bg-background px-4 py-6"><div className="mx-auto max-w-6xl"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Map className="h-5 w-5 text-forest" /><h2 className="text-lg font-bold">Carte des projets</h2></div><Button variant="outline" size="sm" onClick={() => document.querySelector('[data-map-container]')?.requestFullscreen?.()} className="gap-1.5"><Maximize2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Plein écran</span></Button></div>{isLoading ? <div className="h-64 animate-pulse rounded-xl border bg-muted md:h-96" /> : <ProjectMap projects={(projects ?? []).filter((p) => p.latitude != null && p.longitude != null).map((p) => ({ slug: p.slug, name: p.name, status: p.status, district: p.district, city: p.city, latitude: p.latitude!, longitude: p.longitude! }))} />}</div></section>
      <section className="border-b border-border bg-background px-4 py-3"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-center gap-2"><div className="flex min-w-0 flex-1 flex-wrap gap-1.5"><Button variant={selectedDistrict === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedDistrict('')} className={selectedDistrict === '' ? 'h-8 bg-forest text-xs text-white' : 'h-8 text-xs'}>Tous</Button>{districts.map((d) => <Button key={d} variant={selectedDistrict === d ? 'default' : 'outline'} size="sm" onClick={() => setSelectedDistrict(selectedDistrict === d ? '' : d)} className={selectedDistrict === d ? 'h-8 bg-forest text-xs text-white' : 'h-8 text-xs'}><MapPin className="mr-1 h-3 w-3" />{d}</Button>)}</div><Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowFilters((v) => !v)}><SlidersHorizontal className="h-3.5 w-3.5" />Filtres<ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} /></Button><Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}><SelectTrigger className="h-8 w-[160px] text-xs"><ArrowUpDown className="mr-1 h-3 w-3" /><SelectValue /></SelectTrigger><SelectContent>{Object.entries(SORT_OPTIONS).map(([key, { label, icon: Icon }]) => <SelectItem key={key} value={key}><span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{label}</span></SelectItem>)}</SelectContent></Select></div>{hasActiveFilters && <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-muted-foreground"><Filter className="mr-1 inline h-3 w-3" />Filtres actifs</span><button type="button" onClick={clearAllFilters} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" />Tout effacer</button></div>}</div></section>
      <AnimatePresence>{showFilters && <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-muted/30"><div className="mx-auto max-w-6xl px-4 py-4"><ProjectFilters onFilterChange={setAdvancedFilters} projects={projects ?? []} /></div></motion.section>}</AnimatePresence>
      <section className="px-4 py-8"><div className="mx-auto max-w-6xl">{isError ? <EmptyState icon={FolderSearch} title="Impossible de charger les projets" description="Une erreur temporaire est survenue lors du chargement du catalogue." actionLabel="Réessayer" onAction={() => { void refetch(); }} size="lg" /> : isLoading ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <ProjectCardSkeleton key={i} />)}</div> : filteredProjects.length ? <><p className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"><Building2 className="h-4 w-4 text-forest/60" /><span className="font-semibold text-forest">{filteredProjects.length}</span> projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}</p><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></> : <EmptyState icon={FolderSearch} title="Aucun projet trouvé" description="Essayez d'élargir vos critères de recherche ou de réinitialiser les filtres." actionLabel="Réinitialiser les filtres" onAction={clearAllFilters} size="lg" />}</div></section>
      <ScrollRevealSection icon={LayoutGrid} title="Rechercher un appartement" subtitle="Filtrez par type, budget, surface et plus pour trouver votre futur chez-vous." className="bg-background px-4 py-10" accent><div className="mx-auto max-w-6xl"><div className="mb-6 rounded-xl border border-border bg-card p-5"><ApartmentSearchFilters filters={apartmentFilters} onFilterChange={setApartmentFilters} districts={districts.length ? districts : undefined} /></div>{hasApartmentFilters && (apartmentsLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted" />)}</div> : apartmentResults?.length ? <div><div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted-foreground"><Home className="mr-1 inline h-4 w-4 text-forest/60" /><span className="font-semibold text-forest">{apartmentResults.length}</span> appartement{apartmentResults.length > 1 ? 's' : ''} trouvé{apartmentResults.length > 1 ? 's' : ''}</p><Button variant="ghost" size="sm" onClick={() => setApartmentFilters(DEFAULT_APARTMENT_FILTERS)}><Trash2 className="mr-1 h-3.5 w-3.5" />Réinitialiser</Button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{apartmentResults.map((apt: PublicApartmentCard) => <div key={apt.id} className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-forest/30 hover:shadow-md" role="link" tabIndex={0} onClick={() => apt.project && router.goApartment(apt.project.slug, apt.slug)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && apt.project) { e.preventDefault(); router.goApartment(apt.project.slug, apt.slug); } }}><div className="mb-3 flex items-center justify-between gap-2"><span className="rounded-md bg-forest px-2.5 py-0.5 text-xs font-bold text-white">{apt.typeName}</span><StatusBadge status={apt.status} type="apartment" /></div><div className="mb-3 border-y border-border py-2 text-center"><span className="text-3xl font-bold text-forest">{apt.surface}</span><span className="ml-1 text-sm text-forest/60">m²</span></div><div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>{apt.bedrooms} chambres</span><span>{apt.bathrooms ?? 0} salles de bain</span><span>{apt.hasParking ? 'Parking disponible' : 'Sans parking'}</span><span>{apt.floor != null ? `Étage ${apt.floor}` : 'Étage —'}</span></div></div>)}</div></div> : null)}</div></ScrollRevealSection>
    </main>
  );
}
