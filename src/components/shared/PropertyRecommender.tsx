'use client';

import { motion } from 'framer-motion';
import { useProjects } from '@/lib/api';
import { ApartmentCard } from '@/components/shared/ApartmentCard';
import { Sparkles } from 'lucide-react';
import type { Apartment } from '@/lib/types';

interface PropertyRecommenderProps {
  currentApartmentType: string;
  currentProjectId: string;
  excludeId: string;
}

/* Stagger animation variants */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

export function PropertyRecommender({
  currentApartmentType,
  currentProjectId,
  excludeId,
}: PropertyRecommenderProps) {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <PropertyRecommenderSkeleton />;
  if (!projects || projects.length === 0) return null;

  /* Find apartments of the same type from other projects */
  const similarApartments: Array<{
    apartment: Apartment;
    projectSlug: string;
  }> = [];

  for (const project of projects) {
    if (project.id === currentProjectId) continue;
    for (const apartment of project.apartments ?? []) {
      if (apartment.id === excludeId) continue;
      if (apartment.apartmentType === currentApartmentType) {
        similarApartments.push({
          apartment,
          projectSlug: project.slug,
        });
      }
      if (similarApartments.length >= 3) break;
    }
    if (similarApartments.length >= 3) break;
  }

  /* Don't render if no similar apartments found */
  if (similarApartments.length === 0) return null;

  return (
    <section className="py-8 sm:py-10">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-center gap-3"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-forest/10">
          <Sparkles className="size-5 text-forest" />
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Appartements similaires
        </h3>
      </motion.div>

      {/* Cards container: horizontal scroll on mobile, grid on desktop */}
      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {similarApartments.map(({ apartment, projectSlug }) => (
          <motion.div
            key={apartment.id}
            variants={cardVariants}
            className="min-w-[280px] snap-start md:min-w-0"
          >
            <ApartmentCard apartment={apartment} projectSlug={projectSlug} />
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}

/** Skeleton shown while similar apartments are loading. */
function PropertyRecommenderSkeleton() {
  return (
    <section className="py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-forest/10">
          <Sparkles className="size-5 text-forest" />
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Appartements similaires
        </h3>
      </div>
      <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="min-w-[280px] md:min-w-0 rounded-xl border border-border bg-card overflow-hidden animate-pulse"
          >
            <div className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-5 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
