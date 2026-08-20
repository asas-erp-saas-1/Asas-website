'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASAS, getWhatsAppUrl, getPhoneUrl } from '@/lib/constants';
import { LeadForm } from '@/components/shared/LeadForm';
import { NewsletterCTA } from '@/components/shared/NewsletterCTA';
import { FAQAccordion } from '@/components/shared/FAQAccordion';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import {
  Phone,
  PhoneCall,
  Mail,
  MailOpen,
  MessageCircle,
  MapPin,
  Clock,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Car,
  Bus,
  Train,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Navigation,
  Send,
} from 'lucide-react';

const ProjectMap = dynamic(() => import('@/components/shared/ProjectMap'), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Spring config for accordion ─── */
const springConfig = { type: 'spring' as const, stiffness: 300, damping: 30 };

/* ─── Business Hours Data ─── */
const BUSINESS_HOURS = [
  { day: 'Dimanche', hours: '09:00 – 17:00', isOpen: true },
  { day: 'Lundi', hours: '09:00 – 17:00', isOpen: true },
  { day: 'Mardi', hours: '09:00 – 17:00', isOpen: true },
  { day: 'Mercredi', hours: '09:00 – 17:00', isOpen: true },
  { day: 'Jeudi', hours: '09:00 – 17:00', isOpen: true },
  { day: 'Vendredi', hours: '09:00 – 12:00', isOpen: true },
  { day: 'Samedi', hours: 'Fermé', isOpen: false },
] as const;

/* ─── Transport Options ─── */
const TRANSPORT_OPTIONS = [
  { icon: Car, label: 'En voiture', detail: 'Parking disponible à proximité', color: 'bg-forest/10', iconColor: 'text-forest' },
  { icon: Bus, label: 'En bus', detail: 'Ligne 14, arrêt Chéraga Centre', color: 'bg-gold/10', iconColor: 'text-gold' },
  { icon: Train, label: 'En métro', detail: 'Station Chéraga (Ligne 1)', color: 'bg-sky-100', iconColor: 'text-sky-600' },
] as const;

/* ─── FAQ Data ─── */
const FAQ_ITEMS = [
  {
    question: 'Comment planifier une visite?',
    answer: 'Contactez-nous par téléphone, WhatsApp ou via le formulaire ci-dessus. Notre équipe vous proposera un créneau dans les 24h.',
  },
  {
    question: 'Quels documents fournir pour une réservation?',
    answer: 'Une pièce d\'identité valide et un chèque de réservation de 10% du prix.',
  },
  {
    question: 'Peut-on modifier son choix d\'appartement?',
    answer: 'Oui, tant que l\'appartement souhaité est disponible et avant la signature définitive.',
  },
];

/* ─── Helper: get current day name in French ─── */
function getCurrentDayFr(): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[new Date().getDay()];
}

