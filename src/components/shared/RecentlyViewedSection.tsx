'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Trash2, Building2, Maximize } from 'lucide-react';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { useApartmentsByIds } from '@/lib/api';
import { useIsClient } from '@/lib/use-is-client';
import { useRouter } from '@/lib/router';
import { trackEvent } from '@/lib/analytics';
import { useToastStore } from '@/lib/toast-store';
import { formatPrice, formatSurface } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { PublicApartmentCard } from '@/lib/catalog-contracts';

const fadeUp={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{duration:0.5}}};

export function RecentlyViewedSection(){
 const recentlyViewed=useRecentlyViewed(s=>s.recentlyViewed); const clearRecentlyViewed=useRecentlyViewed(s=>s.clearRecentlyViewed); const isClient=useIsClient(); const router=useRouter(); const addToast=useToastStore(s=>s.addToast);
 const effectiveIds=isClient?recentlyViewed:[]; const {data:apartments,isLoading}=useApartmentsByIds(effectiveIds);
 const sortedApartments=useMemo<PublicApartmentCard[]>(()=>{if(!apartments)return [];return effectiveIds.flatMap(id=>{const apartment=apartments.find(a=>a.id===id);return apartment?[apartment]:[];});},[apartments,effectiveIds]);
 if(effectiveIds.length===0)return null;
 const handleClear=()=>{const count=effectiveIds.length;clearRecentlyViewed();trackEvent('recently_viewed_clear',{count});addToast({title:'Historique effacé',description:count>1?`${count} appartements retirés`:undefined,variant:'default'});};
 const handleView=(apartment:PublicApartmentCard)=>{const projectSlug=apartment.project?.slug??'';if(projectSlug)router.goApartment(projectSlug,apartment.slug);};
 return <section className="py-10 px-4 bg-background" aria-label="Appartements vus récemment"><div className="max-w-6xl mx-auto"><motion.div initial="hidden" whileInView="visible" viewport={{once:true,margin:'-60px'}} variants={fadeUp} className="flex items-end justify-between gap-3 mb-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0"><Clock className="h-5 w-5 text-forest"/></div><div><h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Vus récemment</h2><p className="text-xs md:text-sm text-muted-foreground">Reprenez là où vous vous êtes arrêté</p></div></div><Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0" aria-label="Effacer l'historique des appartements vus récemment"><Trash2 className="size-4"/><span className="hidden sm:inline">Effacer l&apos;historique</span></Button></motion.div><motion.div initial="hidden" whileInView="visible" viewport={{once:true,margin:'-60px'}} variants={fadeUp} className="flex gap-4 overflow-x-auto custom-scrollbar-x pb-3 -mx-1 px-1 snap-x snap-mandatory">{isLoading&&!apartments?Array.from({length:Math.min(effectiveIds.length,4)}).map((_,i)=><div key={`rv-skel-${i}`} className="shrink-0 w-64 sm:w-72 rounded-xl border border-border bg-card p-4 space-y-3 snap-start"><div className="flex items-center justify-between"><Skeleton className="h-5 w-16 rounded"/><Skeleton className="h-5 w-20 rounded"/></div><Skeleton className="h-8 w-28"/><Skeleton className="h-4 w-40"/><Skeleton className="h-9 w-full rounded-md"/></div>):sortedApartments.map(apartment=><div key={apartment.id} className="group shrink-0 w-64 sm:w-72 rounded-xl border border-border bg-card p-4 hover:shadow-lg hover:border-forest/30 transition-all duration-300 snap-start flex flex-col gap-3 card-glow"><div className="flex items-center justify-between gap-2"><Badge className="bg-forest text-white text-xs font-bold">{apartment.typeName}</Badge><StatusBadge status={apartment.status} type="apartment"/></div><div className="flex items-baseline gap-2 flex-wrap"><span className="inline-flex items-center gap-1 text-2xl font-bold text-forest"><Maximize className="size-4 text-forest/70"/>{formatSurface(apartment.surface)}</span>{apartment.price&&!apartment.priceOnRequest&&<span className="text-sm font-semibold text-foreground">· {formatPrice(apartment.price)}</span>}{apartment.priceOnRequest&&<span className="text-xs text-muted-foreground">· Prix sur demande</span>}</div>{apartment.project&&<div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0"><Building2 className="size-3.5 shrink-0"/><span className="truncate">{apartment.project.name}{apartment.project.city&&` · ${apartment.project.city}`}</span></div>}<Button size="sm" className="bg-forest hover:bg-forest-dark text-white mt-auto w-full" onClick={()=>handleView(apartment)} disabled={!apartment.project?.slug} aria-label={`Voir l'appartement ${apartment.typeName}`}>Voir<ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"/></Button></div>)}</motion.div></div></section>;
}
