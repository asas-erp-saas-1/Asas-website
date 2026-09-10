'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Check, Compass, Megaphone, Search, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/shared/LeadForm';
import { useRouter } from '@/lib/router';

const services = [
  { icon: Compass, title: 'Positionnement', text: 'Clarifier le positionnement du projet, son offre et les arguments qui comptent pour l’acheteur.' },
  { icon: Megaphone, title: 'Mise en marché', text: 'Construire une présentation commerciale cohérente avec le produit, la cible et le niveau de gamme.' },
  { icon: Target, title: 'Acquisition', text: 'Structurer les points de contact et les campagnes autour d’une intention d’achat réelle.' },
  { icon: Users, title: 'Commercialisation', text: 'Transformer l’intérêt en échanges qualifiés, visites et opportunités commerciales.' },
  { icon: BarChart3, title: 'Pilotage', text: 'Suivre les signaux utiles et ajuster les actions à partir des retours du terrain.' },
];

const process = [
  ['01', 'Diagnostic', 'Projet, offre, cible, marché et actifs commerciaux disponibles.'],
  ['02', 'Positionnement', 'Message commercial, hiérarchie de l’offre et parcours prospect.'],
  ['03', 'Activation', 'Supports, présence digitale et acquisition adaptés au projet.'],
  ['04', 'Conversion', 'Qualification, prise de contact, visite et suivi commercial.'],
];

const deliverables = [
  'Stratégie de commercialisation',
  'Présentation digitale du projet',
  'Supports et contenus commerciaux',
  'Acquisition et qualification des prospects',
  'Suivi des demandes et opportunités',
  'Lecture régulière des performances',
];

export default function ForDevelopersPageV2() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <section className="relative overflow-hidden bg-charcoal">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(180,170,120,0.16),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(34,90,72,0.28),transparent_35%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:px-12 lg:py-28">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Pour les promoteurs</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl lg:leading-[1.04]">
              Votre projet mérite une commercialisation pensée comme un produit immobilier.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              ASAS accompagne la mise en marché de projets immobiliers avec une approche qui relie positionnement, présentation, acquisition et suivi commercial.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => document.getElementById('project-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="h-12 bg-gold px-6 text-charcoal hover:bg-gold/90">
                Présenter mon projet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => router.goContact()} className="h-12 border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                Échanger avec ASAS
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl">
            <img src="/images/projects/les-oliviers-hero.jpg" alt="Projet immobilier présenté par ASAS" className="aspect-[4/3] w-full rounded-xl object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/15 bg-charcoal/85 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">Une approche intégrée</p>
              <p className="mt-1 text-sm text-white/85">Du premier regard jusqu’à la conversation commerciale.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3 lg:px-12">
          {[
            ['Positionner', 'Rendre l’offre lisible et désirable.'],
            ['Présenter', 'Donner les bonnes informations au bon moment.'],
            ['Convertir', 'Créer un chemin simple vers l’échange commercial.'],
          ].map(([title, text], index) => (
            <div key={title} className={`py-7 md:px-8 ${index > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}>
              <p className="text-sm font-semibold text-forest">0{index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Le dispositif</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Un système commercial cohérent, pas une collection d’outils.</h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">Chaque levier doit servir le même objectif : rendre le projet compréhensible, crédible et facile à découvrir.</p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {services.map(({ icon: Icon, title, text }) => (
            <motion.article key={title} whileHover={{ y: -3 }} className="bg-white p-6 sm:p-7">
              <Icon className="h-5 w-5 text-forest" />
              <h3 className="mt-10 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-sand/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Méthode</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Un parcours lisible, du diagnostic au suivi.</h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {process.map(([number, title, text]) => (
                <div key={number} className="grid gap-3 py-6 sm:grid-cols-[64px_180px_1fr] sm:items-start">
                  <span className="text-sm font-semibold text-gold">{number}</span>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-12 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Livrables</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Une base commerciale exploitable.</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/70">Le périmètre est construit autour des besoins réels du projet. Aucun résultat chiffré n’est promis sans données permettant de le mesurer.</p>
          </div>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {deliverables.map((item) => (
              <div key={item} className="flex gap-3 border-b border-white/10 pb-4 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="project-contact" className="scroll-mt-20 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-12 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Parlons du projet</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Présentez-nous votre opération.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">Partagez les premières informations disponibles. Nous pourrons ensuite déterminer si et comment ASAS peut intervenir.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"><Search className="h-4 w-4 text-forest" /> Premier échange centré sur votre projet</div>
          </div>
          <div className="rounded-2xl border border-border bg-ivory p-5 shadow-sm sm:p-8">
            <LeadForm intent="REQUEST_INFORMATION" showWhatsApp={true} showPhone={true} />
          </div>
        </div>
      </section>
    </main>
  );
}
