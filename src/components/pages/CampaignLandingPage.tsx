'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from '@/lib/router';
import { getCampaign } from '@/lib/campaigns';
import { useProjects } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import {
  ASAS,
  LEAD_INTENTS,
  LEAD_INTENT_LABELS,
  getWhatsAppUrl,
  getPhoneUrl,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Flame,
  ArrowRight,
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Shield,
  Award,
  Clock,
  Loader2,
  AlertCircle,
  Sparkles,
  Building2,
} from 'lucide-react';

interface CampaignLandingPageProps {
  campaignSlug: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// Map a campaign projectName (display) to the project slug in DB.
// The DB seeds use "Résidence Les Oliviers", "Résidence El Borj", "Résidence Dar Saïda"
// while the campaign data uses the short display name.
function findProjectSlug(
  projects: { name: string; slug: string }[] | undefined,
  projectName?: string
): string | undefined {
  if (!projects || !projectName) return undefined;
  const match = projects.find((p) =>
    p.name.toLowerCase().includes(projectName.toLowerCase())
  );
  return match?.slug;
}

export default function CampaignLandingPage({ campaignSlug }: CampaignLandingPageProps) {
  const router = useRouter();
  const campaign = getCampaign(campaignSlug);
  const { data: projects } = useProjects();
  const projectSlug = useMemo(
    () => findProjectSlug(projects, campaign?.projectName),
    [projects, campaign?.projectName]
  );

  // Track campaign_view once on mount
  useEffect(() => {
    if (!campaign) return;
    trackEvent('campaign_view', {
      campaign_slug: campaign.slug,
      campaign_title: campaign.title,
      project_name: campaign.projectName ?? '',
    });
  }, [campaign]);

  if (!campaign) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center py-20 max-w-md">
          <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="size-8 text-forest" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Campagne introuvable</h2>
          <p className="text-muted-foreground mb-6">
            La page de campagne demandée n&apos;existe pas ou a expiré.
          </p>
          <Button onClick={() => router.goHome()} className="bg-forest hover:bg-forest-dark text-white">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
        </div>
      </main>
    );
  }

  const handlePrimaryCta = () => {
    trackEvent('campaign_cta_click', {
      campaign_slug: campaign.slug,
      cta_label: campaign.ctaPrimary,
      cta_position: 'hero',
    });
    const formEl = document.getElementById('campaign-lead-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (formEl.querySelector('input') as HTMLInputElement | null)?.focus();
    }
  };

  const handleSecondaryCta = () => {
    if (!campaign.ctaSecondary) return;
    trackEvent('campaign_cta_click', {
      campaign_slug: campaign.slug,
      cta_label: campaign.ctaSecondary,
      cta_position: 'hero_secondary',
    });
    if (projectSlug) {
      router.goProject(projectSlug);
    } else {
      router.goProjects();
    }
  };

  return (
    <main className="bg-ivory">
      {/* === Hero section === */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={campaign.image}
            alt={campaign.headline}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${campaign.gradient} opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20 pt-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm">
                <Sparkles className="size-3 mr-1" />
                {campaign.subtitle}
              </Badge>
              {campaign.offer && (
                <Badge className="bg-amber-400/90 text-charcoal border-amber-300">
                  <Flame className="size-3 mr-1" />
                  {campaign.offer}
                </Badge>
              )}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight"
            >
              {campaign.headline}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed max-w-2xl"
            >
              {campaign.subheadline}
            </motion.p>

            {campaign.urgencyText && (
              <motion.div
                variants={fadeUp}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-500/90 text-white px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm"
              >
                <Clock className="size-4 animate-pulse" />
                {campaign.urgencyText}
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handlePrimaryCta}
                className="bg-white text-charcoal hover:bg-white/90 shadow-lg"
              >
                {campaign.ctaPrimary}
                <ArrowRight className="size-4 ml-1" />
              </Button>
              {campaign.ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSecondaryCta}
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm"
                >
                  {campaign.ctaSecondary}
                </Button>
              )}
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-sm text-white/70">
              Ou contactez-nous directement au{' '}
              <a href={getPhoneUrl()} className="font-semibold text-white underline underline-offset-2">
                {ASAS.phone}
              </a>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* === Features + Lead form (split section) === */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Features column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest uppercase tracking-wider">
                  <Award className="size-4" />
                  Ce que vous obtenez
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
              >
                Une opportunité complète, prête à étudier
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-3 text-muted-foreground">
                Voici les caractéristiques incluses dans cette offre ASAS :
              </motion.p>

              <motion.ul variants={stagger} className="mt-8 space-y-4">
                {campaign.features.map((feature) => (
                  <motion.li key={feature} variants={fadeUp} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 inline-flex items-center justify-center size-6 rounded-full bg-forest/15 text-forest">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <span className="text-base text-foreground/90 leading-relaxed">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Offer/Urgency box */}
              {(campaign.offer || campaign.urgencyText) && (
                <motion.div
                  variants={fadeUp}
                  className={`mt-8 rounded-2xl p-6 bg-gradient-to-br ${campaign.gradient} text-white shadow-xl relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="size-5" />
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                        Offre limitée
                      </span>
                    </div>
                    {campaign.offer && (
                      <p className="text-2xl sm:text-3xl font-bold">{campaign.offer}</p>
                    )}
                    {campaign.urgencyText && (
                      <p className="mt-2 text-sm text-white/85 flex items-center gap-2">
                        <Clock className="size-4 shrink-0" />
                        {campaign.urgencyText}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Lead form column */}
            <motion.div
              id="campaign-lead-form"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="lg:sticky lg:top-24"
            >
              <CampaignLeadForm
                campaignSlug={campaign.slug}
                projectName={campaign.projectName}
                apartmentSlug={campaign.apartmentSlug}
                ctaPrimary={campaign.ctaPrimary}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* === Project preview === */}
      {campaign.projectName && (
        <section className="py-16 sm:py-20 bg-gradient-to-b from-forest/5 to-ivory border-y border-forest/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              <motion.div variants={fadeUp} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={campaign.image}
                  alt={campaign.projectName}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <Badge className="bg-forest text-white border-0">
                    <Building2 className="size-3 mr-1" />
                    Projet
                  </Badge>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest uppercase tracking-wider">
                  <Building2 className="size-4" />
                  Le projet
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  {campaign.projectName}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Ce bien fait partie du projet {campaign.projectName}, entièrement commercialisé par ASAS.
                  Découvrez l&apos;ensemble des typologies, plans et disponibilités en visitant la page projet.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-forest" />
                    Suivi personnalisé par un conseiller ASAS dédié
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-forest" />
                    Visite physique ou virtuelle à la demande
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-forest" />
                    Plans détaillés et simulateur de paiement
                  </li>
                </ul>
                <div className="mt-8">
                  <Button
                    onClick={handleSecondaryCta}
                    className="bg-forest hover:bg-forest-dark text-white"
                  >
                    Voir le projet
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* === Trust signals === */}
      <section className="py-16 sm:py-20 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-light uppercase tracking-wider"
            >
              <Shield className="size-4" />
              Pourquoi ASAS
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl sm:text-4xl font-bold leading-tight"
            >
              Un accompagnement immobilier complet et fiable
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-white/70">
              ASAS est votre partenaire de confiance pour l&apos;achat d&apos;un bien immobilier neuf à Alger et ses environs.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: 'Promoteurs sélectionnés',
                desc: 'Nous travaillons uniquement avec des promoteurs reconnus pour leur qualité de construction.',
              },
              {
                icon: Shield,
                title: 'Transparence totale',
                desc: 'Plans, prix, délais de livraison : toutes les informations sont communiquées clairement.',
              },
              {
                icon: Clock,
                title: 'Suivi personnalisé',
                desc: "Un conseiller dédié vous accompagne de la première visite jusqu'à la remise des clés.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-forest/30 flex items-center justify-center mb-4">
                  <item.icon className="size-6 text-forest-light" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact strip */}
          <motion.div
            variants={fadeUp}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10"
          >
            <a
              href={getPhoneUrl()}
              className="flex items-center gap-3 text-white hover:text-forest-light transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Phone className="size-4" />
              </span>
              <div>
                <p className="text-xs text-white/60">Téléphone</p>
                <p className="text-sm font-medium">{ASAS.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${ASAS.email}`}
              className="flex items-center gap-3 text-white hover:text-forest-light transition-colors"
            >
              <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Mail className="size-4" />
              </span>
              <div>
                <p className="text-xs text-white/60">Email</p>
                <p className="text-sm font-medium break-all">{ASAS.email}</p>
              </div>
            </a>
            <div className="flex items-center gap-3 text-white">
              <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-xs text-white/60">Zone d&apos;activité</p>
                <p className="text-sm font-medium">{ASAS.city}, {ASAS.country}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === Final CTA === */}
      <section className={`py-20 sm:py-24 bg-gradient-to-br ${campaign.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 uppercase tracking-wider"
            >
              <Flame className="size-4" />
              Plus que quelques lots disponibles
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl sm:text-5xl font-bold text-white leading-tight"
            >
              {campaign.headline}
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-white/85">
              {campaign.urgencyText ?? 'Recevez toutes les informations dès maintenant.'}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handlePrimaryCta}
                className="bg-white text-charcoal hover:bg-white/90 shadow-lg"
              >
                {campaign.ctaPrimary}
                <ArrowRight className="size-4 ml-1" />
              </Button>
              <a href={getWhatsAppUrl(`Bonjour, je suis intéressé(e) par la campagne : ${campaign.title}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm w-full"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp direct
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* === Inline compact lead form for the campaign page === */
interface CampaignLeadFormProps {
  campaignSlug: string;
  projectName?: string;
  apartmentSlug?: string;
  ctaPrimary: string;
}

function CampaignLeadForm({
  campaignSlug,
  projectName,
  apartmentSlug,
  ctaPrimary,
}: CampaignLeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [intent, setIntent] = useState<string>(LEAD_INTENTS.REQUEST_INFORMATION);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStarted, setFormStarted] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  // Capture UTM params from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });
    setUtmParams(utm);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name || name.trim().length < 2) errs.name = 'Le nom est requis (min. 2 caractères)';
    if (!phone || !/^(\+213|0)[5-7]\d{8}$/.test(phone)) {
      errs.phone = 'Format algérien requis (ex: 0555123456)';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Email invalide';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackEvent('form_start', {
        form_id: 'campaign_lead_form',
        campaign_slug: campaignSlug,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    trackEvent('form_submit', {
      form_id: 'campaign_lead_form',
      campaign_slug: campaignSlug,
      intent,
    });

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      intent,
      message: `Campagne: ${campaignSlug}${projectName ? ` - Projet: ${projectName}` : ''}`,
      projectName,
      apartmentId: apartmentSlug,
      apartmentName: apartmentSlug,
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      landingPage: campaignSlug,
      utmSource: utmParams.utm_source,
      utmMedium: utmParams.utm_medium,
      utmCampaign: utmParams.utm_campaign,
      utmContent: utmParams.utm_content,
      utmTerm: utmParams.utm_term,
      gclid: utmParams.gclid,
      fbclid: utmParams.fbclid,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      source: 'CAMPAIGN',
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      setStatus('success');
      trackEvent('form_success', {
        form_id: 'campaign_lead_form',
        campaign_slug: campaignSlug,
      });
    } catch {
      setStatus('error');
      trackEvent('form_failure', {
        form_id: 'campaign_lead_form',
        campaign_slug: campaignSlug,
        reason: 'network_or_server_error',
      });
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-forest/20 bg-card shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="size-8 text-forest" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Merci !</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Votre demande a bien été reçue. Un conseiller ASAS vous recontactera très prochainement.
        </p>
        <a
          href={getWhatsAppUrl(`Bonjour, je viens de remplir le formulaire pour la campagne ${campaignSlug}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex"
        >
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <MessageCircle className="size-4" />
            Continuer sur WhatsApp
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-forest/20 bg-card shadow-xl overflow-hidden">
      <div className={`bg-gradient-to-r from-forest to-forest-dark px-6 py-5 text-white`}>
        <h2 className="text-xl font-bold">Recevez les informations</h2>
        <p className="text-sm text-white/80 mt-1">
          Réponse sous 24h ouvrées. Sans engagement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {projectName && (
          <div className="rounded-lg bg-forest/5 border border-forest/20 px-3 py-2 text-xs text-forest font-medium flex items-center gap-2">
            <Building2 className="size-3.5" />
            Projet : {projectName}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="cmp-name" className="text-sm font-medium text-foreground">
            Nom <span className="text-destructive">*</span>
          </label>
          <Input
            id="cmp-name"
            placeholder="Votre nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={handleFieldFocus}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="size-3" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cmp-phone" className="text-sm font-medium text-foreground">
            Téléphone <span className="text-destructive">*</span>
          </label>
          <Input
            id="cmp-phone"
            type="tel"
            placeholder="0555 12 34 56"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onFocus={handleFieldFocus}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="size-3" />
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cmp-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="cmp-email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleFieldFocus}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="size-3" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cmp-intent" className="text-sm font-medium text-foreground">
            Motif
          </label>
          <select
            id="cmp-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            onFocus={handleFieldFocus}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            {Object.entries(LEAD_INTENT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="w-full bg-forest hover:bg-forest-dark text-white"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              {ctaPrimary}
              <ArrowRight className="size-4 ml-1" />
            </>
          )}
        </Button>

        <a
          href={getWhatsAppUrl(`Bonjour, je suis intéressé(e) par la campagne : ${projectName || campaignSlug}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50"
          >
            <MessageCircle className="size-4" />
            Contacter via WhatsApp
          </Button>
        </a>

        {status === 'error' && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>Une erreur est survenue. Veuillez réessayer.</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Vos données sont traitées conformément à notre politique de confidentialité.
        </p>
      </form>
    </div>
  );
}
