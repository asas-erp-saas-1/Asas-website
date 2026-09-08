'use client';

import { motion } from 'framer-motion';
import { useApartmentSearch } from '@/lib/api';
import { ApartmentCard } from '@/components/shared/ApartmentCard';
import { ArrowRight, Sparkles } from 'lucide-react';

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
    <section className="border-t border-border py-10 sm:py-12" aria-labelledby="similar-properties-heading">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-forest">
            <Sparkles className="size-4" aria-hidden="true" />
            <span>Autres options disponibles</span>
          </div>
          <h3 id="similar-properties-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Vous souhaitez comparer ?
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Découvrez des logements disponibles du même type dans d’autres projets ASAS. Comparez sereinement avant de nous contacter.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
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
    <section className="border-t border-border py-10 sm:py-12" aria-label="Chargement des logements similaires">
      <div className="mb-6">
        <div className="mb-2 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
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
