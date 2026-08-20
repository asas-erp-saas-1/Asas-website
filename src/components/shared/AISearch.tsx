'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { ApartmentCard } from '@/components/shared/ApartmentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Search,
  X,
  AlertCircle,
  Home,
  Building2,
  MapPin,
  Bed,
  Banknote,
  Ruler,
  Car,
  Sun,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import type { Apartment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

interface AISearchFilters {
  apartmentType?: string[] | null;
  district?: string[] | null;
  minBedrooms?: number | null;
  maxPrice?: number | null;
  minSurface?: number | null;
  parking?: boolean | null;
  balcony?: boolean | null;
  explanation?: string | null;
}

interface AISearchResponse {
  filters: AISearchFilters;
  apartments: (Apartment & {
    project?: {
      id: string;
      name: string;
      slug: string;
      district: string;
      city: string;
      heroImage?: string | null;
    };
  })[];
  count: number;
  query?: string;
  error?: string;
}

interface AISearchProps {
  /** Optional className wrapper for layout adjustments */
  className?: string;
  /** Visual variant of the search box */
  variant?: 'default' | 'compact';
}

const EXAMPLE_QUERIES = [
  'Je cherche un F3 familial à Chéraga avec parking',
  'Appartement 2 chambres sous 15 millions à Dar El Beïda',
  'Grand F4 avec balcon à Bordj El Bahri',
  'F2 avec parking à Hussein Dey',
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AISearch({ className, variant = 'default' }: AISearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AISearchResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setError('Veuillez saisir une description de votre appartement idéal.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    trackEvent('ai_search', {
      query: trimmed.slice(0, 120),
      query_length: trimmed.length,
    });

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      const data: AISearchResponse = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue. Réessayez.');
        return;
      }
      setResults(data);
    } catch {
      setError('Connexion impossible. Vérifiez votre réseau puis réessayez.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    runSearch(example);
  };

  const handleReset = () => {
    setQuery('');
    setResults(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className={cn('w-full', className)}>
      {/* === Search Box === */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className={cn(
          'relative rounded-2xl border bg-card shadow-xl overflow-hidden',
          variant === 'default' ? 'p-2 md:p-3' : 'p-1.5'
        )}
      >
        {/* Gradient glow accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-forest to-transparent"
        />
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-forest pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Décrivez votre appartement idéal..."
              aria-label="Recherche intelligente"
              className={cn(
                'h-12 sm:h-14 pl-11 pr-10 text-base md:text-lg border-0 bg-transparent shadow-none focus-visible:ring-0',
                'placeholder:text-muted-foreground/70'
              )}
              disabled={loading}
            />
            {query && (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Réinitialiser la recherche"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className={cn(
              'h-12 sm:h-14 px-6 sm:px-8 text-base font-semibold',
              'bg-forest hover:bg-forest-dark text-white',
              'shadow-md transition-all',
              loading && 'cursor-wait'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="hidden sm:inline">Recherche...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Rechercher</span>
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {/* === Example Chips === */}
      {!results && !loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
          }}
          className="mt-4 flex flex-wrap items-center gap-2 justify-center"
        >
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground mr-1">
            <Lightbulb className="h-3.5 w-3.5" />
            Exemples:
          </span>
          {EXAMPLE_QUERIES.map((ex) => (
            <motion.button
              key={ex}
              variants={fadeUp}
              onClick={() => handleExampleClick(ex)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:border-forest hover:text-forest hover:bg-forest/5 transition-all"
            >
              {ex}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* === Error State === */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          >
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                {error}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-destructive hover:bg-destructive/10 rounded-md p-1"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Loading State === */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="flex items-center gap-2 mb-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-forest"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.85, 1.1, 0.85],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              L&apos;IA analyse votre demande...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Results === */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Filters detected */}
            <DetectedFilters filters={results.filters} query={results.query} />

            {/* Results list */}
            {results.apartments.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-forest">
                      {results.count}
                    </span>{' '}
                    appartement{results.count > 1 ? 's' : ''} trouvé
                    {results.count > 1 ? 's' : ''}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Nouvelle recherche
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-1 pb-2">
                  {results.apartments.map((apt) => (
                    <ApartmentCard
                      key={apt.id}
                      apartment={apt}
                      projectSlug={apt.project?.slug || ''}
                    />
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.goProjects()}
                    className="border-forest text-forest hover:bg-forest hover:text-white"
                  >
                    <Building2 className="h-4 w-4" />
                    Voir tous les projets
                  </Button>
                </div>
              </div>
            ) : (
              <NoResults onReset={handleReset} onBrowse={() => router.goProjects()} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* === Detected Filters sub-component === */
function DetectedFilters({
  filters,
  query,
}: {
  filters: AISearchFilters;
  query?: string;
}) {
  const chips: { icon: React.ReactNode; label: string }[] = [];

  if (filters.apartmentType && filters.apartmentType.length > 0) {
    chips.push({
      icon: <Home className="h-3.5 w-3.5" />,
      label: filters.apartmentType.join(', '),
    });
  }
  if (filters.district && filters.district.length > 0) {
    chips.push({
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: filters.district.join(', '),
    });
  }
  if (typeof filters.minBedrooms === 'number') {
    chips.push({
      icon: <Bed className="h-3.5 w-3.5" />,
      label: `≥ ${filters.minBedrooms} chambre${filters.minBedrooms > 1 ? 's' : ''}`,
    });
  }
  if (typeof filters.maxPrice === 'number') {
    const formatted = new Intl.NumberFormat('fr-DZ').format(filters.maxPrice);
    chips.push({
      icon: <Banknote className="h-3.5 w-3.5" />,
      label: `≤ ${formatted} DA`,
    });
  }
  if (typeof filters.minSurface === 'number') {
    chips.push({
      icon: <Ruler className="h-3.5 w-3.5" />,
      label: `≥ ${filters.minSurface} m²`,
    });
  }
  if (filters.parking === true) {
    chips.push({
      icon: <Car className="h-3.5 w-3.5" />,
      label: 'Parking',
    });
  }
  if (filters.balcony === true) {
    chips.push({
      icon: <Sun className="h-3.5 w-3.5" />,
      label: 'Balcon',
    });
  }

  return (
    <div className="rounded-xl border border-forest/20 bg-forest/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-forest" />
        <h3 className="text-sm font-semibold text-foreground">
          Filtres détectés par l&apos;IA
        </h3>
      </div>

      {filters.explanation && (
        <p className="text-sm text-muted-foreground mb-3 italic">
          « {filters.explanation} »
        </p>
      )}

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-forest/30 px-3 py-1 text-xs font-medium text-forest"
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun filtre spécifique détecté — recherche large sur tous les
          appartements disponibles.
        </p>
      )}

      {query && (
        <p className="mt-3 pt-3 border-t border-forest/10 text-xs text-muted-foreground">
          Demande: <span className="font-medium text-foreground">« {query} »</span>
        </p>
      )}
    </div>
  );
}

/* === No results state === */
function NoResults({
  onReset,
  onBrowse,
}: {
  onReset: () => void;
  onBrowse: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Aucun appartement ne correspond à votre recherche
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        Essayez avec moins de critères, ou parcourez tous nos projets
        disponibles. Notre catalogue est régulièrement enrichi.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onReset}
          className="border-forest text-forest hover:bg-forest hover:text-white"
        >
          <X className="h-4 w-4" />
          Reformuler ma recherche
        </Button>
        <Button onClick={onBrowse} className="bg-forest hover:bg-forest-dark text-white">
          <Building2 className="h-4 w-4" />
          Voir tous les projets
        </Button>
      </div>
    </div>
  );
}
