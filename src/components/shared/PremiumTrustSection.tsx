'use client';

import { motion } from 'framer-motion';
import { FileSearch, Eye, Users, Building2, MessageSquare, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: Building2,
    title: 'Projets immobiliers',
    description: 'Explorez les programmes actuellement publiés par ASAS et consultez leurs informations disponibles.',
  },
  {
    icon: FileSearch,
    title: 'Informations utiles',
    description: 'Comparez les caractéristiques, surfaces, disponibilités et autres données publiées pour chaque bien.',
  },
  {
    icon: Eye,
    title: 'Une information lisible',
    description: 'Retrouvez les éléments disponibles sur le projet avant de prendre contact avec notre équipe.',
  },
  {
    icon: Users,
    title: 'Un échange direct',
    description: 'Lorsque vous souhaitez aller plus loin, notre équipe peut répondre à vos questions et préciser les prochaines étapes.',
  },
  {
    icon: MessageSquare,
    title: 'Un parcours simple',
    description: 'Passez de la découverte d’un projet à une demande d’information sans multiplier les étapes inutiles.',
  },
  {
    icon: ShieldCheck,
    title: 'Des données vérifiables',
    description: 'Les informations affichées sur les biens publiés sont issues des données disponibles dans le catalogue public.',
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

function FeatureCard({ feature }: { feature: FeatureItem; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      className="group relative border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-4 inline-flex items-center justify-center bg-forest/10 p-3 transition-all duration-300 group-hover:bg-forest">
        <Icon className="h-6 w-6 text-forest transition-colors duration-300 group-hover:text-white" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </motion.div>
  );
}

export function PremiumTrustSection() {
  return (
    <section className="bg-ivory px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-forest">Votre parcours</p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Découvrir, comprendre, échanger.</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Une présentation claire des projets publiés, puis un échange avec ASAS lorsque vous souhaitez avancer.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => <FeatureCard key={feature.title} feature={feature} index={0} />)}
        </motion.div>
      </div>
    </section>
  );
}