/* ─── Inline FAQ Item with spring animation ─── */
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="border-b border-border last:border-b-0"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 py-4 text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0 group-hover:bg-forest/20 transition-colors">
          <HelpCircle className="h-4 w-4 text-forest" />
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground group-hover:text-forest transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springConfig}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springConfig}
            className="overflow-hidden"
          >
            <p className="pb-4 pl-11 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ContactPage() {
  const currentDay = getCurrentDayFr();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="bg-forest py-16 px-4 relative overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-forest-light/10 blur-[80px]" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-gold/8 blur-[60px]" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Contactez-nous
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg text-white/70 max-w-2xl mx-auto"
          >
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </motion.p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-2xl font-bold text-foreground mb-6"
              >
                Nos coordonnées
              </motion.h2>

              <div className="space-y-6">
                {/* Phone — PhoneCall with pulse ring */}
                <motion.a
                  href={getPhoneUrl()}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-forest/5 transition-colors group/phone"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0 group-hover/phone:bg-forest/20 transition-colors">
                    <PhoneCall className="h-5 w-5 text-forest group-hover/phone:text-forest transition-colors" />
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-xl border-2 border-forest/30 animate-ping opacity-0 group-hover/phone:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="text-base font-medium text-foreground group-hover/phone:text-forest transition-colors">
                      {ASAS.phone}
                    </p>
                  </div>
                </motion.a>

                {/* Email — MailOpen with hover color change */}
                <motion.a
                  href={`mailto:${ASAS.email}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-forest/5 transition-colors group/email"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0 group-hover/email:bg-forest/20 transition-colors">
                    <MailOpen className="h-5 w-5 text-forest group-hover/email:text-gold transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-base font-medium text-foreground group-hover/email:text-forest transition-colors">
                      {ASAS.email}
                    </p>
                  </div>
                </motion.a>

                {/* WhatsApp — MessageCircle with green glow */}
                <motion.a
                  href={getWhatsAppUrl('Bonjour, je souhaite avoir des informations sur vos projets.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.16 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-green-50 transition-colors group/whatsapp"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-600/10 flex items-center justify-center flex-shrink-0 group-hover/whatsapp:bg-green-600/20 transition-colors relative">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    {/* Green glow on hover */}
                    <span className="absolute inset-0 rounded-xl bg-green-500/20 blur-md opacity-0 group-hover/whatsapp:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="text-base font-medium text-foreground group-hover/whatsapp:text-green-600 transition-colors">
                      Envoyer un message
                    </p>
                  </div>
                </motion.a>

                {/* Address — MapPin with bounce animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.24 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-forest/5 transition-colors group/address"
                >
                  <motion.div
                    whileHover={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.4, repeat: 0 }}
                    className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0 group-hover/address:bg-forest/20 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-forest" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="text-base font-medium text-foreground">
                      Chéraga, Alger, Algérie
                    </p>
                  </div>
                </motion.div>

                {/* Hours */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.32 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-forest/5 transition-colors group/hours"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0 group-hover/hours:bg-forest/20 transition-colors">
                    <Clock className="h-5 w-5 text-forest" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horaires</p>
                    <p className="text-base font-medium text-foreground">
                      Dim – Jeu : 9h – 17h | Ven : 9h – 12h
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Lead Form — with gradient border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            >
              <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-forest via-gold to-forest">
                <div className="bg-card rounded-[10px] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                      <Send className="h-4 w-4 text-forest" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Envoyez-nous un message
                    </h3>
                  </div>
                  <LeadForm
                    intent="REQUEST_INFORMATION"
                    showWhatsApp={true}
                    showPhone={true}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16 px-4 bg-ivory">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Detailed Hours */}
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-forest" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Horaires d&apos;ouverture
                </h2>
              </motion.div>
              <div className="space-y-3">
                {BUSINESS_HOURS.map((schedule) => {
                  const isCurrent = schedule.day === currentDay;
                  return (
                    <motion.div
                      key={schedule.day}
                      variants={fadeUp}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border bg-card transition-colors ${
                        isCurrent
                          ? 'border-forest shadow-sm bg-forest/5'
                          : 'border-border'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCurrent ? 'bg-forest' : 'bg-forest/10'
                      }`}>
                        <Clock className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-forest'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          isCurrent ? 'text-forest' : 'text-foreground'
                        }`}>
                          {schedule.day}
                          {isCurrent && (
                            <span className="ml-2 text-xs font-normal bg-forest/10 text-forest px-2 py-0.5 rounded-full">
                              Aujourd&apos;hui
                            </span>
                          )}
                        </p>
                        <p className={`text-sm ${schedule.isOpen ? 'text-muted-foreground' : 'text-red-500 font-medium'}`}>
                          {schedule.hours}
                        </p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${schedule.isOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <motion.h2
                variants={fadeUp}
                className="text-2xl font-bold text-foreground mb-6"
              >
                Suivez-nous
              </motion.h2>
              <div className="space-y-4">
                {[
                  {
                    name: 'Facebook',
                    url: 'https://facebook.com/asas.immobilier',
                    icon: Facebook,
                    color: 'bg-blue-600',
                    hoverColor: 'hover:bg-blue-700',
                  },
                  {
                    name: 'Instagram',
                    url: 'https://instagram.com/asas.immobilier',
                    icon: Instagram,
                    color: 'bg-pink-600',
                    hoverColor: 'hover:bg-pink-700',
                  },
                  {
                    name: 'LinkedIn',
                    url: 'https://linkedin.com/company/asas-immobilier',
                    icon: Linkedin,
                    color: 'bg-sky-700',
                    hoverColor: 'hover:bg-sky-800',
                  },
                ].map((social) => (
                  <motion.a
                    key={social.name}
                    variants={fadeUp}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 ${social.hoverColor} group`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${social.color} flex items-center justify-center flex-shrink-0 transition-colors duration-200`}>
                      <social.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">{social.name}</p>
                      <p className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors">@asas.immobilier</p>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map — Premium with decorative frame, address & transport */}
      <section className="px-4 bg-ivory">
        <div className="max-w-6xl mx-auto pb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            {/* Heading with Navigation pulse icon */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
              <div className="relative w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-forest" />
                <span className="absolute inset-0 rounded-lg border-2 border-forest/20 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Notre localisation
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-6 ml-13">
              Chéraga, Alger, Algérie
            </motion.p>

            {/* Map with decorative border frame */}
            <motion.div variants={fadeUp} className="relative">
              {/* Decorative corner accents */}
              <div aria-hidden className="pointer-events-none absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-forest rounded-tl-lg z-10" />
              <div aria-hidden className="pointer-events-none absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-forest rounded-tr-lg z-10" />
              <div aria-hidden className="pointer-events-none absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-forest rounded-bl-lg z-10" />
              <div aria-hidden className="pointer-events-none absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-forest rounded-br-lg z-10" />

              {/* Double-border frame with better loading skeleton */}
              <div className="rounded-xl border-2 border-forest/20 p-1.5 bg-white">
                <div className="rounded-lg border border-forest/10 overflow-hidden min-h-[300px]">
                  <ProjectMap
                    projects={[{
                      name: 'ASAS — Agence de Commercialisation Immobilière',
                      slug: '',
                      status: 'AVAILABLE',
                      district: ASAS.city,
                      city: ASAS.country,
                      latitude: 36.7538,
                      longitude: 3.0588,
                    }]}
                    singleProject
                  />
                </div>
              </div>
            </motion.div>

            {/* Transport Options — "Comment nous trouver" */}
            <motion.div variants={fadeUp} className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ChevronRight className="h-5 w-5 text-forest" />
                Comment nous trouver
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TRANSPORT_OPTIONS.map((transport) => (
                  <motion.div
                    key={transport.label}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow duration-200"
                  >
                    <div className={`w-9 h-9 rounded-lg ${transport.color} flex items-center justify-center flex-shrink-0`}>
                      <transport.icon className={`h-4 w-4 ${transport.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{transport.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{transport.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section with spring accordion */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-forest" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Questions fréquentes
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-6 ml-13">
              Retrouvez les réponses aux questions les plus courantes
            </motion.p>
            <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border px-6">
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  index={index}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <NewsletterCTA variant="card" source="CONTACT_CARD" />
    </main>
  );
}
