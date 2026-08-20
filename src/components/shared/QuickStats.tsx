'use client';

import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Building2, Home, CheckCircle2, MapPin } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' as const, stiffness: 100, damping: 20 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

interface QuickStatsProps {
  projects?: any[];
  isLoading?: boolean;
}

/** Shimmer skeleton for a single stat card */
function StatSkeleton() {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
      <div className="h-9 w-16 rounded bg-muted animate-pulse" />
      <div className="h-4 w-20 rounded bg-muted animate-pulse" />
    </div>
  );
}

export function QuickStats({ projects, isLoading }: QuickStatsProps) {
  const stats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [
        { icon: Building2, label: 'Projets', value: 0, bgColor: 'bg-forest/10', iconColor: 'text-forest' },
        { icon: Home, label: 'Appartements', value: 0, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
        { icon: CheckCircle2, label: 'Disponibles', value: 0, bgColor: 'bg-gold/10', iconColor: 'text-gold' },
        { icon: MapPin, label: 'Quartiers', value: 0, bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
      ];
    }

    const totalProjects = projects.length;
    const totalApartments = projects.reduce(
      (sum: number, p: any) => sum + (p.apartments?.length ?? 0),
      0,
    );
    const availableApartments = projects.reduce(
      (sum: number, p: any) =>
        sum +
        (p.apartments?.filter(
          (a: any) => a.status === 'AVAILABLE' || a.status === 'COMING_SOON',
        )?.length ?? 0),
      0,
    );
    const districts = new Set(
      projects.map((p: any) => p.district).filter(Boolean),
    );

    return [
      { icon: Building2, label: 'Projets', value: totalProjects, bgColor: 'bg-forest/10', iconColor: 'text-forest' },
      { icon: Home, label: 'Appartements', value: totalApartments, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
      { icon: CheckCircle2, label: 'Disponibles', value: availableApartments, bgColor: 'bg-gold/10', iconColor: 'text-gold' },
      { icon: MapPin, label: 'Quartiers', value: districts.size, bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    ];
  }, [projects]);

  return (
    <section className="bg-background border-t-4 border-t-forest py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={`skeleton-${i}`} variants={fadeUp}>
                  <StatSkeleton />
                </motion.div>
              ))
            : stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } }}
                  className="flex flex-col items-center text-center gap-3 cursor-default group"
                >
                  <div className={`w-14 h-14 rounded-full ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>
                  <AnimatedCounter
                    value={stat.value}
                    className="text-3xl md:text-4xl"
                  />
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </section>
  );
}
