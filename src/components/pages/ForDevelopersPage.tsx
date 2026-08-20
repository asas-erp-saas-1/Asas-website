'use client';

import { motion } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/shared/LeadForm';
import {
  Clock,
  Globe,
  Funnel,
  FileBarChart,
  TrendingUp,
  Target,
  Megaphone,
  Users,
  Handshake,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Calculator,
  Search,
  Palette,
  Rocket,
  Phone,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const PAIN_POINTS = [
  {
    icon: Clock,
    title: 'Ventes lentes',
    desc: 'Vos projets restent en commercialisation pendant des mois, voire des années.',
  },
  {
    icon: Globe,
    title: 'Pas de stratégie digitale',
    desc: 'Vous comptez uniquement sur le bouche-à-oreille et les panneaux sur site.',
  },
  {
    icon: Funnel,
    title: 'Pas de suivi des leads',
    desc: 'Vous n\'avez aucune visibilité sur qui est intéressé et où ils en sont.',
  },
  {
    icon: FileBarChart,
    title: 'Pas de reporting',
    desc: 'Vous ne savez pas ce qui fonctionne, ce qui ne fonctionne pas, et pourquoi.',
  },
];

const SOLUTION_STEPS = [
  { num: 1, icon: Target, title: 'Analyse', desc: 'Étude de votre projet, du marché et de la concurrence.' },
  { num: 2, icon: TrendingUp, title: 'Stratégie', desc: 'Positionnement, pricing et plan de commercialisation.' },
  { num: 3, icon: Megaphone, title: 'Marketing', desc: 'Campagnes digitales ciblées et création de contenu.' },
  { num: 4, icon: Users, title: 'Leads', desc: 'Capture, qualification et suivi dans le CRM.' },
  { num: 5, icon: Handshake, title: 'Vente', desc: 'Visites, négociation et accompagnement.' },
  { num: 6, icon: BarChart3, title: 'Reporting', desc: 'Dashboards, KPIs et optimisation continue.' },
];

const PROCESS_STEPS = [
  {
    num: 1,
    icon: Search,
    title: 'Diagnostic',
    desc: 'Nous analysons votre projet, votre cible et votre positionnement marché.',
  },
  {
    num: 2,
    icon: Palette,
    title: 'Création',
    desc: 'Nous concevons les supports digitaux : site, visuels, contenu vidéo.',
  },
  {
    num: 3,
    icon: Rocket,
    title: 'Lancement',
    desc: 'Nous déployons les campagnes publicitaires et générons du trafic qualifié.',
  },
  {
    num: 4,
    icon: Phone,
    title: 'Conversion',
    desc: 'Nous transformons les leads en visites et les visites en ventes signées.',
  },
];

const DELIVERABLES = [
  'Stratégie de commercialisation complète',
  'Landing pages et site dédié au projet',
  'Campagnes Meta & Google Ads',
  'Génération et qualification de leads',
  'Équipe de vente dédiée',
  'Reporting hebdomadaire',
  'Dashboard de performance en temps réel',
  'Optimisation continue des campagnes',
];

export default function ForDevelopersPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="bg-charcoal py-20 px-4 relative overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-forest/10 blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-gold/5 blur-[60px]" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-forest/20 backdrop-blur-sm border border-forest/30 px-4 py-1.5 text-sm font-medium text-forest-light mb-6"
          >
            <Megaphone className="h-4 w-4" />
            Espace promoteurs
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Vous êtes promoteur ?
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-xl text-sand max-w-2xl mx-auto"
          >
            ASAS vous offre un système de commercialisation complet pour vendre vos projets plus vite.
          </motion.p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-4"
          >
            La commercialisation immobilière est un défi
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
          >
            Beaucoup de promoteurs font face aux mêmes problèmes
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {PAIN_POINTS.map((pain) => (
              <motion.div
                key={pain.title}
                variants={fadeUp}
                className="p-6 rounded-xl border-l-4 border-l-destructive border border-destructive/20 bg-destructive/5 hover:shadow-md transition-all duration-300"
              >
                <pain.icon className="h-6 w-6 text-destructive mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-2">{pain.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pain.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Step-by-step process section */}
      <section className="py-20 px-4 bg-ivory">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-foreground mb-4">
              Notre processus en 4 étapes
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Un parcours structuré pour transformer votre projet en succès commercial.
            </motion.p>
          </motion.div>

          {/* Steps with connecting lines */}
          <div className="relative">
            {/* Animated connecting line (horizontal, visible on lg) */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="hidden lg:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[2px] bg-gradient-to-r from-forest via-gold to-forest origin-left z-0"
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {PROCESS_STEPS.map((step) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  {/* Numbered circle */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest to-forest-dark text-white flex items-center justify-center mb-5 shadow-lg shadow-forest/20">
                    <span className="text-2xl font-bold">{step.num}</span>
                  </div>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center mb-3">
                    <step.icon className="h-5 w-5 text-forest" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROI Calculator teaser */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="relative overflow-hidden rounded-2xl border border-forest/20 bg-gradient-to-br from-forest/5 via-card to-gold/5 p-8 md:p-12"
          >
            {/* Decorative blur */}
            <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-forest/10 blur-[60px]" />

            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                <Calculator className="h-6 w-6 text-forest" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Calculateur ROI</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Estimez le retour sur investissement de votre commercialisation avec ASAS.
                  Comparez les coûts internes vs. notre solution et découvrez combien vous pouvez économiser.
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6">
              <Button
                className="bg-forest hover:bg-forest-dark text-white gap-2"
                onClick={() => router.goContact()}
              >
                <Calculator className="h-4 w-4" />
                Calculer mon ROI
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 px-4 bg-ivory">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-foreground mb-4">
              La solution ASAS
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Un système de commercialisation complet qui couvre chaque étape, de l'analyse à la vente.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SOLUTION_STEPS.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="p-6 rounded-xl border-l-4 border-l-forest border border-border bg-card hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center text-sm font-bold">
                    {step.num}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-16 px-4 bg-forest">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-3xl font-bold text-white text-center mb-10"
          >
            Ce que vous obtenez
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {DELIVERABLES.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/10"
              >
                <CheckCircle2 className="h-5 w-5 text-forest-light flex-shrink-0" />
                <span className="text-sm text-white">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lead Form CTA with gradient border animation */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-8"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Parler de votre projet
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              Décrivez votre projet et notre équipe vous recontactera sous 24h.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-2xl p-[2px] overflow-hidden"
          >
            {/* Animated gradient border */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl animate-[spin_4s_linear_infinite]"
              style={{
                background: 'conic-gradient(from 0deg, #225A48, #B4AA78, #225A48, transparent, #225A48)',
              }}
            />
            <div className="relative bg-card rounded-[14px] p-8">
              <LeadForm
                intent="REQUEST_INFORMATION"
                showWhatsApp={true}
                showPhone={true}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
