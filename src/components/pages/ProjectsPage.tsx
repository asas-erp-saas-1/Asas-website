'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects, useApartmentSearch } from '@/lib/api';
import { ProjectCard, ProjectCardSkeleton } from '@/components/shared/ProjectCard';
import { AISearch } from '@/components/shared/AISearch';
import ProjectFilters, { ProjectFilters as ProjectFiltersType, DEFAULT_FILTERS } from '@/components/shared/ProjectFilters';
import { ApartmentSearchFilters, DEFAULT_APARTMENT_FILTERS } from '@/components/shared/ApartmentSearchFilters';
import type { ApartmentFilterValues } from '@/components/shared/ApartmentSearchFilters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectMap } from '@/components/shared/ProjectMap';
import { RecentlyViewedSection } from '@/components/shared/RecentlyViewedSection';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  MapPin,
  Building2,
  Home,
  Filter,
  Trash2,
  Banknote,
  Ruler,
  Car,
  Waves,
  Activity,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Calendar,
  Map,
  Maximize2,
  FolderSearch,
  ArrowRight,
  LayoutGrid,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollRevealSection } from '@/components/shared/ScrollRevealSection';
import { useRouter } from '@/lib/router';
import { formatPrice } from '@/lib/constants';
import type { Project, Apartment } from '@/lib/types';

type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'surface-asc';

const SORT_OPTIONS: Record<SortOption, { label: string; icon: React.ElementType }> = {
  'price-asc': { label: 'Prix croissant', icon: ArrowUpNarrowWide },
  'price-desc': { label: 'Prix décroissant', icon: ArrowDownWideNarrow },
  'newest': { label: 'Plus récent', icon: Calendar },
  'surface-asc': { label: 'Surface croissante', icon: Ruler },
};

function applyFilters(projects: Project[], filters: ProjectFiltersType): Project[] {
  return projects.filter((p) => {
    if (filters.city && p.city !== filters.city) return false;
    if (filters.projectType && p.projectType !== filters.projectType) return false;
    if (filters.apartmentType) {
      let aptTypes: string[] = [];
      try {
        aptTypes = p.apartmentTypes ? JSON.parse(p.apartmentTypes) : [...new Set(p.apartments?.map((a) => a.apartmentType) ?? [])];
      } catch {
        aptTypes = [...new Set(p.apartments?.map((a) => a.apartmentType) ?? [])];
      }
      if (!aptTypes.includes(filters.apartmentType)) return false;
    }
    if (filters.status && p.status !== filters.status) return false;
    const projectMinPrice = p.startingPrice && !p.priceOnRequest ? p.startingPrice : 0;
    const projectMaxPrice = Math.max(projectMinPrice, ...(p.apartments?.map((a) => a.price ?? 0) ?? [0]));
    if (projectMaxPrice > 0 && (projectMinPrice > filters.priceRange[1] || projectMaxPrice < filters.priceRange[0])) return false;
    const projectMinSurface = p.minSurface ?? Math.min(...(p.apartments?.map((a) => a.surface) ?? [0]));
    const projectMaxSurface = p.maxSurface ?? Math.max(...(p.apartments?.map((a) => a.surface) ?? [0]));
    if (projectMinSurface > filters.surfaceRange[1] || projectMaxSurface < filters.surfaceRange[0]) return false;
    if (filters.hasParking === true && !p.hasParking) return false;
    if (filters.hasPool === true && !p.hasPool) return false;
    return true;
  });
}

