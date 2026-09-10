'use client';

import { Mail, MapPin, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/shared/LeadForm';
import { ASAS, getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';

const contactWhatsAppUrl = getWhatsAppUrl('Bonjour, je souhaite échanger avec ASAS au sujet de mon projet immobilier.');

export default function ContactPageV2() {
  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Contact</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.05fr_.75fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl lg:leading-[1.04]">Un échange simple pour avancer sur votre projet immobilier.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Que vous cherchiez un logement ou souhaitiez parler d’une opération immobilière, choisissez le moyen de contact qui vous convient.</p>
            </div>
            <div className="border-l border-white/15 pl-6 lg:pl-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">ASAS</p>
              <p className="mt-3 text-xl font-medium">{ASAS.fullName}</p>
              <p className="mt-2 text-sm leading-6 text-white/60">{ASAS.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-12">
          <a href={contactWhatsAppUrl} target="_blank" rel="noreferrer" className="group flex min-h-24 items-center gap-4 py-7 md:pr-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"><MessageCircle className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold">WhatsApp</span><span className="mt-1 block text-xs text-muted-foreground">Échanger directement</span></span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
          <a href={getPhoneUrl()} className="group flex min-h-24 items-center gap-4 border-t border-border py-7 md:border-l md:border-t-0 md:px-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"><Phone className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold">Téléphone</span><span className="mt-1 block text-xs text-muted-foreground">{ASAS.phone}</span></span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
          <a href={`mailto:${ASAS.email}`} className="group flex min-h-24 items-center gap-4 border-t border-border py-7 md:border-l md:border-t-0 md:px-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"><Mail className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold">E-mail</span><span className="mt-1 block break-all text-xs text-muted-foreground">{ASAS.email}</span></span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12 lg:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Votre demande</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Dites-nous ce dont vous avez besoin.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">Le formulaire permet de transmettre votre demande sans multiplier les étapes. Ajoutez les informations utiles à votre recherche ou à votre projet.</p>
          <div className="mt-9 space-y-5">
            <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-forest" /><p className="text-sm leading-6 text-muted-foreground">ASAS — Agence de Commercialisation Immobilière</p></div>
            <div className="border-l-2 border-gold bg-sand/25 p-5"><p className="text-sm font-semibold">Après votre message</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Votre demande est transmise à l’équipe ASAS afin de poursuivre l’échange avec le contexte que vous avez fourni.</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
          <LeadForm intent="REQUEST_INFORMATION" showWhatsApp={true} showPhone={true} />
        </div>
      </section>

      <section className="border-t border-white/10 bg-forest text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Besoin d’une réponse rapide ?</p><h2 className="mt-2 text-2xl font-semibold">Échangez directement avec ASAS.</h2></div>
          <Button asChild className="min-h-12 bg-gold px-6 text-charcoal hover:bg-gold/90"><a href={contactWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> Ouvrir WhatsApp</a></Button>
        </div>
      </section>
    </main>
  );
}
