'use client';

import { ArrowLeft, ArrowRight, Building2, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/router';

export default function NotFoundPage() {
  const router = useRouter();
  return (
    <main className="min-h-[72vh] bg-ivory text-charcoal">
      <section className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-24">
        <div>
          <button type="button" onClick={() => router.goHome()} className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground hover:text-charcoal"><ArrowLeft className="size-4" /> Accueil</button>
          <p className="mt-12 text-[11px] font-semibold uppercase tracking-[.2em] text-forest">ASAS Immobilier</p>
          <h1 className="mt-4 font-semibold text-5xl leading-[.95] tracking-[-.05em] sm:text-6xl lg:text-8xl">404</h1>
          <h2 className="mt-6 max-w-xl text-2xl font-semibold tracking-[-.03em] sm:text-3xl">Cette page n&apos;est plus à l&apos;adresse attendue.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">Revenez à l&apos;accueil ou explorez directement les projets immobiliers actuellement publiés.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => router.goHome()} className="min-h-12 bg-charcoal px-6 text-white hover:bg-charcoal/90"><Home className="mr-2 size-4" /> Retour à l&apos;accueil</Button>
            <Button variant="outline" onClick={() => router.goProjects()} className="min-h-12 border-border bg-white px-6"><Building2 className="mr-2 size-4" /> Voir les projets <ArrowRight className="ml-2 size-4" /></Button>
          </div>
        </div>
        <div className="relative overflow-hidden border border-border bg-charcoal p-6 text-white sm:p-10 lg:min-h-[420px]">
          <div className="flex h-full min-h-[320px] flex-col justify-between">
            <div className="flex size-11 items-center justify-center border border-white/10 bg-white/5"><Search className="size-5 text-gold" /></div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-gold">Reprendre la recherche</p>
              <p className="mt-3 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">Trouvez un projet, vérifiez une disponibilité, puis passez à la visite.</p>
              <button type="button" onClick={() => router.goProjects()} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/25 underline-offset-8 hover:decoration-white">Explorer le catalogue <ArrowRight className="size-4" /></button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
