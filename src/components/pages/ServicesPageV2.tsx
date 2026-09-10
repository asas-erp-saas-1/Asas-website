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
    <main className="min-h-screen bg-ivory">
      <section className="bg-forest px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Services ASAS</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl lg:leading-[1]">Une commercialisation pensée comme un parcours.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">De la stratégie au contact commercial, nous construisons une expérience qui rend le projet plus lisible et facilite le passage à l’action.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.goContact()} className="min-h-12 bg-white px-6 text-forest hover:bg-white/90">Parler de votre projet <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => router.goProjects()} className="min-h-12 border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">Voir nos projets</Button>
            </div>
          </div>
          <div className="border-l border-white/15 pl-6 lg:pl-8">
            <p className="text-sm leading-6 text-white/60">Notre priorité</p>
            <p className="mt-2 text-xl font-medium leading-8">Réduire les frictions entre la découverte d’un programme et la conversation qui permet de décider.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ['Pour les promoteurs', 'Un dispositif commercial cohérent autour de chaque programme.'],
            ['Pour les acquéreurs', 'Une information plus claire avant de demander un échange.'],
            ['Pour la vente', 'Des parcours qui rapprochent marketing, inventaire et conversation.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-border bg-ivory p-6">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Notre offre</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Les briques qui composent une commercialisation solide.</h2>
          </div>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.number} className="grid gap-5 py-7 md:grid-cols-[64px_280px_1fr] md:items-start">
                  <span className="text-sm font-semibold tabular-nums text-gold">{service.number}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-forest"><Icon className="h-4 w-4" /></span>
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{service.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Méthode</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Un processus lisible, du brief au suivi.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Nous organisons le travail autour de décisions commerciales concrètes plutôt qu’autour d’une accumulation d’outils.</p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {process.map(([title, text], index) => (
              <div key={title} className="grid gap-3 py-6 sm:grid-cols-[44px_150px_1fr]">
                <span className="text-sm font-semibold tabular-nums text-gold">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-3xl bg-charcoal px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Parlons commercialisation</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Vous préparez un programme immobilier ?</h2>
            <p className="mt-4 text-sm leading-6 text-white/65 sm:text-base">Présentez-nous votre projet et échangez avec ASAS sur la manière de structurer sa commercialisation.</p>
          </div>
          <Button onClick={() => router.goContact()} className="mt-8 min-h-12 bg-white px-6 text-charcoal hover:bg-white/90 lg:mt-0 lg:ml-10">Nous contacter <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section>
    </main>
  );
}
