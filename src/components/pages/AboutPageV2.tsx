'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Eye, Handshake, Target, TrendingUp } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { ASAS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const principles = [
  {
    icon: Target,
    title: 'Clarté commerciale',
    text: 'Présenter chaque programme avec des informations compréhensibles, utiles et directement exploitables.',
  },
  {
    icon: Eye,
    title: 'Présentation exigeante',
    text: 'Mettre le projet, ses espaces et ses caractéristiques au centre de l’expérience acquéreur.',
  },
  {
    icon: Handshake,
    title: 'Accompagnement humain',
    text: 'Rendre simple le passage de la découverte à l’échange avec un conseiller ASAS.',
  },
  {
    icon: TrendingUp,
    title: 'Performance commerciale',
    text: 'Associer stratégie, acquisition digitale et suivi commercial pour mieux servir les projets.',
  },
];

const journey = [
  ['01', 'Positionner', 'Clarifier le projet, son marché et les arguments qui comptent pour l’acquéreur.'],
  ['02', 'Présenter', 'Transformer les informations immobilières en une expérience de découverte structurée.'],
  ['03', 'Qualifier', 'Faciliter une prise de contact pertinente, sans multiplier les étapes inutiles.'],
  ['04', 'Accompagner', 'Maintenir un échange humain jusqu’à la prochaine décision du client.'],
];

export default function AboutPageV2() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory text-foreground">
      <section className="relative isolate overflow-hidden bg-forest text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(199,164,92,0.18),transparent_32%),linear-gradient(135deg,rgba(0,0,0,0.08),transparent_55%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              {ASAS.fullName}
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl lg:leading-[0.98]">
              Commercialiser l’immobilier avec plus de clarté.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {ASAS.tagline}. Nous concevons une expérience qui aide l’acquéreur à comprendre le projet, comparer ses options et avancer avec un interlocuteur humain.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.goProjects()} className="min-h-12 bg-white px-6 text-forest hover:bg-white/90">
                Découvrir nos projets <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => router.goContact()} className="min-h-12 border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">
                Parler à un conseiller
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl"
          >
            <img src="/images/brand/about-asas.jpg" alt="ASAS — agence de commercialisation immobilière" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-6 pt-20">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Notre approche</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/90">Une présentation premium, une information lisible et une action évidente à chaque étape.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {[
            ['Pour les acquéreurs', 'Découvrir, comprendre et demander les informations utiles.'],
            ['Pour les promoteurs', 'Structurer la commercialisation et développer la demande qualifiée.'],
            ['Pour les équipes', 'Relier marketing, inventaire et suivi commercial dans un même parcours.'],
          ].map(([title, text]) => (
            <div key={title} className="px-0 py-7 md:px-7 lg:py-8 first:md:pl-0 last:md:pr-0">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Ce que nous défendons</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Une agence immobilière pensée autour de la décision.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Notre rôle ne se limite pas à générer de la visibilité. Nous cherchons à rendre l’offre immobilière plus lisible et le chemin vers la prise de contact plus naturel.</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.05, duration: 0.45 }}
                  className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/8 text-forest">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Notre méthode</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Du premier regard à la prochaine décision.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Chaque étape doit réduire une incertitude et donner une raison claire d’avancer.</p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {journey.map(([number, title, text]) => (
              <div key={number} className="grid gap-4 py-7 sm:grid-cols-[56px_180px_1fr] sm:items-start">
                <span className="text-sm font-semibold tabular-nums text-gold">{number}</span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-charcoal px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">ASAS</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Vous avez un projet immobilier à découvrir ?</h2>
            <p className="mt-4 text-sm leading-6 text-white/65 sm:text-base">Consultez les programmes actuellement présentés par ASAS ou échangez directement avec un conseiller.</p>
          </div>
          <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:ml-10">
            <Button onClick={() => router.goProjects()} className="min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">Voir les projets <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => router.goContact()} className="min-h-12 border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">Nous contacter</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
