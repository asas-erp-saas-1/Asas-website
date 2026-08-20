'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Filter,
  X,
  ChevronDown,
  Home,
  Banknote,
  Ruler,
  Bed,
  Activity,
  MapPin,
  Search,
  Trash2,
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';

/* ─── Types ─── */

export interface ApartmentFilterValues {
  type: string;
  minPrice: string;
  maxPrice: string;
  minSurface: string;
  maxSurface: string;
  bedrooms: string;
  status: string;
  district: string;
}

export const DEFAULT_APARTMENT_FILTERS: ApartmentFilterValues = {
  type: '',
  minPrice: '',
  maxPrice: '',
  minSurface: '',
  maxSurface: '',
  bedrooms: '',
  status: '',
  district: '',
};

/* ─── Constants ─── */

const APARTMENT_TYPES = [
  { value: 'F2', label: 'F2' },
  { value: 'F3', label: 'F3' },
  { value: 'F4', label: 'F4' },
  { value: 'Duplex', label: 'Duplex' },
] as const;

const STATUSES = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'COMING_SOON', label: 'Bientôt disponible' },
  { value: 'RESERVED', label: 'Réservé' },
  { value: 'SOLD', label: 'Vendu' },
] as const;

const BEDROOM_OPTIONS = [
  { value: '1', label: '1 chambre' },
  { value: '2', label: '2 chambres' },
  { value: '3', label: '3 chambres' },
  { value: '4', label: '4+ chambres' },
] as const;

const DISTRICTS = [
  'Chéraga',
  'Bordj El Bahri',
  'Dar El Beïda',
  'Hussein Dey',
  'Bab El Oued',
  'Kouba',
] as const;

/* ─── Helpers ─── */

function countActiveFilters(filters: ApartmentFilterValues): number {
  let count = 0;
  if (filters.type) count++;
  if (filters.minPrice) count++;
  if (filters.maxPrice) count++;
  if (filters.minSurface) count++;
  if (filters.maxSurface) count++;
  if (filters.bedrooms) count++;
  if (filters.status) count++;
  if (filters.district) count++;
  return count;
}

function getActiveFilterChips(
  filters: ApartmentFilterValues,
): { key: string; label: string; icon: React.ElementType }[] {
  const chips: { key: string; label: string; icon: React.ElementType }[] = [];

  if (filters.type) {
    chips.push({ key: 'type', label: filters.type, icon: Home });
  }
  if (filters.minPrice || filters.maxPrice) {
    const priceLabel = `${filters.minPrice ? formatPrice(Number(filters.minPrice)) : '…'} – ${filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : '…'}`;
    chips.push({ key: 'price', label: priceLabel, icon: Banknote });
  }
  if (filters.minSurface || filters.maxSurface) {
    const surfaceLabel = `${filters.minSurface || '0'} – ${filters.maxSurface || '…'} m²`;
    chips.push({ key: 'surface', label: surfaceLabel, icon: Ruler });
  }
  if (filters.bedrooms) {
    const brLabel = BEDROOM_OPTIONS.find((o) => o.value === filters.bedrooms)?.label ?? `${filters.bedrooms} ch.`;
    chips.push({ key: 'bedrooms', label: brLabel, icon: Bed });
  }
  if (filters.status) {
    const stLabel = STATUSES.find((o) => o.value === filters.status)?.label ?? filters.status;
    chips.push({ key: 'status', label: stLabel, icon: Activity });
  }
  if (filters.district) {
    chips.push({ key: 'district', label: filters.district, icon: MapPin });
  }

  return chips;
}

/* ─── Main Component ─── */

interface ApartmentSearchFiltersProps {
  filters: ApartmentFilterValues;
  onFilterChange: (filters: ApartmentFilterValues) => void;
  districts?: string[];
}

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 17 };

