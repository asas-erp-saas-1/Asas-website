'use client';

import { ArrowRight, BarChart3, Compass, Megaphone, MessageSquareText, Target, Users } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Compass,
    number: '01',
    title: 'Positionnement commercial',
    text: 'Clarifier le positionnement du programme, son offre et les arguments à mettre en avant auprès des acquéreurs.',
  },
  {
    icon: Megaphone,
    number: '02',
    title: 'Marketing immobilier',
    text: 'Construire une présence digitale cohérente autour du projet et de ses disponibilités réelles.',
  },
  {
    icon: Target,
    number: '03',
    title: 'Acquisition & leads',
    text: 'Transformer la visibilité en demandes qualifiées avec des parcours conçus pour faciliter la prise de contact.',
  },
  {
    icon: Users,
    number: '04',
    title: 'Vente & accompagnement',
    text: 'Accompagner les prospects dans leur décision avec un échange commercial adapté à leur projet.',
  },
  {
    icon: BarChart3,
    number: '05',
    title: 'Suivi commercial',
    text: 'Donner une lecture structurée de la demande, des échanges et des opportunités commerciales.',
  },
];

const process = [
  ['Comprendre', 'Le programme, son offre, son marché et les attentes de ses acquéreurs.'],
  ['Structurer', 'Le positionnement, les messages, les supports et le parcours commercial.'],
  ['Attirer', 'Une audience pertinente grâce aux canaux et contenus adaptés au projet.'],
  ['Qualifier', 'Les demandes afin de concentrer l’effort commercial sur les prospects pertinents.'],
  ['Accompagner', 'Chaque prospect vers l’information ou l’échange dont il a besoin.'],
  ['Optimiser', 'Le dispositif à partir des retours et des données réellement disponibles.'],
];

export default function ServicesPageV2() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <section className="bg-charcoal text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:px-12 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Services ASAS</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-7xl lg:leading-[1]">Une commercialisation pensée comme un parcours.</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">De la stratégie au contact commercial, nous construisons une expérience qui rend le projet plus lisible et facilite le passage à l’action.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.goContact()} className="min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">Parler de votre projet <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => router.goProjects()} className="min-h-12 border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">Voir nos projets</Button>
            </div>
          </div>
          <div className="border-l border-white/15 pl-6 lg:pl-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Notre priorité</p>
            <p className="mt-4 text-xl font-medium leading-8 text-white/90 sm:text-2xl">Réduire les frictions entre la découverte d’un programme et la conversation qui permet de décider.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div><p className="text-xs uppercase tracking-[0.14em] text-white/45">01</p><p className="mt-1 text-sm text-white/75">Comprendre l’offre</p></div>
              <div><p className="text-xs uppercase tracking-[0.14em] text-white/45">02</p><p className="mt-1 text-sm text-white/75">Faciliter l’échange</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-12">
          {[
            ['Pour les promoteurs', 'Un dispositif commercial cohérent autour de chaque programme.'],
            ['Pour les acquéreurs', 'Une information plus claire avant de demander un échange.'],
            ['Pour la vente', 'Des parcours qui rapprochent marketing, inventaire et conversation.'],
          ].map(([title, text], index) => (
            <div key={title} className={`py-7 md:px-8 ${index > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}>
              <p className="text-sm font-semibold text-forest">0{index + 1}</p>
              <h2 className="mt-2 text-base font-semibold">{title}</h2>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Notre offre</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Les briques qui composent une commercialisation solide.</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">Chaque intervention doit servir une étape précise du parcours commercial. Nous privilégions la cohérence du dispositif plutôt que l’accumulation de canaux.</p>
          </div>
          <div className="mt-12 divide-y divide-border border-y border-border">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.number} className="grid gap-5 py-7 md:grid-cols-[56px_300px_1fr] md:items-start md:py-8">
                  <span className="text-sm font-semibold tabular-nums text-gold">{service.number}</span>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-forest"><Icon className="h-4 w-4" /></span>
                    <h3 className="pt-1 text-lg font-semibold">{service.title}</h3>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{service.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-sand/25 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Méthode</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Un processus lisible, du brief au suivi.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">Nous organisons le travail autour de décisions commerciales concrètes plutôt qu’autour d’une accumulation d’outils.</p>
          </div>
          <div className="divide-y divide-border border-y border-border bg-white/50">
            {process.map(([title, text], index) => (
              <div key={title} className="grid gap-3 px-0 py-6 sm:grid-cols-[48px_160px_1fr] sm:items-start">
                <span className="text-sm font-semibold tabular-nums text-gold">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl rounded-3xl bg-forest px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Parlons commercialisation</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Vous préparez un programme immobilier ?</h2>
              <p className="mt-5 text-sm leading-6 text-white/70 sm:text-base">Présentez-nous votre projet et échangez avec ASAS sur la manière de structurer sa commercialisation.</p>
            </div>
            <div className="lg:justify-self-end">
              <p className="flex items-center gap-2 text-sm text-white/65"><MessageSquareText className="h-4 w-4 text-gold" /> Un premier échange centré sur votre opération.</p>
              <Button onClick={() => router.goContact()} className="mt-5 min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">Nous contacter <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
