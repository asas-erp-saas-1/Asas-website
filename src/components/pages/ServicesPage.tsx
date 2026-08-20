'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import {
  TrendingUp,
  Globe,
  Users,
  Handshake,
  BarChart3,
  Target,
  DollarSign,
  ArrowRight,
  Search,
  Palette,
  MousePointerClick,
  Funnel,
  Phone,
  CalendarCheck,
  FileBarChart,
  LineChart,
  Zap,
  MessageCircle,
  Building2,
  Home,
  Headphones,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Rocket,
  LayoutDashboard,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const dramaticStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const cardHover3D = {
  rest: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } },
};

const SERVICES = [
  {
    icon: TrendingUp,
    color: 'from-emerald-500 to-forest',
    title: 'Commercialisation Stratégique',
    description: 'Nous définissons le positionnement optimal de votre projet, de l\'analyse du marché à la stratégie de prix, pour maximiser votre vitesse de vente.',
    deliverables: [
      'Analyse de marché et positionnement',
      'Stratégie de prix et plans de paiement',
      'Go-to-market planifié',
      'Définition de la cible acquéreur',
    ],
  },
  {
    icon: Globe,
    color: 'from-blue-500 to-indigo-600',
    title: 'Marketing Digital',
    description: 'Des campagnes publicitaires ciblées et optimisées pour générer du trafic qualifié vers vos projets immobiliers.',
    deliverables: [
      'Campagnes Meta (Facebook & Instagram)',
      'Google Ads & SEO',
      'Création de contenu et visuels',
      'Landing pages optimisées conversion',
    ],
  },
  {
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    title: 'Génération de Leads',
    description: 'Un système complet de capture, qualification et suivi des prospects pour transformer les visiteurs en acquéreurs.',
    deliverables: [
      'Landing pages dédiées par projet',
      'Formulaires intelligents',
      'Attribution et tracking UTM',
      'CRM et qualification automatique',
    ],
  },
  {
    icon: Handshake,
    color: 'from-amber-500 to-orange-600',
    title: 'Vente & Accompagnement',
    description: 'Notre équipe de vente dédiée accompagne chaque prospect de la première prise de contact jusqu\'à la signature de l\'acte.',
    deliverables: [
      'Équipe de vente dédiée',
      'Planification de visites',
      'Suivi personnalisé des prospects',
      'Accompagnement jusqu\'à la signature',
    ],
  },
  {
    icon: BarChart3,
    color: 'from-teal-500 to-cyan-600',
    title: 'Reporting & Analytics',
    description: 'Des dashboards complets pour piloter la commercialisation en temps réel et optimiser les performances.',
    deliverables: [
      'Dashboards de performance',
      'KPIs de commercialisation',
      'Rapports hebdomadaires',
      'Optimisation continue',
    ],
  },
];

const PROCESS_STEPS = [
  { num: 1, icon: Search, title: 'Analyse', desc: 'Étude du marché, de la concurrence et du positionnement optimal.' },
  { num: 2, icon: Target, title: 'Stratégie', desc: 'Définition de la stratégie de prix, de communication et de vente.' },
  { num: 3, icon: Palette, title: 'Création', desc: 'Production des supports marketing, landing pages et contenus.' },
  { num: 4, icon: MousePointerClick, title: 'Lancement', desc: 'Déploiement des campagnes et mise en ligne des projets.' },
  { num: 5, icon: Funnel, title: 'Qualification', desc: 'Capture et qualification des leads, suivi dans le CRM.' },
  { num: 6, icon: Handshake, title: 'Vente', desc: 'Visites, négociation et accompagnement jusqu\'à la signature.' },
];

