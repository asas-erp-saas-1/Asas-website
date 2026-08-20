'use client';

import { motion } from 'framer-motion';
import { MapPin, Zap, Eye, Users, Sparkles, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: MapPin,
    title: 'Expertise Locale',
    description: 'Connaissance approfondie du marché algérois et de ses dynamiques.',
  },
  {
    icon: Zap,
    title: 'Vente Accélérée',
    description: 'Nos projets se vendent 2x plus vite grâce à notre stratégie digitale.',
  },
  {
    icon: Eye,
    title: 'Transparence Totale',
    description: 'Prix clairs, plans détaillés, suivi en temps réel de votre dossier.',
  },
  {
    icon: Users,
    title: 'Accompagnement Dédié',
    description: 'Un interlocuteur unique de la première visite à la signature.',
  },
  {
    icon: Sparkles,
    title: 'Marketing Premium',
    description: 'Visuels 3D, vidéos, campagnes ciblées pour chaque projet.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantie Constructeur',
    description: 'Tous nos projets sont livrés par des promoteurs certifiés.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-l-4 hover:border-l-forest"
    >
      {/* Icon container */}
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-forest/10 p-3 transition-all duration-300 group-hover:bg-forest">
        <Icon className="h-6 w-6 text-forest transition-colors duration-300 group-hover:text-white" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold text-foreground">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function PremiumTrustSection() {
  return (
    <section className="py-20 px-4 bg-ivory">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi choisir ASAS ?
          </h2>
          {/* Decorative line */}
          <div className="h-0.5 w-16 rounded-full bg-forest mx-auto mb-4" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Une approche unique de la commercialisation immobilière en Algérie.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
