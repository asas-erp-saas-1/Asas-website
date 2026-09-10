'use client';

import { ArrowRight, BookOpen, Building2, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';

const topics = [
  { label: "Guide d'achat", title: "Choisir un logement avec méthode", text: "Les points à vérifier avant de comparer deux biens : emplacement, surface, plans, prestations et informations contractuelles." },
  { label: 'Projet immobilier', title: 'Lire une fiche projet sans se perdre', text: "Comment passer rapidement des informations générales aux éléments qui comptent réellement pour votre décision." },
  { label: 'Appartement', title: 'Comparer plusieurs logements objectivement', text: "Une grille simple pour mettre en regard typologie, surface, étage, prix et disponibilité lorsqu'ils sont publiés." },
  { label: 'Accompagnement', title: 'Quand demander l’aide d’un conseiller', text: "Les bonnes questions à préparer avant une visite ou une demande d'information auprès d'ASAS." },
  { label: 'Promoteurs', title: 'Préparer la commercialisation d’un programme', text: "Les informations qui rendent un programme plus lisible pour les futurs acquéreurs et facilitent le passage au contact." },
  { label: 'Décision', title: 'Préparer une visite utile', text: "Les éléments à examiner sur place et les informations à demander avant de prendre une décision." },
];

export default function InsightsPageV2() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const visible = topics.filter((item) => `${item.label} ${item.title} ${item.text}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="bg-ivory text-charcoal">
      <section className="bg-charcoal text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-12 lg:pb-24 lg:pt-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Ressources ASAS</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-7xl">Mieux comprendre avant de choisir.</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Des ressources pratiques pour lire un projet, comparer un logement et préparer un échange avec un conseiller immobilier.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.goProjects()} className="min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">Voir les projets <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => router.goContact()} className="min-h-12 border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">Parler à un conseiller</Button>
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <BookOpen className="h-7 w-7 text-gold" />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/50">Notre principe</p>
            <p className="mt-3 font-serif text-2xl leading-tight">L’information doit réduire l’incertitude, pas ajouter du bruit.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:px-12">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une ressource" aria-label="Rechercher une ressource" className="h-11 w-full border border-border bg-ivory pl-10 pr-4 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" />
          </div>
          <p className="text-sm text-muted-foreground">{visible.length} ressource{visible.length > 1 ? 's' : ''}</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">À consulter</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Des réponses organisées autour de vos décisions.</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {visible.map((item, index) => (
              <article key={item.title} className="group bg-white p-7 transition-colors hover:bg-sand/30 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">{item.label}</span>
                  <span className="text-xs text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-serif text-2xl leading-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.text}</p>
                <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-charcoal">Explorer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
              </article>
            ))}
          </div>
          {visible.length === 0 && <div className="border border-border bg-white px-6 py-14 text-center text-sm text-muted-foreground">Aucune ressource ne correspond à votre recherche.</div>}
        </div>
      </section>

      <section className="border-y border-border bg-sand/25 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Avant de décider</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Commencez par les informations réellement disponibles.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['Prix et disponibilité publiés', 'Plans et caractéristiques disponibles', 'Informations du projet', 'Échange direct avec ASAS'].map((item) => (
              <div key={item} className="flex gap-3 border border-border bg-white p-5 text-sm leading-6"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold"><ShieldCheck className="h-4 w-4" /> ASAS Immobilier</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Vous avez déjà un projet en tête ?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Passez de l’information à une demande concrète : projet, appartement, visite ou question spécifique.</p>
          </div>
          <Button onClick={() => router.goContact()} className="min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">Parler à un conseiller <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section>
    </main>
  );
}
