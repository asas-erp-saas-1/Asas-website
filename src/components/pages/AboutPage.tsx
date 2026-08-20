'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { ASAS } from '@/lib/constants';
import { Home, KeyRound, Ruler, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Star,
  Eye,
  Lightbulb,
  Shield,
  TrendingUp,
  Globe,
  Users,
  Target,
  ArrowRight,
  MapPin,
  Building2,
  Linkedin,
  Mail,
  Award,
  Sparkles,
  Heart,
  Rocket,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const dramaticStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const VALUES = [
  {
    icon: Star,
    title: 'Excellence',
    desc: 'Nous visons l\'excellence dans chaque projet, chaque interaction, chaque résultat.',
    color: 'from-amber-400 to-amber-600',
    glowColor: 'shadow-amber-200/50',
  },
  {
    icon: Eye,
    title: 'Transparence',
    desc: 'Communication ouverte, reporting régulier, aucune surprise dans notre collaboration.',
    color: 'from-blue-400 to-blue-600',
    glowColor: 'shadow-blue-200/50',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'Marketing digital, outils modernes, optimisation continue des performances.',
    color: 'from-violet-400 to-violet-600',
    glowColor: 'shadow-violet-200/50',
  },
  {
    icon: Shield,
    title: 'Rigueur',
    desc: 'Méthodologie structurée, suivi des KPIs, engagement de résultats mesurables.',
    color: 'from-emerald-400 to-emerald-600',
    glowColor: 'shadow-emerald-200/50',
  },
];

const MILESTONES = [
  { year: '2024', title: 'Création d\'ASAS', desc: 'Fondation de l\'agence à Alger avec une vision claire : digitaliser la commercialisation immobilière.', icon: Rocket },
  { year: '2024', title: 'Premier projet', desc: 'Commercialisation du premier programme neuf, validation du modèle data-driven.', icon: Building2 },
  { year: '2025', title: 'Croissance équipe', desc: 'Expansion de l\'équipe à 8 collaborateurs, spécialistes marketing et vente.', icon: Users },
  { year: '2025', title: 'Résultats records', desc: 'Plus de 13 appartements commercialisés, croissance du chiffre d\'affaires de 40%.', icon: TrendingUp },
];

const TEAM = [
  {
    initials: 'KB',
    name: 'Karim Benali',
    title: 'Directeur Général',
    color: 'bg-gradient-to-br from-forest to-emerald-700',
    bio: 'Plus de 15 ans d\'expérience dans la commercialisation immobilière. Karim a fondé ASAS avec la vision de transformer le marché algérois grâce au digital.',
    linkedin: '#',
    email: '#',
  },
  {
    initials: 'SM',
    name: 'Sarah Mehdaoui',
    title: 'Directrice Commerciale',
    color: 'bg-gradient-to-br from-forest-light to-forest',
    bio: 'Passionnée par la relation client, Sarah supervise l\'équipe de vente et s\'assure que chaque acquéreur bénéficie d\'un accompagnement d\'exception.',
    linkedin: '#',
    email: '#',
  },
  {
    initials: 'YB',
    name: 'Youcef Bouzid',
    title: 'Directeur Marketing',
    color: 'bg-gradient-to-br from-gold to-amber-600',
    bio: 'Expert en marketing digital immobilier, Youcef pilote les campagnes, l\'acquisition de leads et l\'optimisation continue des performances.',
    linkedin: '#',
    email: '#',
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="bg-forest py-20 px-4 relative overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-forest-light/10 blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-gold/8 blur-[60px]" />
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
            Agence de Commercialisation Immobilière
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            À Propos d'ASAS
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            {ASAS.tagline}
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-sm font-medium text-forest mb-4">
                <Target className="h-4 w-4" />
                Notre raison d'être
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-foreground mb-6">
                Notre mission
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed mb-4">
                ASAS est une agence de commercialisation immobilière fondée à Alger avec une ambition claire : transformer la façon dont les projets immobiliers sont commercialisés en Algérie.
              </motion.p>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed mb-4">
                Nous accompagnons les promoteurs immobiliers dans la commercialisation de leurs programmes neufs, en apportant une expertise complète : du positionnement stratégique au marketing digital, de la génération de leads à la vente finale.
              </motion.p>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
                Notre approche data-driven et notre connaissance approfondie du marché algérois nous permettent de maximiser la vitesse de vente tout en garantissant une expérience acquéreur d'exception.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="rounded-xl overflow-hidden relative group/img"
            >
              <img
                src="/images/brand/about-asas.jpg"
                alt="ASAS Immobilier"
                className="w-full h-auto object-cover rounded-xl"
              />
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest/30 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values — with icon circles, hover glow, stagger */}
      <section className="py-20 px-4 bg-ivory">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-sm font-medium text-forest mb-4">
              <Heart className="h-4 w-4" />
              Ce qui nous anime
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Nos valeurs
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Des principes solides qui guident chacune de nos décisions
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={dramaticStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="group/value relative p-7 rounded-2xl border border-border bg-card text-center hover:shadow-2xl hover:border-forest/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${value.color} opacity-0 group-hover/value:opacity-10 blur-2xl transition-opacity duration-700`} />

                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-5 shadow-lg ${value.glowColor} group-hover/value:scale-110 group-hover/value:shadow-xl transition-all duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Milestones Timeline — with animated connecting lines and icons */}
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
              <Award className="h-4 w-4" />
              Notre parcours
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Jalons clés
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Les moments qui ont façonné ASAS
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={dramaticStagger}
            className="relative"
          >
            {/* Animated connecting line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px">
              <motion.div
                className="w-full bg-gradient-to-b from-forest via-forest/40 to-transparent h-full origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>

            {MILESTONES.map((milestone, idx) => {
              const MilestoneIcon = milestone.icon;
              const isLeft = idx % 2 === 0;
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, x: isLeft ? -30 : 30, y: 10 },
                    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className={`relative flex items-start gap-6 mb-10 md:mb-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-12 h-12 rounded-full bg-forest flex items-center justify-center shadow-lg shadow-forest/30"
                    >
                      <MilestoneIcon className="h-5 w-5 text-white" />
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <div className={`ml-20 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}`}>
                    <div className="p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-forest/20 transition-all duration-300 group/milestone">
                      <span className="text-sm font-bold text-forest">{milestone.year}</span>
                      <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{milestone.desc}</p>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Method */}
      <section className="py-16 px-4 bg-ivory">
        <div className="max-w-6xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-forest/20 to-transparent mb-12" />
          <motion.h2
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-3xl font-bold text-foreground mb-6"
          >
            Notre méthode
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Target,
                title: 'Positionnement stratégique',
                desc: 'Analyse de marché, concurrence et définition du positioning optimal pour chaque projet.',
              },
              {
                icon: TrendingUp,
                title: 'Marketing data-driven',
                desc: 'Campagnes digitales optimisées, A/B testing, suivi des conversions en temps réel.',
              },
              {
                icon: Users,
                title: 'Vente humaine',
                desc: 'Équipe dédiée, suivi personnalisé, visites sur site et accompagnement jusqu\'à la signature.',
              },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-6 rounded-xl border-l-4 border-l-forest border border-border bg-card hover:shadow-md transition-all duration-300 group/method"
                >
                  <div className="w-12 h-12 rounded-lg bg-forest/10 flex items-center justify-center mb-3 group-hover/method:bg-forest/20 transition-colors duration-300">
                    <ItemIcon className="h-6 w-6 text-forest" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Market */}
      <section className="py-16 px-4 bg-charcoal">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-6">
                Notre marché
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sand leading-relaxed mb-4">
                ASAS se concentre sur le marché immobilier algérois, l'un des plus dynamiques d'Algérie. Notre connaissance des quartiers, des tendances et des acquéreurs potentiels nous donne un avantage compétitif unique.
              </motion.p>
              <motion.div variants={fadeUp} className="flex items-center gap-2 text-sand">
                <MapPin className="h-5 w-5 text-forest-light" />
                <span className="font-medium">Alger, Algérie</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Ville', value: 'Alger', icon: MapPin },
                { label: 'Pays', value: 'Algérie', icon: Globe },
                { label: 'Focus', value: 'Neuf', icon: Building2 },
                { label: 'Type', value: 'Résidentiel', icon: Home },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 text-center group/market hover:bg-white/8 hover:border-white/20 transition-all duration-300"
                  >
                    <ItemIcon className="h-5 w-5 text-forest-light mx-auto mb-2 group-hover/market:scale-110 transition-transform duration-300" />
                    <p className="text-xs text-sand/60">{item.label}</p>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section — with hover lift, gradient overlay, social icon animations */}
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
              <Users className="h-4 w-4" />
              Les personnes derrière ASAS
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Notre équipe
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Une équipe passionnée par l&apos;immobilier et le digital, au service de votre réussite.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={dramaticStagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group/card relative text-center p-8 rounded-2xl border border-border bg-card hover:shadow-2xl hover:border-forest/30 transition-all duration-500 overflow-hidden"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover/card:shadow-xl transition-shadow duration-300`}
                  >
                    <span className="text-2xl font-bold text-white">{member.initials}</span>
                  </motion.div>

                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-forest mb-3">{member.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{member.bio}</p>

                  {/* Social links with proper platform icons and hover animations */}
                  <div className="flex items-center justify-center gap-3">
                    <motion.a
                      href={member.linkedin}
                      aria-label={`LinkedIn de ${member.name}`}
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-blue-600 transition-all duration-300"
                    >
                      <Linkedin className="h-4 w-4" />
                    </motion.a>
                    <motion.a
                      href={member.email}
                      aria-label={`Email de ${member.name}`}
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-forest transition-all duration-300"
                    >
                      <Mail className="h-4 w-4" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA — with Framer Motion animations and better hierarchy */}
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
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Lancez votre projet
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Travaillons ensemble
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Que vous soyez promoteur ou futur acquéreur, nous sommes là pour vous accompagner.
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
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 text-lg px-10 py-6 h-auto backdrop-blur-sm"
                  onClick={() => router.goForDevelopers()}
                >
                  Espace promoteurs
                  <ArrowUpRight className="h-5 w-5 ml-1" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
