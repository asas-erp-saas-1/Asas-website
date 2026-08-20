'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/lib/router';
import { ASAS, getWhatsAppUrl, getPhoneUrl } from '@/lib/constants';
import { CAMPAIGNS } from '@/lib/campaigns';
import { useToastStore } from '@/lib/toast-store';
import {
  MessageCircle, Phone, Mail, MapPin, ArrowUp,
  Facebook, Instagram, Linkedin, Megaphone, ExternalLink,
  // Section icons
  Compass, Share2, BookOpen,
  // Nav item icons
  Building2, Briefcase, Users, Info, BarChart3,
  // Resource item icons
  FileText, HelpCircle, Scale, Shield,
  // Misc
  Send,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { NewsletterForm } from '@/components/shared/NewsletterForm';

/* ─── Animated section wrapper — fades in when scrolled into view ─── */
function FooterSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Circular progress back-to-top button with tooltip ─── */
function ScrollProgressBackToTop() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollPercent(percent);
      setVisible(scrollTop > 300);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) return null;

  /* SVG circle math */
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - scrollPercent);

  return (
    <div className="relative">
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-white bg-charcoal border border-white/10 rounded-md px-2 py-1 shadow-lg pointer-events-none"
        >
          Retour en haut
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-charcoal" />
        </motion.div>
      )}
      <button
        onClick={scrollToTop}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Retour en haut"
        className="w-10 h-10 relative flex items-center justify-center transition-all duration-200 hover:scale-110 group"
      >
        {/* Background ring */}
        <svg
          className="absolute inset-0 w-10 h-10 -rotate-90"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="20" cy="20" r={radius}
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/10"
          />
          {/* Progress */}
          <circle
            cx="20" cy="20" r={radius}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-forest-light transition-[stroke-dashoffset] duration-150"
          />
        </svg>
        {/* Arrow icon */}
        <ArrowUp className="h-4 w-4 text-sand group-hover:text-white transition-colors relative z-10" />
      </button>
    </div>
  );
}

