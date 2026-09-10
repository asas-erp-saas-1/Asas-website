'use client';

import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Mail, Scale, FileText, Globe, BookOpen, Shield, AlertTriangle, Link as LinkIcon, Gavel, RefreshCw } from 'lucide-react';

const sections = [
  { icon: FileText, title: '1. Objet', content: <>Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;utilisation du site internet de ASAS — Agence de Commercialisation Immobilière. En accédant au site, vous acceptez sans réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser ce site.</> },
  { icon: Globe, title: '2. Accès au service', content: <>Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à Internet. ASAS se réserve le droit de suspendre, modifier ou interrompre l&apos;accès au site, en tout ou partie, sans préavis ni indemnité.</> },
  { icon: BookOpen, title: '3. Contenu du site', content: <>Les informations figurant sur ce site, notamment les descriptions, surfaces, prix et disponibilités des programmes et appartements, sont fournies à titre indicatif et n&apos;ont pas de valeur contractuelle. ASAS se réserve le droit de modifier les informations à tout moment sans préavis. Seuls les documents contractuels signés font foi.</> },
  { icon: Shield, title: '4. Propriété intellectuelle', content: <>L&apos;ensemble des éléments du site (textes, images, graphismes, logo, icônes, etc.) est la propriété exclusive de ASAS ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite, sauf autorisation écrite préalable de ASAS.</> },
  { icon: AlertTriangle, title: '5. Limitation de responsabilité', content: <>ASAS ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site, de l&apos;impossibilité d&apos;y accéder ou de la présence d&apos;erreurs ou d&apos;omissions. ASAS ne garantit pas que le site sera exempt de défauts ou disponible de façon ininterrompue.</> },
  { icon: LinkIcon, title: '6. Liens hypertextes', content: <>Le site peut contenir des liens vers des sites tiers. ASAS n&apos;exerce aucun contrôle sur le contenu de ces sites et décline toute responsabilité quant à leur contenu ou aux dommages résultant de leur consultation.</> },
  { icon: Shield, title: '7. Données personnelles', content: <>Le traitement des données personnelles est régi par notre <button type="button" onClick={() => router.goHome()} className="font-medium text-forest underline underline-offset-4">Politique de Confidentialité</button>.</> },
  { icon: Gavel, title: '8. Droit applicable et juridiction', content: <>Les présentes CGU sont soumises au droit algérien. Tout litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes sera soumis à la compétence exclusive des tribunaux d&apos;Alger, Algérie.</> },
  { icon: RefreshCw, title: '9. Modification des CGU', content: <>ASAS se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur le site. Il appartient à l&apos;utilisateur de consulter régulièrement les CGU mises à jour.</> },
];

export default function TermsPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 lg:px-10 lg:pb-20 lg:pt-20">
          <button type="button" onClick={() => router.goHome()} className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-white/60 hover:text-white"><ArrowLeft className="size-4" /> Accueil</button>
          <div className="mt-12 max-w-3xl">
            <div className="flex size-12 items-center justify-center border border-white/10 bg-white/5"><Scale className="size-6 text-gold" /></div>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[.2em] text-gold">Cadre d&apos;utilisation</p>
            <h1 className="mt-3 font-semibold text-4xl leading-[1.02] tracking-[-.04em] sm:text-5xl lg:text-6xl">Conditions Générales d&apos;Utilisation</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">Les règles qui encadrent l&apos;utilisation du site, de ses contenus et de ses services de mise en relation.</p>
            <p className="mt-6 text-xs text-white/40">Dernière mise à jour : Mars 2025</p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10 lg:py-20">
        <aside className="hidden lg:block"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-forest">Navigation</p><div className="mt-4 border-l border-border pl-4 text-xs leading-6 text-muted-foreground">Objet<br />Accès<br />Contenu<br />Propriété<br />Responsabilité<br />Données<br />Juridiction</div></aside>
        <div className="space-y-4">
          {sections.map(({ icon: Icon, title, content }) => <article key={title} className="border border-border bg-white p-6 sm:p-8"><div className="flex gap-4"><div className="flex size-9 shrink-0 items-center justify-center border border-charcoal/10 bg-charcoal/5"><Icon className="size-4 text-charcoal" /></div><div className="min-w-0"><h2 className="text-base font-semibold tracking-[-.01em] sm:text-lg">{title}</h2><p className="mt-3 text-sm leading-7 text-charcoal/70">{content}</p></div></div></article>)}
          <div className="border border-border bg-sand/30 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-forest">Une question ?</p><p className="mt-2 text-sm text-charcoal/70">Notre équipe peut vous orienter vers le bon interlocuteur.</p><Button onClick={() => router.goContact()} className="mt-5 min-h-11 bg-charcoal text-white hover:bg-charcoal/90">Nous contacter <ChevronRight className="ml-2 size-4" /></Button><a href="mailto:asas.agency.dz@gmail.com" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-forest"><Mail className="size-3.5" /> asas.agency.dz@gmail.com</a></div>
        </div>
      </section>
    </main>
  );
}
