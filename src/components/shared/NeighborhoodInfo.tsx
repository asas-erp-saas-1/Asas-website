'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Hospital,
  ShoppingCart,
  Bus,
  TreePine,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/constants';

interface NeighborhoodInfoProps {
  city: string;
  district: string;
}

const TOPICS = [
  { label: 'Éducation', icon: GraduationCap },
  { label: 'Santé', icon: Hospital },
  { label: 'Commerces', icon: ShoppingCart },
  { label: 'Mobilité', icon: Bus },
  { label: 'Cadre de vie', icon: TreePine },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function NeighborhoodInfo({ city, district }: NeighborhoodInfoProps) {
  const message = `Bonjour, je souhaite connaître les informations pratiques concernant le quartier ${district}, ${city}, notamment les accès, commerces, écoles et services à proximité.`;

  return (
    <section className="border-y border-border bg-background py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest">
              <MapPin className="size-4" aria-hidden="true" />
              Localisation
            </motion.div>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
              Vivre à {district}, {city}
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              La localisation compte autant que le logement. ASAS peut vous renseigner sur les accès, les services et les points d&apos;intérêt pertinents pour votre projet d&apos;achat.
            </motion.p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl border border-forest/15 bg-forest/[0.035] p-5">
            <p className="text-sm font-semibold text-foreground">Vous voulez valider le quartier avant de décider ?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Demandez à notre équipe les informations dont vous avez besoin pour comparer sereinement le projet.</p>
            <a href={getWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-forest-dark sm:w-auto">
              <MessageCircle className="size-4" aria-hidden="true" />
              Demander les informations
            </a>
          </motion.div>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TOPICS.map(({ label, icon: Icon }) => (
            <motion.div key={label} variants={fadeUp} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-4 text-xs text-muted-foreground">Les disponibilités, distances et temps de trajet précis doivent être confirmés selon l&apos;emplacement exact du projet.</p>
      </div>
    </section>
  );
}