/* ── Circular progress ring for stats ── */
function ProgressRing({ value, max = 100, size = 64, strokeWidth = 4 }: { value: number; max?: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const ref = useRef<SVGSVGElement>(null);
  const progress = useMotionValue(0);
  const springProgress = useSpring(progress, { stiffness: 60, damping: 20 });
  const offset = useTransform(springProgress, (v) => circumference * (1 - v));
  const [displayOffset, setDisplayOffset] = useState(circumference);

  // Start animation when in view
  const [started, setStarted] = useState(false);

  return (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      className="mx-auto"
      initial={{ rotate: -90 }}
      style={{ rotate: -90 }}
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-forest/10"
      />
      {/* Animated foreground ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-forest"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: circumference * (1 - pct) }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
      />
    </motion.svg>
  );
}

export default function ServicesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Nos chiffres — Stats Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Gradient mesh decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-forest/5 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gold/5 blur-[60px]" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-forest/3 blur-[70px]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-sm font-medium text-forest mb-4">
              <BarChart3 className="h-4 w-4" />
              Résultats mesurables
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Nos chiffres
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Des résultats concrets qui parlent d&apos;eux-mêmes
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={dramaticStagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: 4, suffix: '+', label: 'Projets', icon: Building2, max: 10 },
              { value: 13, suffix: '+', label: 'Appartements', icon: Home, max: 20 },
              { value: 100, suffix: '%', label: 'Digital', icon: Zap, max: 100 },
              { value: 24, suffix: '/7', label: 'Support', icon: Headphones, max: 24 },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                whileHover={{ scale: 1.06, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-xl hover:border-forest/30 transition-all duration-300 group/stat relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative">
                  <ProgressRing value={stat.value} max={stat.max} size={72} strokeWidth={5} />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ top: 0 }}>
                    <stat.icon className="h-6 w-6 text-forest" />
                  </div>
                  <div className="mt-4">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} className="text-3xl md:text-4xl" />
                    <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-forest py-20 px-4 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-forest-light/10 blur-[80px]" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-gold/8 blur-[60px]" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-white/90 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-status-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            5 services spécialisés
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Nos Services
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            Un système complet de commercialisation immobilière, du positionnement à la vente
          </motion.p>
        </div>
      </section>

      {/* Services Detail Cards — with tilt, icons, "En savoir plus" */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-sm font-medium text-forest mb-4">
              <Rocket className="h-4 w-4" />
              Solutions sur mesure
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Ce que nous faisons
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Chaque service est conçu pour s&apos;intégrer dans notre processus de commercialisation complet
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={dramaticStagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={{
                    rotateY: -3,
                    rotateX: 3,
                    scale: 1.03,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  style={{ perspective: 800 }}
                  className="group/card relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:border-forest/30 transition-shadow duration-500"
                >
                  {/* Gradient top accent */}
                  <div className={`h-1.5 bg-gradient-to-r ${service.color}`} />

                  <div className="p-7">
                    {/* Icon with colored circular background */}
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 shadow-lg group-hover/card:scale-110 group-hover/card:shadow-xl transition-all duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{service.description}</p>

                    {/* Deliverables */}
                    <ul className="space-y-2.5 mb-6">
                      {service.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-forest flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* En savoir plus → with animated arrow */}
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest group/link"
                    >
                      En savoir plus
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </motion.button>
                  </div>

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-4 bg-charcoal">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-forest/20 px-4 py-1.5 text-sm font-medium text-forest-light mb-4">
              <LayoutDashboard className="h-4 w-4" />
              Méthodologie éprouvée
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-3">
              Notre processus
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sand/70 max-w-2xl mx-auto">
              Un processus structuré en 6 étapes pour garantir la réussite de chaque projet
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={dramaticStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {PROCESS_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative group/step"
                >
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
                    <div className="w-12 h-12 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-forest/30 group-hover/step:scale-110 transition-transform duration-300">
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-forest-light uppercase tracking-wider mb-1">Étape {step.num}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-sand leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA — with gradient border animation */}
      <section className="py-20 px-4 bg-forest relative overflow-hidden">
        {/* Animated gradient border at top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1"
          initial={{ backgroundPosition: '0% 0%' }}
          animate={{ backgroundPosition: '200% 0%' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            backgroundSize: '200% 100%',
          }}
        />

        {/* Decorative elements */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-forest-light/8 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gold/6 blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
              <MessageCircle className="h-3.5 w-3.5 text-gold" />
              Parlez à un expert
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Parler de votre projet
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Que vous soyez promoteur ou acquéreur, notre équipe est à votre disposition pour vous accompagner.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="bg-white text-forest hover:bg-sand text-lg px-10 py-6 h-auto shadow-xl shadow-black/10"
                  onClick={() => router.goContact()}
                >
                  Contactez-nous
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <a
                  href={getWhatsAppUrl('Bonjour, je souhaite des informations sur vos services.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 text-lg px-10 py-6 h-auto backdrop-blur-sm"
                  >
                    <MessageCircle className="h-5 w-5 mr-1" />
                    WhatsApp
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
