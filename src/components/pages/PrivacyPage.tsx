'use client';

import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Mail, Lock, Eye, Database, Clock, FileText, Globe, Shield, ChevronRight } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Responsable du traitement',
    content: (
      <>
        ASAS — Agence de Commercialisation Immobilière, située à Alger, Algérie, est le responsable du
        traitement des données personnelles collectées sur ce site. Pour toute question relative à la
        protection de vos données, vous pouvez nous contacter à l&apos;adresse :{' '}
        <a href="mailto:asas.agency.dz@gmail.com" className="text-forest underline hover:text-forest-dark">
          asas.agency.dz@gmail.com
        </a>.
      </>
    ),
  },
  {
    icon: Database,
    title: '2. Données collectées',
    content: (
      <>
        Nous collectons les données suivantes : nom, numéro de téléphone, adresse e-mail (facultatif),
        préférences de contact, et toute information que vous choisissez de nous transmettre via nos
        formulaires. Ces données sont nécessaires au traitement de votre demande et à la prospection
        commerciale.
      </>
    ),
  },
  {
    icon: Eye,
    title: '3. Finalités du traitement',
    content: (
      <>
        Vos données personnelles sont traitées pour les finalités suivantes : réponse à vos demandes
        d&apos;information, suivi commercial, envoi de communications relatives à nos programmes
        immobiliers (si vous y avez consenti), et respect de nos obligations légales.
      </>
    ),
  },
  {
    icon: Clock,
    title: '4. Durée de conservation',
    content: (
      <>
        Les données sont conservées pour une durée maximale de 3 ans à compter du dernier contact avec
        vous, sauf obligation légale contraire. Les données relatives aux prospects non clients sont
        conservées 3 ans à compter de leur collecte.
      </>
    ),
  },
  {
    icon: Globe,
    title: '5. Cookies',
    content: (
      <>
        Ce site utilise des cookies techniques nécessaires au bon fonctionnement du site, ainsi que des
        cookies analytiques (mesure d&apos;audience) et de pistage publicitaire, soumis à votre consentement
        préalable. Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de
        consentement.
      </>
    ),
  },
  {
    icon: Shield,
    title: '6. Vos droits (RGPD)',
    content: (
      <>
        Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi algérienne
        n°18-07 relative à la protection des personnes physiques dans le traitement des données à
        caractère personnel, vous disposez des droits suivants : droit d&apos;accès, droit de rectification,
        droit à l&apos;effacement, droit à la limitation du traitement, droit à la portabilité, et droit
        d&apos;opposition. Pour exercer ces droits, contactez-nous à l&apos;adresse e-mail indiquée ci-dessus.
      </>
    ),
  },
  {
    icon: Globe,
    title: '7. Sous-traitants',
    content: (
      <>
        Vos données peuvent être transmises à des sous-traitants (hébergeur, outils d&apos;analyse, CRM)
        agissant sous notre responsabilité, uniquement dans le cadre des finalités décrites. Aucune
        donnée n&apos;est transférée en dehors de l&apos;Algérie sans votre consentement.
      </>
    ),
  },
  {
    icon: Lock,
    title: '8. Sécurité',
    content: (
      <>
        Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos
        données contre tout accès non autorisé, altération, divulgation ou destruction.
      </>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero header */}
      <section className="bg-forest py-14 px-4 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-[40px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-5"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-white mb-3"
            >
              Politique de Confidentialité
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-white/70 text-sm"
            >
              Dernière mise à jour : Mars 2025
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="space-y-8"
        >
          {sections.map((section) => (
            <motion.section
              key={section.title}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-4.5 w-4.5 text-forest" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              </div>
              <p className="text-charcoal/80 leading-relaxed pl-12">
                {section.content}
              </p>
            </motion.section>
          ))}
        </motion.div>

        {/* Contact link */}
        <div className="mt-10 p-5 rounded-xl bg-forest/5 border border-forest/10 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Des questions sur vos données personnelles ?
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-forest text-forest hover:bg-forest hover:text-white"
            onClick={() => router.goContact()}
          >
            <Mail className="size-4" />
            Nous contacter
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* Back button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => router.goHome()}
            className="gap-2 border-forest text-forest hover:bg-forest hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