export function ApartmentSearchFilters({
  filters,
  onFilterChange,
  districts: externalDistricts,
}: ApartmentSearchFiltersProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const districtList = externalDistricts ?? DISTRICTS;
  const activeCount = countActiveFilters(filters);
  const activeChips = getActiveFilterChips(filters);

  const update = useCallback(
    (partial: Partial<ApartmentFilterValues>) => {
      onFilterChange({ ...filters, ...partial });
    },
    [filters, onFilterChange],
  );

  const removeChip = useCallback(
    (key: string) => {
      const partial: Partial<ApartmentFilterValues> = {};
      switch (key) {
        case 'type':
          partial.type = '';
          break;
        case 'price':
          partial.minPrice = '';
          partial.maxPrice = '';
          break;
        case 'surface':
          partial.minSurface = '';
          partial.maxSurface = '';
          break;
        case 'bedrooms':
          partial.bedrooms = '';
          break;
        case 'status':
          partial.status = '';
          break;
        case 'district':
          partial.district = '';
          break;
      }
      onFilterChange({ ...filters, ...partial });
    },
    [filters, onFilterChange],
  );

  const clearAll = useCallback(() => {
    onFilterChange(DEFAULT_APARTMENT_FILTERS);
  }, [onFilterChange]);

  /* ── Filter row builder ── */
  const filterRow = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Type select */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Home className="h-3 w-3" />
          Type
        </label>
        <Select
          value={filters.type || '__all__'}
          onValueChange={(v) => update({ type: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous les types</SelectItem>
            {APARTMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget: Min Price */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Banknote className="h-3 w-3" />
          Budget min
        </label>
        <Input
          type="number"
          placeholder="Prix min"
          value={filters.minPrice}
          onChange={(e) => update({ minPrice: e.target.value })}
          className="h-9"
        />
      </div>

      {/* Budget: Max Price */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Banknote className="h-3 w-3" />
          Budget max
        </label>
        <Input
          type="number"
          placeholder="Prix max"
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: e.target.value })}
          className="h-9"
        />
      </div>

      {/* Surface: Min */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Ruler className="h-3 w-3" />
          Surface min (m²)
        </label>
        <Input
          type="number"
          placeholder="Surface min"
          value={filters.minSurface}
          onChange={(e) => update({ minSurface: e.target.value })}
          className="h-9"
        />
      </div>

      {/* Surface: Max */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Ruler className="h-3 w-3" />
          Surface max (m²)
        </label>
        <Input
          type="number"
          placeholder="Surface max"
          value={filters.maxSurface}
          onChange={(e) => update({ maxSurface: e.target.value })}
          className="h-9"
        />
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Bed className="h-3 w-3" />
          Chambres
        </label>
        <Select
          value={filters.bedrooms || '__all__'}
          onValueChange={(v) => update({ bedrooms: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous</SelectItem>
            {BEDROOM_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Activity className="h-3 w-3" />
          Statut
        </label>
        <Select
          value={filters.status || '__all__'}
          onValueChange={(v) => update({ status: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          Quartier
        </label>
        <Select
          value={filters.district || '__all__'}
          onValueChange={(v) => update({ district: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous les quartiers</SelectItem>
            {districtList.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  /* ── Mobile: only show first 2 filters, then expand ── */
  const mobileCollapsedFilters = (
    <div className="grid grid-cols-1 gap-3">
      {/* Type - always visible on mobile */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
          <Home className="h-3 w-3" />
          Type
        </label>
        <Select
          value={filters.type || '__all__'}
          onValueChange={(v) => update({ type: v === '__all__' ? '' : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous les types</SelectItem>
            {APARTMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget range - always visible on mobile */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            <Banknote className="h-3 w-3" />
            Budget min
          </label>
          <Input
            type="number"
            placeholder="Prix min"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            <Banknote className="h-3 w-3" />
            Budget max
          </label>
          <Input
            type="number"
            placeholder="Prix max"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      {/* Surface range - always visible on mobile */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            <Ruler className="h-3 w-3" />
            Surface min
          </label>
          <Input
            type="number"
            placeholder="m²"
            value={filters.minSurface}
            onChange={(e) => update({ minSurface: e.target.value })}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            <Ruler className="h-3 w-3" />
            Surface max
          </label>
          <Input
            type="number"
            placeholder="m²"
            value={filters.maxSurface}
            onChange={(e) => update({ maxSurface: e.target.value })}
            className="h-9"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Active filter chips */}
      <AnimatePresence mode="popLayout">
        {activeChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 flex-wrap overflow-hidden"
          >
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtres actifs :
            </span>

            {activeChips.map((chip) => (
              <motion.span
                key={chip.key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={springTransition}
                className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest"
              >
                <chip.icon className="h-3 w-3" />
                {chip.label}
                <button
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="hover:text-forest-dark"
                  aria-label={`Supprimer le filtre ${chip.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}

            <motion.button
              key="clear-all"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={springTransition}
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Tout effacer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: full filter grid */}
      <div className="hidden md:block">
        {filterRow}
      </div>

      {/* Mobile: progressive disclosure */}
      <div className="md:hidden">
        {mobileExpanded ? filterRow : mobileCollapsedFilters}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="mt-3 w-full gap-1 text-forest"
        >
          <motion.span
            animate={{ rotate: mobileExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
          {mobileExpanded ? 'Moins de filtres' : 'Plus de filtres'}
          {!mobileExpanded && activeCount > 0 && (
            <Badge className="bg-forest text-white ml-1 h-5 min-w-5 flex items-center justify-center text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Clear all button (desktop only — mobile uses chip clear all) */}
      {activeCount > 0 && (
        <div className="hidden md:flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