function sortProjects(projects: Project[], sort: SortOption): Project[] {
  const sorted = [...projects];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity));
      break;
    case 'price-desc':
      sorted.sort((a, b) => (b.startingPrice ?? 0) - (a.startingPrice ?? 0));
      break;
    case 'newest':
      sorted.sort((a, b) => (b.deliveryYear ?? 0) - (a.deliveryYear ?? 0));
      break;
    case 'surface-asc':
      sorted.sort((a, b) => (a.minSurface ?? 0) - (b.minSurface ?? 0));
      break;
  }
  return sorted;
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [advancedFilters, setAdvancedFilters] = useState<ProjectFiltersType>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Apartment-level search filters
  const [apartmentFilters, setApartmentFilters] = useState<ApartmentFilterValues>(DEFAULT_APARTMENT_FILTERS);

  const apartmentSearchParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {};
    if (apartmentFilters.type) params.type = apartmentFilters.type;
    if (apartmentFilters.minPrice) params.minPrice = Number(apartmentFilters.minPrice);
    if (apartmentFilters.maxPrice) params.maxPrice = Number(apartmentFilters.maxPrice);
    if (apartmentFilters.minSurface) params.minSurface = Number(apartmentFilters.minSurface);
    if (apartmentFilters.maxSurface) params.maxSurface = Number(apartmentFilters.maxSurface);
    if (apartmentFilters.bedrooms) params.bedrooms = Number(apartmentFilters.bedrooms);
    if (apartmentFilters.status) params.status = apartmentFilters.status;
    if (apartmentFilters.district) params.district = apartmentFilters.district;
    return params;
  }, [apartmentFilters]);

  const { data: apartmentResults, isLoading: apartmentsLoading } = useApartmentSearch(apartmentSearchParams);

  const hasApartmentFilters = useMemo(() => {
    return Object.values(apartmentFilters).some((v) => v !== '' && v !== undefined);
  }, [apartmentFilters]);

  const districts = projects
    ? (Array.from(new Set(projects.map((p) => p.district as string))) as string[]).sort()
    : [];

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = projects.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict = !selectedDistrict || p.district === selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
    result = applyFilters(result, advancedFilters);
    result = sortProjects(result, sortBy);
    return result;
  }, [projects, searchQuery, selectedDistrict, advancedFilters, sortBy]);

  const handleFilterChange = useCallback((filters: ProjectFiltersType) => {
    setAdvancedFilters(filters);
  }, []);

  const hasActiveFilters = searchQuery || selectedDistrict || advancedFilters.city || advancedFilters.apartmentType || advancedFilters.status || advancedFilters.hasParking || advancedFilters.hasPool;

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedDistrict('');
    setAdvancedFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* ═══════════ Compact Header ═══════════ */}
      <section className="bg-background border-b border-border py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title area */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Nos Projets
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Découvrez les programmes immobiliers commercialisés par ASAS
              </p>
            </div>

            {/* Search + AI button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un projet, une ville..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setShowAiSearch(!showAiSearch)}
                aria-label="Recherche par IA"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ AI Search (optional, expandable) ═══════════ */}
      <AnimatePresence>
        {showAiSearch && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b border-border bg-muted/30"
          >
            <div className="max-w-4xl mx-auto py-6 px-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-forest" />
                  Recherche intelligente
                </h2>
                <p className="text-sm text-muted-foreground">
                  Décrivez ce que vous cherchez en langage naturel
                </p>
              </div>
              <AISearch />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══════════ Recently Viewed ═══════════ */}
      <RecentlyViewedSection />

      {/* ═══════════ Map Section ═══════════ */}
      <section className="bg-background border-b border-border py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-forest" />
              <h2 className="text-lg font-bold text-foreground">
                Carte des projets
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-forest hover:border-forest/40"
              onClick={() => {
                const mapEl = document.querySelector('[data-map-container]');
                if (mapEl && mapEl.requestFullscreen) {
                  mapEl.requestFullscreen();
                }
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Plein écran</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="w-full h-64 md:h-96 bg-muted animate-pulse" />
            </div>
          ) : projects && projects.length > 0 ? (
            <ProjectMap
              projects={projects
                .filter((p): p is Project & { latitude: number; longitude: number } => !!p.latitude && !!p.longitude)
                .map((p) => ({
                  slug: p.slug,
                  name: p.name,
                  status: p.status,
                  district: p.district,
                  city: p.city,
                  latitude: p.latitude,
                  longitude: p.longitude,
                }))}
            />
          ) : null}
        </div>
      </section>

      {/* ═══════════ Unified Filters Bar ═══════════ */}
      <section className="bg-background border-b border-border py-3 px-4">
        <div className="max-w-6xl mx-auto">
          {/* District pills + filter toggle + sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* District filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
              <Button
                variant={selectedDistrict === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDistrict('')}
                className={selectedDistrict === '' ? 'bg-forest hover:bg-forest-dark text-white h-8 text-xs' : 'h-8 text-xs'}
              >
                Tous
              </Button>
              {districts.map((district) => (
                <Button
                  key={district}
                  variant={selectedDistrict === district ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDistrict(selectedDistrict === district ? '' : district)}
                  className={selectedDistrict === district ? 'bg-forest hover:bg-forest-dark text-white h-8 text-xs' : 'h-8 text-xs'}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {district}
                </Button>
              ))}
            </div>

            {/* Filter toggle (collapsible on mobile) */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtres</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Sort */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_OPTIONS).map(([key, { label, icon: SortIcon }]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <SortIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filtres :
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <Search className="h-3 w-3" />
                  « {searchQuery} »
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-forest-dark" aria-label="Supprimer le filtre de recherche">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedDistrict && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <MapPin className="h-3 w-3" />
                  {selectedDistrict}
                  <button type="button" onClick={() => setSelectedDistrict('')} className="hover:text-forest-dark" aria-label="Supprimer le filtre district">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {advancedFilters.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <MapPin className="h-3 w-3" />
                  {advancedFilters.city}
                  <button type="button" onClick={() => setAdvancedFilters(f => ({ ...f, city: '' }))} className="hover:text-forest-dark" aria-label="Supprimer le filtre ville">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {advancedFilters.apartmentType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <Home className="h-3 w-3" />
                  {advancedFilters.apartmentType}
                  <button type="button" onClick={() => setAdvancedFilters(f => ({ ...f, apartmentType: '' }))} className="hover:text-forest-dark" aria-label="Supprimer le filtre type">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {advancedFilters.status && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <Activity className="h-3 w-3" />
                  {advancedFilters.status}
                  <button type="button" onClick={() => setAdvancedFilters(f => ({ ...f, status: '' }))} className="hover:text-forest-dark" aria-label="Supprimer le filtre statut">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {advancedFilters.hasParking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <Car className="h-3 w-3" />
                  Parking
                  <button type="button" onClick={() => setAdvancedFilters(f => ({ ...f, hasParking: false }))} className="hover:text-forest-dark" aria-label="Supprimer le filtre parking">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {advancedFilters.hasPool && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                  <Waves className="h-3 w-3" />
                  Piscine
                  <button type="button" onClick={() => setAdvancedFilters(f => ({ ...f, hasPool: false }))} className="hover:text-forest-dark" aria-label="Supprimer le filtre piscine">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ Expandable Advanced Filters ═══════════ */}
      <AnimatePresence>
        {showFilters && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-border bg-muted/30"
          >
            <div className="max-w-6xl mx-auto py-4 px-4">
              <ProjectFilters
                onFilterChange={handleFilterChange}
                projects={projects ?? []}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══════════ Projects Grid ═══════════ */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <>
              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-forest/60" />
                <span className="font-semibold text-forest">{filteredProjects.length}</span>
                {' '}projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
              </p>

              {/* Grid - single column on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={FolderSearch}
              title="Aucun projet trouvé"
              description="Essayez d'élargir vos critères de recherche ou de réinitialiser les filtres pour voir tous nos projets disponibles."
              actionLabel="Réinitialiser les filtres"
              onAction={clearAllFilters}
              secondaryActionLabel="Voir la carte"
              onSecondaryAction={() => {
                const mapSection = document.querySelector('[data-map-container]');
                if (mapSection) {
                  mapSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              size="lg"
            />
          )}
        </div>
      </section>

      {/* ═══════════ Apartment Search Section ═══════════ */}
      <ScrollRevealSection
        icon={LayoutGrid}
        title="Rechercher un appartement"
        subtitle="Filtrez par type, budget, surface et plus pour trouver votre futur chez-vous."
        className="py-10 px-4 bg-background"
        accent
      >
        <div className="max-w-6xl mx-auto">
          {/* Apartment filter bar */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <ApartmentSearchFilters
              filters={apartmentFilters}
              onFilterChange={setApartmentFilters}
              districts={districts.length > 0 ? districts : undefined}
            />
          </div>

          {/* Apartment results */}
          {hasApartmentFilters && (
            <div>
              {apartmentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
                      <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                      <div className="h-9 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : apartmentResults && apartmentResults.length > 0 ? (
                <div>
                  {/* Result count */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Home className="h-4 w-4 text-forest/60" />
                      <span className="font-semibold text-forest">{apartmentResults.length}</span>
                      {' '}appartement{apartmentResults.length > 1 ? 's' : ''} trouvé{apartmentResults.length > 1 ? 's' : ''}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setApartmentFilters(DEFAULT_APARTMENT_FILTERS)}
                      className="text-muted-foreground gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Réinitialiser
                    </Button>
                  </div>

                  {/* Results grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apartmentResults.map((apt: Apartment) => (
                      <div
                        key={apt.id}
                        className="group rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-forest/30 transition-all cursor-pointer"
                        onClick={() => {
                          if (apt.project) {
                            router.goApartment(apt.project.slug, apt.slug);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && apt.project) {
                            e.preventDefault();
                            router.goApartment(apt.project.slug, apt.slug);
                          }
                        }}
                      >
                        {/* Header: Type + Status */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center rounded-md bg-forest px-2.5 py-0.5 text-xs font-bold text-white">
                            {apt.typeName}
                          </span>
                          <StatusBadge status={apt.status} type="apartment" />
                        </div>

                        {/* Surface */}
                        <div className="text-center py-2 border-y border-border mb-3">
                          <span className="text-3xl font-bold text-forest">{apt.surface}</span>
                          <span className="text-sm font-medium text-forest/60 ml-1">m²</span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center justify-between">
                            <span>Chambres</span>
                            <span className="font-medium text-foreground">{apt.bedrooms}</span>
                          </div>
                          {apt.price && !apt.priceOnRequest && (
                            <div className="flex items-center justify-between">
                              <span>Prix</span>
                              <span className="font-semibold text-forest">{formatPrice(apt.price)}</span>
                            </div>
                          )}
                          {apt.priceOnRequest && (
                            <div className="flex items-center justify-between">
                              <span>Prix</span>
                              <span className="font-semibold text-forest">Sur demande</span>
                            </div>
                          )}
                        </div>

                        {/* Project name */}
                        {apt.project && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{apt.project.name}</span>
                            {apt.project.district && (
                              <>
                                <span className="text-muted-foreground/50">·</span>
                                <span>{apt.project.district}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-forest hover:bg-forest-dark text-white group-hover:bg-forest-dark group-hover:shadow-md transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (apt.project) {
                              router.goApartment(apt.project.slug, apt.slug);
                            }
                          }}
                        >
                          Voir la fiche
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Home}
                  title="Aucun appartement trouvé"
                  description="Essayez d'élargir vos critères de recherche pour découvrir plus d'appartements disponibles."
                  actionLabel="Réinitialiser les filtres"
                  onAction={() => setApartmentFilters(DEFAULT_APARTMENT_FILTERS)}
                  size="lg"
                />
              )}
            </div>
          )}

          {/* Prompt when no filters active */}
          {!hasApartmentFilters && (
            <div className="text-center py-10">
              <Search className="h-10 w-10 text-forest/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Utilisez les filtres ci-dessus pour rechercher des appartements par type, budget, surface, etc.
              </p>
            </div>
          )}
        </div>
      </ScrollRevealSection>
    </main>
  );
}
