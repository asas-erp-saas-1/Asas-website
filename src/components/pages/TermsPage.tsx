'use client';

import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Mail, FileText, Globe, Shield, AlertTriangle, Link as LinkIcon, ChevronRight, BookOpen, Gavel, RefreshCw, AlertCircle } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Objet',
    content: (
      <>
        Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;utilisation du site internet
        de ASAS — Agence de Commercialisation Immobilière. En accédant au site, vous acceptez sans
        réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser ce
        site.
      </>
    ),
  },
  {
    icon: Globe,
    title: '2. Accès au service',
    content: (
      <>
        Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à Internet. ASAS
        se réserve le droit de suspendre, modifier ou interrompre l&apos;accès au site, en tout ou partie,
        sans préavis ni indemnité.
      </>
    ),
  },
  {
    icon: BookOpen,
    title: '3. Contenu du site',
    content: (
      <>
        Les informations figurant sur ce site, notamment les descriptions, surfaces, prix et
        disponibilités des programmes et appartements, sont fournies à titre indicatif et n&apos;ont pas de
        valeur contractuelle. ASAS se réserve le droit de modifier les informations à tout moment sans
        préavis. Seuls les documents contractuels signés font foi.
      </>
    ),
  },
  {
    icon: Shield,
    title: '4. Propriété intellectuelle',
    content: (
      <>
        L&apos;ensemble des éléments du site (textes, images, graphismes, logo, icônes, etc.) est la
        propriété exclusive de ASAS ou de ses partenaires. Toute reproduction, représentation,
        modification, publication ou adaptation de tout ou partie des éléments du site est interdite,
        sauf autorisation écrite préalable de ASAS.
      </>
    ),
  },
  {
    icon: AlertTriangle,
    title: '5. Limitation de responsabilité',
    content: (
      <>
        ASAS ne saurait être tenu responsable des dommages directs ou indirects résultant de
        l&apos;utilisation du site, de l&apos;impossibilité d&apos;y accéder ou de la présence d&apos;erreurs ou
        d&apos;omissions. ASAS ne garantit pas que le site sera exempt de défauts ou disponible de façon
        ininterrompue.
      </>
    ),
  },
  {
    icon: LinkIcon,
    title: '6. Liens hypertextes',
    content: (
      <>
        Le site peut contenir des liens vers des sites tiers. ASAS n&apos;exerce aucun contrôle sur le
        contenu de ces sites et décline toute responsabilité quant à leur contenu ou aux dommages
        résultant de leur consultation.
      </>
    ),
  },
  {
    icon: Shield,
    title: '7. Données personnelles',
    content: (
      <>
        Le traitement des données personnelles est régi par notre{' '}
        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') window.location.hash = '/privacy'; }}
          className="text-forest underline hover:text-forest-dark"
        >
          Politique de Confidentialité
        </button>.
      </>
    ),
  },
  {
    icon: Gavel,
    title: '8. Droit applicable et juridiction',
    content: (
      <>
        Les présentes CGU sont soumises au droit algérien. Tout litige relatif à l&apos;interprétation ou
        à l&apos;exécution des présentes sera soumis à la compétence exclusive des tribunaux d&apos;Alger,
        Algérie.
      </>
    ),
  },
  {
    icon: RefreshCw,
    title: '9. Modification des CGU',
    content: (
      <>
        ASAS se réserve le droit de modifier les présentes CGU à tout moment. Les modifications
        prennent effet dès leur publication sur le site. Il appartient à l&apos;utilisateur de consulter
        régulièrement les CGU mises à jour.
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

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero header */}
      <section className="bg-charcoal py-14 px-4 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-forest/10 blur-[40px]" />
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest/20 mb-5"
            >
              <Scale className="h-8 w-8 text-forest-light" />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-white mb-3"
            >
              Conditions Générales d&apos;Utilisation
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-sand/70 text-sm"
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
                <div className="w-9 h-9 rounded-lg bg-charcoal/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-4.5 w-4.5 text-charcoal" />
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
        <div className="mt-10 p-5 rounded-xl bg-charcoal/5 border border-charcoal/10 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Des questions sur nos conditions ?
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
