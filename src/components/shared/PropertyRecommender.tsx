'use client';

import { motion } from 'framer-motion';
import { useApartmentSearch } from '@/lib/api';
import { ApartmentCard } from '@/components/shared/ApartmentCard';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface PropertyRecommenderProps { currentApartmentType: string; currentProjectId: string; excludeId: string; }

const containerVariants = { visible: { transition: { staggerChildren: 0.08 } } };
const cardVariants = { hidden: { y: 10 }, visible: { y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } } };

export function PropertyRecommender({ currentApartmentType, currentProjectId, excludeId }: PropertyRecommenderProps) {
  const { data: apartments, isLoading } = useApartmentSearch({ type: currentApartmentType, status: 'AVAILABLE' });
  if (isLoading) return <PropertyRecommenderSkeleton />;

  const similarApartments = (apartments ?? [])
    .filter((apartment) => apartment.id !== excludeId && apartment.projectId !== currentProjectId)
    .slice(0, 3);
  if (similarApartments.length === 0) return null;

  return (
    <section className="border-t border-border py-12 sm:py-14" aria-labelledby="similar-properties-heading">
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest">
            <Sparkles className="size-4" aria-hidden="true" />
            <span>Comparer avant de décider</span>
          </div>
          <h3 id="similar-properties-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            D'autres logements du même type sont disponibles.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Si ce logement n'est pas exactement ce que vous recherchez, comparez ces options réelles dans d'autres projets ASAS avant de nous contacter.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-forest" />Même type de logement</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-forest" />Disponibilités publiées</span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-forest">
          {similarApartments.length} option{similarApartments.length > 1 ? 's' : ''}
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {similarApartments.map((apartment) => (
          <motion.div key={apartment.id} variants={cardVariants} className="min-w-[280px] snap-start md:min-w-0">
            <ApartmentCard apartment={apartment} projectSlug={apartment.project?.slug ?? ''} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function PropertyRecommenderSkeleton() {
  return (
    <section className="border-t border-border py-12 sm:py-14" aria-label="Chargement des logements similaires">
      <div className="mb-7">
        <div className="mb-2 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-7 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-full max-w-xl rounded bg-muted" />
      </div>
      <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="min-w-[280px] overflow-hidden rounded-xl border border-border bg-card md:min-w-0 animate-pulse">
            <div className="space-y-3 p-4">
              <div className="h-6 w-1/3 rounded bg-muted" />
              <div className="mx-auto h-8 w-1/2 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-5 w-1/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