export function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();

  /* Dynamic stats from /api/stats */
  const [stats, setStats] = useState<{ projectsCount: number; apartmentsCount: number; districtsCount: number } | null>(null);
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => data ? setStats(data) : null)
      .catch(() => {});
  }, []);

  const navItems = [
    { label: 'Nos projets', icon: Building2, action: () => router.goProjects() },
    { label: 'Services', icon: Briefcase, action: () => router.goServices() },
    { label: 'Promoteurs', icon: Users, action: () => router.goForDevelopers() },
    { label: 'À propos', icon: Info, action: () => router.goAbout() },
    { label: 'Insights', icon: BarChart3, action: () => router.goInsights() },
    { label: 'Contact', icon: Mail, action: () => router.goContact() },
  ];

  const resourceItems = [
    { label: 'Guide d\u2019achat', icon: FileText, action: () => router.goInsights() },
    { label: 'FAQ', icon: HelpCircle, action: () => router.goContact() },
    { label: 'Mentions légales', icon: Scale, action: () => useToastStore.getState().addToast({ title: 'Bientôt disponible', variant: 'default' }) },
    { label: 'Politique de confidentialité', icon: Shield, action: () => useToastStore.getState().addToast({ title: 'Bientôt disponible', variant: 'default' }) },
  ];

  /* Social links with detail — enhanced brand colors */
  const socialLinks = [
    {
      name: 'Facebook',
      handle: '/asas.immobilier',
      url: 'https://facebook.com/asas.immobilier',
      icon: Facebook,
      hoverBg: 'hover:bg-blue-600',
      hoverIconColor: 'group-hover:text-white',
    },
    {
      name: 'Instagram',
      handle: '@asas.immobilier',
      url: 'https://instagram.com/asas.immobilier',
      icon: Instagram,
      hoverBg: 'hover:bg-pink-600',
      hoverIconColor: 'group-hover:text-white',
    },
    {
      name: 'LinkedIn',
      handle: 'ASAS Immobilier',
      url: 'https://linkedin.com/company/asas-immobilier',
      icon: Linkedin,
      hoverBg: 'hover:bg-sky-700',
      hoverIconColor: 'group-hover:text-white',
    },
  ];

  return (
    <footer className="bg-charcoal text-white relative overflow-hidden">
      {/* Gradient mesh background pattern */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-forest/10 blur-[80px]" />
        <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-gold/8 blur-[60px]" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-forest/8 blur-[80px]" />
      </div>

      {/* Decorative top border — forest-to-gold gradient */}
      <div className="relative h-1 bg-gradient-to-r from-forest via-gold to-forest" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* ── Brand ── */}
          <FooterSection delay={0} className="space-y-5">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.12, rotate: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-10 h-10 rounded-lg bg-forest flex items-center justify-center cursor-pointer shadow-lg shadow-forest/30"
              >
                <span className="text-white font-bold text-lg">A</span>
              </motion.div>
              <span className="text-2xl font-bold text-white tracking-tight">
                ASAS
              </span>
            </div>
            <p className="text-sm text-sand leading-relaxed">
              {ASAS.tagline}
            </p>
            <p className="text-xs text-sand/70 leading-relaxed">
              Agence de commercialisation immobilière spécialisée dans la vente de projets neufs à Alger et ses environs.
            </p>
            {/* Direct contact methods */}
            <div className="space-y-2 pt-1">
              <a
                href={getWhatsAppUrl('Bonjour')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium transition-colors group"
                style={{ color: '#25D366' }}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(37,211,102,0.15)' }}>
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                Contacter via WhatsApp
              </a>
              <a
                href={getPhoneUrl()}
                className="flex items-center gap-2 text-sm text-sand hover:text-white transition-colors group"
              >
                <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-sand/60" />
                </span>
                {ASAS.phone}
              </a>
              <a
                href={`mailto:${ASAS.email}`}
                className="flex items-center gap-2 text-sm text-sand hover:text-white transition-colors group"
              >
                <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-sand/60" />
                </span>
                {ASAS.email}
              </a>
            </div>
            {/* Social icons — brand-colored hover */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className={`w-9 h-9 rounded-lg bg-white/5 ${social.hoverBg} flex items-center justify-center transition-colors duration-200 group`}
                >
                  <social.icon className={`h-4 w-4 text-sand ${social.hoverIconColor} transition-colors duration-200`} />
                </motion.a>
              ))}
            </div>
          </FooterSection>

          {/* ── Navigation ── */}
          <FooterSection delay={0.1} className="space-y-5">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest-light flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Navigation
            </h4>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-sand hover:text-white transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group"
                  >
                    <item.icon className="h-3.5 w-3.5 text-sand/50 group-hover:text-forest-light transition-colors duration-200" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            {/* Mobile divider */}
            <div className="md:hidden pt-4 border-t border-white/5" />
          </FooterSection>

          {/* ── Réseaux — Social with icon + platform name ── */}
          <FooterSection delay={0.2} className="space-y-5">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest-light flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Réseaux
            </h4>
            <ul className="space-y-4">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-sm text-sand hover:text-white transition-colors group rounded-lg p-2 -m-2 hover:bg-white/5"
                  >
                    <span className={`w-8 h-8 rounded-lg bg-white/5 ${social.hoverBg} flex items-center justify-center flex-shrink-0 transition-colors duration-200`}>
                      <social.icon className={`h-4 w-4 ${social.hoverIconColor} transition-colors duration-200`} />
                    </span>
                    <div className="pt-0.5">
                      <span className="font-medium block">{social.name}</span>
                      <span className="text-xs text-sand/60 group-hover:text-white/60 transition-colors">{social.handle}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 ml-auto mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
            {/* Mobile divider */}
            <div className="md:hidden pt-4 border-t border-white/5" />
          </FooterSection>

          {/* ── Resources + Newsletter ── */}
          <FooterSection delay={0.3} className="space-y-5">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest-light flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Ressources
            </h4>
            <ul className="space-y-3">
              {resourceItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-sand hover:text-white transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group"
                  >
                    <item.icon className="h-3.5 w-3.5 text-sand/50 group-hover:text-forest-light transition-colors duration-200" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            {/* Newsletter */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-forest-light" />
                <p className="text-sm text-sand">Restez informé</p>
              </div>
              <p className="text-xs text-sand/60 mb-3">Nouveaux projets, offres exclusives et actualités immobilières.</p>
              <NewsletterForm
                source="FOOTER"
                placeholder="votre@email.com"
                buttonLabel="S'abonner"
              />
            </div>
            {/* Quick stats — dynamic from API */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sand/70">Projets actifs</span>
                <span className="text-white font-semibold">{stats?.projectsCount ?? 4}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-sand/70">Appartements</span>
                <span className="text-white font-semibold">{stats?.apartmentsCount != null ? `${stats.apartmentsCount}+` : '13+'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-sand/70">Zones couvertes</span>
                <span className="text-white font-semibold">{stats?.districtsCount ?? 4}</span>
              </div>
            </div>
          </FooterSection>
        </div>

        {/* Campagnes strip */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 rounded-lg bg-forest/30 flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-forest-light" />
              </span>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-forest-light">
                Campagnes
              </h4>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {CAMPAIGNS.map((campaign) => (
                <li key={campaign.slug}>
                  <button
                    onClick={() => router.goCampaign(campaign.slug)}
                    className="text-sm text-sand hover:text-white transition-colors hover:underline underline-offset-2 text-left"
                  >
                    {campaign.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs text-sand text-center sm:text-left">
              {`© ${year} ${ASAS.fullName}. Tous droits réservés.`}
            </p>
            {/* No fabricated certification badges — removed CNERIB/FNIP/APEL */}
          </div>
          <div className="flex items-center gap-6">
            {/* Bottom social icons — brand-colored hover */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={`bottom-${social.name}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className={`w-8 h-8 rounded-lg bg-white/5 ${social.hoverBg} flex items-center justify-center transition-colors duration-200`}
                >
                  <social.icon className={`h-3.5 w-3.5 text-sand ${social.hoverIconColor} transition-colors duration-200`} />
                </motion.a>
              ))}
            </div>
            <p className="text-xs text-sand text-center sm:text-right">
              Agence de commercialisation immobilière — {ASAS.city}, {ASAS.country}
            </p>
            {/* Admin link – subtle, desktop only */}
            <button
              onClick={() => router.goAdmin()}
              className="hidden lg:inline-flex text-[10px] text-sand/30 hover:text-sand/60 transition-colors"
            >
              Admin
            </button>
            {/* Scroll-progress back-to-top */}
            <ScrollProgressBackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
