'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Hospital,
  ShoppingCart,
  Bus,
  TreePine,
} from 'lucide-react';

interface NeighborhoodInfoProps {
  city: string;
  district: string;
}

interface POI {
  label: string;
  count: number;
  icon: React.ElementType;
}

const DISTRICT_POI: Record<string, POI[]> = {
  'Chéraga': [
    { label: 'Écoles', count: 3, icon: GraduationCap },
    { label: 'Hôpitaux', count: 1, icon: Hospital },
    { label: 'Commerces', count: 5, icon: ShoppingCart },
    { label: 'Transport', count: 2, icon: Bus },
    { label: 'Parcs', count: 1, icon: TreePine },
  ],
  'Bordj El Bahri': [
    { label: 'Écoles', count: 2, icon: GraduationCap },
    { label: 'Hôpitaux', count: 1, icon: Hospital },
    { label: 'Commerces', count: 3, icon: ShoppingCart },
    { label: 'Transport', count: 1, icon: Bus },
    { label: 'Parcs', count: 2, icon: TreePine },
  ],
  'Dar El Beïda': [
    { label: 'Écoles', count: 4, icon: GraduationCap },
    { label: 'Hôpitaux', count: 2, icon: Hospital },
    { label: 'Commerces', count: 4, icon: ShoppingCart },
    { label: 'Transport', count: 3, icon: Bus },
    { label: 'Parcs', count: 1, icon: TreePine },
  ],
  'Hussein Dey': [
    { label: 'Écoles', count: 3, icon: GraduationCap },
    { label: 'Hôpitaux', count: 1, icon: Hospital },
    { label: 'Commerces', count: 6, icon: ShoppingCart },
    { label: 'Transport', count: 2, icon: Bus },
    { label: 'Parcs', count: 1, icon: TreePine },
  ],
};

const DEFAULT_POI: POI[] = [
  { label: 'Écoles', count: 2, icon: GraduationCap },
  { label: 'Hôpitaux', count: 1, icon: Hospital },
  { label: 'Commerces', count: 3, icon: ShoppingCart },
  { label: 'Transport', count: 1, icon: Bus },
  { label: 'Parcs', count: 1, icon: TreePine },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function NeighborhoodInfo({ city, district }: NeighborhoodInfoProps) {
  const pois = DISTRICT_POI[district] ?? DEFAULT_POI;

  return (
    <section className="py-10 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Points d&apos;intérêt à proximité
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-muted-foreground mb-6"
        >
          {district}, {city}
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {pois.map((poi) => {
            const IconComp = poi.icon;
            return (
              <motion.div
                key={poi.label}
                variants={fadeUp}
                className="flex flex-col items-center p-5 rounded-xl border border-border bg-card hover:shadow-md hover:border-forest/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mb-3">
                  <IconComp className="h-6 w-6 text-forest" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-0.5">{poi.count}</p>
                <p className="text-xs text-muted-foreground">{poi.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
