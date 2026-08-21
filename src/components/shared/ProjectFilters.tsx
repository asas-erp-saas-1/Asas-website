'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, ChevronDown, Car, Waves } from 'lucide-react';
import type { Project } from '@/lib/types';
import type { PublicProjectCard } from '@/lib/catalog-contracts';
import { formatPrice } from '@/lib/constants';

type CatalogProject = Project | PublicProjectCard;

export interface ProjectFilters {
  city: string | null;
  projectType: string | null;
  apartmentType: string | null;
  status: string | null;
  priceRange: [number, number];
  surfaceRange: [number, number];
  hasParking: boolean | null;
  hasPool: boolean | null;
}

export const DEFAULT_FILTERS: ProjectFilters = { city: null, projectType: null, apartmentType: null, status: null, priceRange: [0, 100_000_000], surfaceRange: [0, 500], hasParking: null, hasPool: null };
interface ProjectFiltersProps { onFilterChange: (filters: ProjectFilters) => void; projects: CatalogProject[]; }
const CITIES = ['Chéraga', 'Bordj El Bahri', 'Dar El Beïda', 'Hussein Dey'] as const;
const PROJECT_TYPES: Record<string, string> = { RESIDENTIAL: 'Résidentiel', MIXED_USE: 'Mixte', COMMERCIAL: 'Commercial' };
const APARTMENT_TYPES: Record<string, string> = { F2: 'F2', F3: 'F3', F4: 'F4', Duplex: 'Duplex' };
const STATUSES: Record<string, string> = { AVAILABLE: 'En commercialisation', COMING_SOON: 'Bientôt disponible', SOLD_OUT: 'Épuisé' };

