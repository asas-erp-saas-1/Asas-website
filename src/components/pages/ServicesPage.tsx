'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Check, Handshake, Search, Target, Users, WalletCards, Megaphone, MessageCircle } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const services = [
  { icon: Target, number: '01', title: 'Positionnement', text: 'Clarifier le projet, son marché, sa cible et sa proposition de valeur avant sa mise en commercialisation.', items: ['Analyse du projet', 'Positionnement commercial', 'Segmentation des acquéreurs'] },
  { icon: Megaphone, number: '02', title: 'Mise en marché', text: 'Construire une présentation cohérente du programme et déployer les supports nécessaires à sa commercialisation.', items: ['Direction du message', 'Supports de présentation', 'Landing pages projet'] },
  { icon: Users, number: '03', title: 'Acquisition', text: 'Attirer des prospects pertinents et faciliter leur passage de la découverte à la prise de contact.', items: ['Campagnes digitales', 'Génération de leads', 'Suivi des sources'] },
  { icon: Handshake, number: '04', title: 'Commercialisation', text: 'Accompagner les prospects avec une information claire, des disponibilités actualisées et une relation humaine.', items: ['Qualification', 'Visites', 'Suivi commercial'] },
  { icon: BarChart3, number: '05', title: 'Pilotage', text: 'Lire les signaux commerciaux et ajuster les actions pour garder une commercialisation lisible et maîtrisée.', items: ['Suivi des demandes', 'Lecture des performances', 'Optimisation continue'] },
];

const process = [
  ['01', 'Comprendre', 'Nous commençons par le projet réel, son contexte et ses objectifs.'],
  ['02', 'Structurer', 'Nous organisons le positionnement, les informations et le parcours commercial.'],
  ['03', 'Déployer', 'Nous mettons en place les supports, les canaux et les points de contact.'],
  ['04', 'Accompagner', 'Nous suivons les prospects et faisons évoluer les actions selon les besoins.'],
];

export default function ServicesPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#17232a]">
      <section className="relative overflow-hidden bg-[#17232a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(185,151,91,.16),transparent_32%),linear-gradient(110deg,#17232a_0%,#17232a_65%,#20342e_100%)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 lg:px-10 lg:pt-24">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#d9b16e]">ASAS · Commercialisation immobilière</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-medium leading-[.98] tracking-[-.04em] sm:text-7xl">Une commercialisation pensée autour du projet.</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Du positionnement à la relation avec l’acquéreur, nous construisons une expérience claire pour présenter, attirer et commercialiser les programmes immobiliers.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" onClick={() => router.goContact()} className="min-h-12 bg-[#d9b16e] px-7 text-[#17232a] hover:bg-[#e6c182]">Parler de votre projet <ArrowRight className="size-4" /></Button><a href={getWhatsAppUrl('Bonjour, je souhaite échanger avec ASAS au sujet de vos services.')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-7 text-sm font-semibold hover:bg-white/10"><MessageCircle className="size-4" />WhatsApp</a></div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5e1d7] bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-3">
          {[['Une présentation claire', 'Le projet reste au centre de chaque point de contact.'], ['Un parcours cohérent', 'Du premier regard à la demande de visite, chaque étape a une fonction.'], ['Une relation humaine', 'Les outils servent la conversation commerciale, pas l’inverse.']].map(([title, text]) => <div key={title} className="border-l border-[#c8aa75] pl-5"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-[#777a72]">{text}</p></div>)}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="mb-10 max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6c806f]">Nos expertises</p><h2 className="mt-3 font-serif text-3xl font-medium tracking-[-.025em] sm:text-4xl">Tout ce qui aide réellement un projet à avancer.</h2></div><div className="grid gap-px overflow-hidden rounded-xl border border-[#ddd9cf] bg-[#ddd9cf] md:grid-cols-2 lg:grid-cols-3">{services.map(({ icon: Icon, number, title, text, items }, index) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .45, delay: index * .04 }} className="group bg-white p-7 sm:p-8"><div className="flex items-start justify-between"><span className="text-xs font-semibold tracking-[.16em] text-[#b9975b]">{number}</span><Icon className="size-5 text-[#17232a] transition-transform duration-300 group-hover:-translate-y-0.5" /></div><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6e726c]">{text}</p><ul className="mt-6 space-y-2 border-t border-[#eeeae2] pt-5">{items.map(item => <li key={item} className="flex gap-2 text-xs text-[#40484d]"><Check className="mt-0.5 size-4 shrink-0 text-[#b9975b]" />{item}</li>)}</ul></motion.article>)}</div></div></section>

      <section className="bg-[#17232a] px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#d9b16e]">Notre méthode</p><h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">Une progression simple, du projet à la décision.</h2></div><div className="mt-12 grid gap-0 border-y border-white/10 md:grid-cols-4">{process.map(([number, title, text]) => <div key={number} className="border-b border-white/10 px-0 py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"><span className="text-xs font-semibold tracking-[.16em] text-[#b9975b]">{number}</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{text}</p></div>)}</div></div></section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10"><div className="mx-auto grid max-w-[1440px] gap-8 overflow-hidden rounded-xl bg-[#eee7da] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6c806f]">Votre projet</p><h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">Vous préparez une commercialisation ?</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#62675f]">Présentez-nous le projet et nous déterminerons ensemble la prochaine étape utile.</p></div><Button size="lg" onClick={() => router.goContact()} className="min-h-12 bg-[#17232a] px-7 text-white hover:bg-[#183c31]">Échanger avec ASAS <ArrowRight className="size-4" /></Button></div></section>

      <section className="border-t border-[#e5e1d7] bg-white px-5 py-7 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5"><div className="flex items-center gap-3"><WalletCards className="size-5 text-[#b9975b]" /><span className="text-sm font-semibold">Vous êtes acquéreur ?</span></div><button type="button" onClick={() => router.goProjects()} className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold">Découvrir les projets <ArrowRight className="size-4" /></button></div></section>
    </main>
  );
}
