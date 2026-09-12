'use client';

import { useEffect, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Building2, CheckCircle2, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getCampaign } from '@/lib/campaigns';
import { useProjects } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { ASAS, getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/shared/LeadForm';

interface CampaignLandingPageProps { campaignSlug: string; }

function findProjectSlug(projects: { name: string; slug: string }[] | undefined, projectName?: string): string | undefined {
  if (!projects || !projectName) return undefined;
  return projects.find((project) => project.name.toLowerCase().includes(projectName.toLowerCase()))?.slug;
}

export default function CampaignLandingPageV2({ campaignSlug }: CampaignLandingPageProps) {
  const router = useRouter();
  const campaign = getCampaign(campaignSlug);
  const { data: projects } = useProjects();
  const projectSlug = useMemo(() => findProjectSlug(projects, campaign?.projectName), [projects, campaign?.projectName]);

  useEffect(() => {
    if (!campaign) return;
    trackEvent('campaign_view', { campaign_slug: campaign.slug, campaign_title: campaign.title, project_name: campaign.projectName ?? '' });
  }, [campaign]);

  if (!campaign) {
    return <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-5"><div className="max-w-md text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">ASAS</p><h1 className="mt-4 text-3xl font-semibold text-charcoal">Campagne introuvable</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">La page demandée n’existe pas ou n’est plus disponible.</p><Button onClick={() => router.goHome()} className="mt-7 min-h-12 bg-charcoal text-white hover:bg-charcoal/90"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l’accueil</Button></div></main>;
  }

  const handlePrimary = () => {
    trackEvent('campaign_cta_click', { campaign_slug: campaign.slug, cta_label: campaign.ctaPrimary, cta_position: 'hero' });
    document.getElementById('campaign-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleProject = () => {
    trackEvent('campaign_cta_click', { campaign_slug: campaign.slug, cta_label: campaign.ctaSecondary ?? 'Voir le projet', cta_position: 'hero_secondary' });
    if (projectSlug && campaign.apartmentSlug) router.goApartment(projectSlug, campaign.apartmentSlug);
    else if (projectSlug) router.goProject(projectSlug);
    else router.goProjects();
  };

  return <main className="bg-ivory text-charcoal">
    <section className="relative overflow-hidden bg-charcoal text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:px-12 lg:pb-24 lg:pt-20"><div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{campaign.subtitle}</p><h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-7xl lg:leading-[1]">{campaign.headline}</h1><p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">{campaign.subheadline}</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button onClick={handlePrimary} className="min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">{campaign.ctaPrimary}<ArrowRight className="ml-2 h-4 w-4" /></Button>{campaign.ctaSecondary && <Button variant="outline" onClick={handleProject} className="min-h-12 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">{campaign.ctaSecondary}</Button>}</div><div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55"><a href={getPhoneUrl()} className="inline-flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4" /> {ASAS.phone}</a><a href={getWhatsAppUrl(`Bonjour, je suis intéressé(e) par la campagne ${campaign.title}.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a></div></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2"><img src={campaign.image} alt={campaign.headline} className="aspect-[4/3] w-full rounded-xl object-cover" /><div className="border-t border-white/10 px-4 py-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Présentation ASAS</p><p className="mt-2 text-sm text-white/80">Les informations commerciales affichées sur cette page sont à confirmer selon les données actuellement publiées.</p></div></div></div></section>

    <section className="border-b border-border bg-white"><div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-12">{campaign.features.slice(0, 3).map((feature, index) => <div key={feature} className={`py-7 md:px-8 ${index > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}><p className="text-sm font-semibold text-forest">0{index + 1}</p><p className="mt-2 text-sm leading-6 text-charcoal/80">{feature}</p></div>)}</div></section>

    <section id="campaign-contact" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">Votre demande</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Recevez les informations utiles au bon moment.</h2><p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">Transmettez votre demande à ASAS. Le conseiller pourra reprendre le contexte de la campagne et vous orienter vers les informations disponibles.</p><div className="mt-8 space-y-4">{campaign.features.map((feature) => <div key={feature} className="flex gap-3 text-sm text-charcoal/80"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />{feature}</div>)}</div></div><div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8"><LeadForm intent="REQUEST_INFORMATION" showWhatsApp={true} showPhone={true} /></div></div></section>

    {campaign.projectName && <section className="border-y border-border bg-sand/25 px-5 py-20 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div className="overflow-hidden rounded-2xl border border-border bg-white"><img src={campaign.image} alt={campaign.projectName} className="aspect-[4/3] w-full object-cover" loading="lazy" /></div><div><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest"><Building2 className="h-4 w-4" /> Le projet</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{campaign.projectName}</h2><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Explorez le projet et consultez les informations, typologies et disponibilités réellement publiées par ASAS.</p><Button onClick={handleProject} className="mt-7 min-h-12 bg-forest px-6 text-white hover:bg-forest-dark">{campaign.apartmentSlug ? 'Voir le logement' : 'Voir le projet'} <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></section>}

    <section className="bg-forest text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12"><div><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold"><ShieldCheck className="h-4 w-4" /> ASAS</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Une question avant de décider ?</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Échangez directement avec un conseiller et demandez les informations dont vous avez besoin.</p></div><Button onClick={handlePrimary} className="min-h-12 bg-white px-6 text-charcoal hover:bg-white/90">{campaign.ctaPrimary}<ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>
  </main>;
}
