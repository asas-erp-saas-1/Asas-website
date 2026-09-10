'use client';

import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Mail, ShieldCheck, FileText, Database, Eye, Clock, Globe, Shield, Lock } from 'lucide-react';

const sections = [
  { icon: FileText, title: '1. Responsable du traitement', content: <>ASAS — Agence de Commercialisation Immobilière, située à Alger, Algérie, est le responsable du traitement des données personnelles collectées sur ce site. Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l&apos;adresse : <a href="mailto:asas.agency.dz@gmail.com" className="font-medium text-forest underline underline-offset-4">asas.agency.dz@gmail.com</a>.</> },
  { icon: Database, title: '2. Données collectées', content: <>Nous collectons les données suivantes : nom, numéro de téléphone, adresse e-mail (facultatif), préférences de contact, et toute information que vous choisissez de nous transmettre via nos formulaires. Ces données sont nécessaires au traitement de votre demande et à la prospection commerciale.</> },
  { icon: Eye, title: '3. Finalités du traitement', content: <>Vos données personnelles sont traitées pour les finalités suivantes : réponse à vos demandes d&apos;information, suivi commercial, envoi de communications relatives à nos programmes immobiliers (si vous y avez consenti), et respect de nos obligations légales.</> },
  { icon: Clock, title: '4. Durée de conservation', content: <>Les données sont conservées pour une durée maximale de 3 ans à compter du dernier contact avec vous, sauf obligation légale contraire. Les données relatives aux prospects non clients sont conservées 3 ans à compter de leur collecte.</> },
  { icon: Globe, title: '5. Cookies', content: <>Ce site utilise des cookies techniques nécessaires au bon fonctionnement du site, ainsi que des cookies analytiques (mesure d&apos;audience) et de pistage publicitaire, soumis à votre consentement préalable. Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de consentement.</> },
  { icon: Shield, title: '6. Vos droits (RGPD)', content: <>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi algérienne n°18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel, vous disposez des droits suivants : droit d&apos;accès, droit de rectification, droit à l&apos;effacement, droit à la limitation du traitement, droit à la portabilité, et droit d&apos;opposition. Pour exercer ces droits, contactez-nous à l&apos;adresse e-mail indiquée ci-dessus.</> },
  { icon: Globe, title: '7. Sous-traitants', content: <>Vos données peuvent être transmises à des sous-traitants (hébergeur, outils d&apos;analyse, CRM) agissant sous notre responsabilité, uniquement dans le cadre des finalités décrites. Aucune donnée n&apos;est transférée en dehors de l&apos;Algérie sans votre consentement.</> },
  { icon: Lock, title: '8. Sécurité', content: <>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction.</> },
];

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <section className="bg-forest text-white">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 lg:px-10 lg:pb-20 lg:pt-20">
          <button type="button" onClick={() => router.goHome()} className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-white/65 hover:text-white"><ArrowLeft className="size-4" /> Accueil</button>
          <div className="mt-12 max-w-3xl">
            <div className="flex size-12 items-center justify-center border border-white/15 bg-white/5"><ShieldCheck className="size-6 text-gold" /></div>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[.2em] text-gold">Confidentialité</p>
            <h1 className="mt-3 font-semibold text-4xl leading-[1.02] tracking-[-.04em] sm:text-5xl lg:text-6xl">Politique de Confidentialité</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">Les informations essentielles sur la collecte, l&apos;utilisation et la protection de vos données.</p>
            <p className="mt-6 text-xs text-white/45">Dernière mise à jour : Mars 2025</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10 lg:py-20">
        <aside className="hidden lg:block"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-forest">Sur cette page</p><div className="mt-4 border-l border-border pl-4 text-xs leading-6 text-muted-foreground">Données collectées<br />Finalités<br />Conservation<br />Cookies<br />Vos droits<br />Sécurité</div></aside>
        <div className="space-y-4">
          {sections.map(({ icon: Icon, title, content }) => (
            <article key={title} className="border border-border bg-white p-6 sm:p-8">
              <div className="flex gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center border border-forest/15 bg-forest/5"><Icon className="size-4 text-forest" /></div>
                <div className="min-w-0"><h2 className="text-base font-semibold tracking-[-.01em] sm:text-lg">{title}</h2><p className="mt-3 text-sm leading-7 text-charcoal/70">{content}</p></div>
              </div>
            </article>
          ))}
          <div className="mt-8 border border-border bg-sand/30 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-forest">Besoin d&apos;aide ?</p>
            <p className="mt-2 text-sm text-charcoal/70">Pour toute question concernant vos données personnelles, contactez ASAS directement.</p>
            <Button onClick={() => router.goContact()} className="mt-5 min-h-11 bg-charcoal text-white hover:bg-charcoal/90">Nous contacter <ChevronRight className="ml-2 size-4" /></Button>
            <a href="mailto:asas.agency.dz@gmail.com" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-forest"><Mail className="size-3.5" /> asas.agency.dz@gmail.com</a>
          </div>
        </div>
      </section>
    </main>
  );
}
