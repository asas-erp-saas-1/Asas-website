'use client';

import { motion } from 'framer-motion';
import { useApartmentSearch } from '@/lib/api';
import { ApartmentCard } from '@/components/shared/ApartmentCard';
import { Sparkles } from 'lucide-react';
import type { Apartment } from '@/lib/types';

interface PropertyRecommenderProps {
  currentApartmentType: string;
  currentProjectId: string;
  excludeId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

export function PropertyRecommender({ currentApartmentType, currentProjectId, excludeId }: PropertyRecommenderProps) {
  const { data: apartments, isLoading } = useApartmentSearch({ type: currentApartmentType, status: 'AVAILABLE' });

  if (isLoading) return <PropertyRecommenderSkeleton />;

  const similarApartments = (apartments ?? [])
    .filter((apartment) => apartment.id !== excludeId && apartment.projectId !== currentProjectId)
    .slice(0, 3);

  if (similarApartments.length === 0) return null;

  return (
    <section className="py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-forest/10"><Sparkles className="size-5 text-forest" /></span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Appartements similaires</h3>
      </motion.div>

      <motion.div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-3 md:overflow-visible md:pb-0" variants={containerVariants} initial="hidden" animate="visible">
        {similarApartments.map((apartment: Apartment) => (
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
    <section className="py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-forest/10"><Sparkles className="size-5 text-forest" /></span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Appartements similaires</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="min-w-[280px] overflow-hidden rounded-xl border border-border bg-card md:min-w-0 animate-pulse">
            <div className="space-y-3 p-4"><div className="h-6 w-1/3 rounded bg-muted" /><div className="mx-auto h-8 w-1/2 rounded bg-muted" /><div className="h-4 w-2/3 rounded bg-muted" /><div className="h-5 w-1/3 rounded bg-muted" /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