function countActiveFilters(filters: ProjectFilters, defaults: ProjectFilters) { let count = 0; if (filters.city !== defaults.city) count++; if (filters.projectType !== defaults.projectType) count++; if (filters.apartmentType !== defaults.apartmentType) count++; if (filters.status !== defaults.status) count++; if (filters.priceRange[0] !== defaults.priceRange[0] || filters.priceRange[1] !== defaults.priceRange[1]) count++; if (filters.surfaceRange[0] !== defaults.surfaceRange[0] || filters.surfaceRange[1] !== defaults.surfaceRange[1]) count++; if (filters.hasParking !== defaults.hasParking) count++; if (filters.hasPool !== defaults.hasPool) count++; return count; }
function parseApartmentTypes(value: string): string[] { if (!value) return []; try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string'); } catch { /* legacy comma-separated value */ } return value.split(',').map((v) => v.trim()).filter(Boolean); }

export function projectCardMatchesFilters(project: CatalogProject, filters: ProjectFilters): boolean {
  if (filters.city && project.city !== filters.city) return false;
  if (filters.projectType && project.projectType !== filters.projectType) return false;
  if (filters.apartmentType && !parseApartmentTypes(project.apartmentTypes).includes(filters.apartmentType)) return false;
  if (filters.status && project.status !== filters.status) return false;
  if (filters.hasParking === true && !project.hasParking) return false;
  if (filters.hasPool === true && !project.hasPool) return false;
  const projectPrice = project.startingPrice ?? 0;
  if (projectPrice > 0 && (projectPrice > filters.priceRange[1] || projectPrice < filters.priceRange[0])) return false;
  const minSurface = project.minSurface ?? 0;
  const maxSurface = project.maxSurface ?? minSurface;
  if (minSurface > filters.surfaceRange[1] || maxSurface < filters.surfaceRange[0]) return false;
  return true;
}

export function ProjectFiltersPanel({ filters, defaults, onFilterChange, projects }: { filters: ProjectFilters; defaults: ProjectFilters; onFilterChange: (filters: ProjectFilters) => void; projects: CatalogProject[] }) {
  const { priceMin, priceMax, surfaceMin, surfaceMax } = useMemo(() => {
    if (projects.length === 0) return { priceMin: 0, priceMax: 100_000_000, surfaceMin: 0, surfaceMax: 500 };
    let pMin = Infinity, pMax = 0, sMin = Infinity, sMax = 0;
    for (const project of projects) {
      if (project.startingPrice && !project.priceOnRequest) { pMin = Math.min(pMin, project.startingPrice); pMax = Math.max(pMax, project.startingPrice); }
      if (project.minSurface !== undefined) sMin = Math.min(sMin, project.minSurface);
      if (project.maxSurface !== undefined) sMax = Math.max(sMax, project.maxSurface);
    }
    return { priceMin: pMin === Infinity ? 0 : pMin, priceMax: pMax === 0 ? 100_000_000 : pMax, surfaceMin: sMin === Infinity ? 0 : sMin, surfaceMax: sMax === 0 ? 500 : sMax };
  }, [projects]);
  const update = useCallback((partial: Partial<ProjectFilters>) => onFilterChange({ ...filters, ...partial }), [filters, onFilterChange]);
  return <div className="space-y-5">
    <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ville</p><div className="flex flex-wrap gap-2">{CITIES.map((city) => <Button key={city} variant={filters.city === city ? 'default' : 'outline'} size="sm" onClick={() => update({ city: filters.city === city ? null : city })} className={filters.city === city ? 'bg-forest text-white hover:bg-forest-dark' : 'hover:border-forest/50'}>{city}</Button>)}</div></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div><p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type de projet</p><Select value={filters.projectType ?? '__all__'} onValueChange={(v) => update({ projectType: v === '__all__' ? null : v })}><SelectTrigger className="w-full"><SelectValue placeholder="Tous" /></SelectTrigger><SelectContent><SelectItem value="__all__">Tous</SelectItem>{Object.entries(PROJECT_TYPES).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div><div><p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type d&apos;appartement</p><Select value={filters.apartmentType ?? '__all__'} onValueChange={(v) => update({ apartmentType: v === '__all__' ? null : v })}><SelectTrigger className="w-full"><SelectValue placeholder="Tous" /></SelectTrigger><SelectContent><SelectItem value="__all__">Tous</SelectItem>{Object.entries(APARTMENT_TYPES).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div><div><p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Statut</p><Select value={filters.status ?? '__all__'} onValueChange={(v) => update({ status: v === '__all__' ? null : v })}><SelectTrigger className="w-full"><SelectValue placeholder="Tous" /></SelectTrigger><SelectContent><SelectItem value="__all__">Tous</SelectItem>{Object.entries(STATUSES).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div></div>
    <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Prix : {formatPrice(filters.priceRange[0])} — {formatPrice(filters.priceRange[1])}</p><Slider min={priceMin} max={priceMax} step={1_000_000} value={filters.priceRange} onValueChange={(v) => update({ priceRange: v as [number, number] })} className="mt-2" /></div>
    <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Surface : {filters.surfaceRange[0]} m² — {filters.surfaceRange[1]} m²</p><Slider min={surfaceMin} max={surfaceMax} step={5} value={filters.surfaceRange} onValueChange={(v) => update({ surfaceRange: v as [number, number] })} className="mt-2" /></div>
    <div className="flex flex-wrap gap-6"><label className="flex cursor-pointer items-center gap-2"><Checkbox checked={filters.hasParking === true} onCheckedChange={(checked) => update({ hasParking: checked === true ? true : null })} /><Car className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Parking</span></label><label className="flex cursor-pointer items-center gap-2"><Checkbox checked={filters.hasPool === true} onCheckedChange={(checked) => update({ hasPool: checked === true ? true : null })} /><Waves className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Piscine</span></label></div>
    <Button variant="ghost" size="sm" onClick={() => onFilterChange(defaults)} className="text-muted-foreground"><X className="h-4 w-4" />Réinitialiser</Button>
  </div>;
}

export default function ProjectFilters({ onFilterChange, projects }: ProjectFiltersProps) {
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS); const [expanded, setExpanded] = useState(false); const [mobileOpen, setMobileOpen] = useState(false); const activeCount = countActiveFilters(filters, DEFAULT_FILTERS);
  const handleFilterChange = useCallback((newFilters: ProjectFilters) => { setFilters(newFilters); onFilterChange(newFilters); }, [onFilterChange]);
  const filterPanel = <ProjectFiltersPanel filters={filters} defaults={DEFAULT_FILTERS} onFilterChange={handleFilterChange} projects={projects} />;
  return <><div className="hidden md:block"><div className="mb-3 flex items-center justify-between"><Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)} className="gap-2"><Filter className="h-4 w-4" />Filtres{activeCount > 0 && <Badge className="ml-1 flex h-5 min-w-5 items-center justify-center bg-forest text-[10px] text-white">{activeCount}</Badge>}<motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="h-4 w-4" /></motion.span></Button></div><AnimatePresence>{expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden"><div className="mb-4 rounded-xl border border-border bg-white p-5">{filterPanel}</div></motion.div>}</AnimatePresence></div><div className="md:hidden"><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" />Filtres{activeCount > 0 && <Badge className="ml-1 flex h-5 min-w-5 items-center justify-center bg-forest text-[10px] text-white">{activeCount}</Badge>}</Button></SheetTrigger><SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto"><SheetHeader><SheetTitle>Filtres avancés</SheetTitle></SheetHeader><div className="px-4 pb-6">{filterPanel}</div></SheetContent></Sheet></div></>;
}
