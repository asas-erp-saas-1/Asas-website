'use client';

import { useMemo } from 'react';
import { Scale, ArrowRight, Building2, Maximize, Layers, Compass, Bed, Bath, DoorOpen, Car, CircleDollarSign, Trophy, MessageCircle, Tag } from 'lucide-react';
import { useComparison } from '@/lib/favorites';
import { useApartmentsByIds } from '@/lib/api';
import { useRouter } from '@/lib/router';
import { useUI } from '@/lib/ui-store';
import { useIsClient } from '@/lib/use-is-client';
import { formatPrice, formatSurface, getWhatsAppUrl } from '@/lib/constants';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { PublicApartmentCard } from '@/lib/catalog-contracts';

interface CompareModalProps { open?: boolean; onOpenChange?: (open: boolean) => void; }
interface RowDef { key:string; label:string; icon:React.ComponentType<{className?:string}>; render:(a:PublicApartmentCard)=>React.ReactNode; compareValue?:(a:PublicApartmentCard)=>number|null; }

const ROWS: RowDef[] = [
 {key:'type',label:'Type',icon:Building2,render:a=><Badge className="bg-forest text-white">{a.typeName}</Badge>},
 {key:'surface',label:'Surface',icon:Maximize,render:a=><span className="text-base font-bold text-foreground">{formatSurface(a.surface)}</span>},
 {key:'floor',label:'Étage',icon:Layers,render:a=>a.floor!=null?<span className="font-medium">{a.floor}{a.totalFloors?`/${a.totalFloors}`:''}</span>:<span className="text-muted-foreground">—</span>},
 {key:'orientation',label:'Orientation',icon:Compass,render:a=>a.orientation?<span className="font-medium">{a.orientation}</span>:<span className="text-muted-foreground">—</span>},
 {key:'bedrooms',label:'Chambres',icon:Bed,render:a=><span className="font-medium">{a.bedrooms}</span>,compareValue:a=>a.bedrooms},
 {key:'bathrooms',label:'SDB',icon:Bath,render:a=>a.bathrooms!=null?<span className="font-medium">{a.bathrooms}</span>:<span className="text-muted-foreground">—</span>,compareValue:a=>a.bathrooms??null},
 {key:'balconies',label:'Balcons',icon:DoorOpen,render:a=>a.balconies!=null&&a.balconies>0?<span className="font-medium">{a.balconies}{a.balconySurface?` (${a.balconySurface} m²)`:''}</span>:<span className="text-muted-foreground">—</span>,compareValue:a=>a.balconies??0},
 {key:'parking',label:'Parking',icon:Car,render:a=>a.hasParking?<span className="font-medium text-forest">{a.parkingSpots??1} place{(a.parkingSpots??1)>1?'s':''}</span>:<span className="text-muted-foreground">Non</span>},
 {key:'price',label:'Prix',icon:CircleDollarSign,render:a=>a.priceOnRequest||!a.price?<span className="text-muted-foreground text-xs">Prix sur demande</span>:<span className="text-base font-bold text-forest">{formatPrice(a.price)}</span>},
 {key:'pricePerM2',label:'Prix / m²',icon:CircleDollarSign,render:a=>a.priceOnRequest||!a.price?<span className="text-muted-foreground text-xs">—</span>:<span className="font-medium text-foreground">{formatPrice(Math.round(a.price/a.surface))}</span>,compareValue:a=>a.priceOnRequest||!a.price?null:a.price/a.surface},
 {key:'status',label:'Statut',icon:Tag,render:a=><StatusBadge status={a.status} type="apartment"/>},
];

export function CompareModal({open,onOpenChange}:CompareModalProps){
 const compareList=useComparison(s=>s.compareList); const router=useRouter(); const uiModalOpen=useUI(s=>s.compareModalOpen); const setCompareModalOpen=useUI(s=>s.setCompareModalOpen); const isClient=useIsClient();
 const effectiveCompareList=isClient?compareList:[]; const isOpen=open!==undefined?open:uiModalOpen;
 const handleOpenChange=(next:boolean)=>{onOpenChange?.(next); if(open===undefined)setCompareModalOpen(next);};
 const {data:apartments}=useApartmentsByIds(effectiveCompareList);
 const sortedApartments=useMemo<PublicApartmentCard[]>(()=>{if(!apartments)return []; return effectiveCompareList.flatMap(id=>{const apartment=apartments.find(a=>a.id===id); return apartment?[apartment]:[];});},[apartments,effectiveCompareList]);
 const bestApartmentId=useMemo(()=>{let bestId:string|null=null;let bestValue=Infinity;for(const a of sortedApartments){if(a.priceOnRequest||a.price==null||a.surface<=0)continue;const v=a.price/a.surface;if(v<bestValue){bestValue=v;bestId=a.id;}}return bestId;},[sortedApartments]);
 const handleViewApartment=(projectSlug:string,apartmentSlug:string)=>{handleOpenChange(false);router.goApartment(projectSlug,apartmentSlug);};
 return <Dialog open={isOpen} onOpenChange={handleOpenChange}><DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0"><DialogHeader className="px-5 sm:px-6 py-4 border-b border-border bg-forest/5 shrink-0"><DialogTitle className="flex items-center gap-2 text-foreground"><Scale className="size-5 text-forest"/>Comparaison d'appartements</DialogTitle><DialogDescription>{sortedApartments.length>0?`Comparaison de ${sortedApartments.length} appartement${sortedApartments.length>1?'s':''}.`:'Aucun appartement à comparer.'}</DialogDescription></DialogHeader>{sortedApartments.length===0?<EmptyState icon={Scale} title="Aucun appartement à comparer" description="Ajoutez au moins 2 appartements à votre comparaison pour voir leurs caractéristiques côte à côte." actionLabel="Découvrir les projets" onAction={()=>{router.goProjects();setCompareModalOpen(false);}} size="sm"/>:<div className="overflow-auto custom-scrollbar p-4 sm:p-6 max-h-[60vh]"><div className="overflow-x-auto custom-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6"><table className="w-full border-separate border-spacing-0 text-sm"><thead><tr><th className="sticky left-0 z-10 bg-background w-32 sm:w-40 p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Caractéristique</th>{sortedApartments.map(a=>{const isBest=a.id===bestApartmentId;return <th key={a.id} className={`p-3 text-left border-b border-border min-w-[180px] align-top ${isBest?'bg-gold/10':'bg-background'}`}><div className="flex flex-col gap-1.5">{isBest&&<Badge className="bg-gold/20 text-gold border border-gold/30 text-[10px] w-fit"><Trophy className="size-3"/>Meilleur rapport</Badge>}<div className="flex items-center gap-1.5"><Building2 className="size-4 text-forest shrink-0"/><span className="font-bold text-foreground">{a.typeName}</span></div><span className="text-xs text-muted-foreground">{a.project?.name}</span></div></th>;})}</tr></thead><tbody>{ROWS.map(row=>{const RowIcon=row.icon;return <tr key={row.key}><td className="sticky left-0 z-10 bg-background p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap"><div className="flex items-center gap-1.5"><RowIcon className="size-3.5 text-forest/70"/>{row.label}</div></td>{sortedApartments.map(a=>{const isBest=row.key==='pricePerM2'&&a.id===bestApartmentId;return <td key={`${row.key}-${a.id}`} className={`p-3 border-b border-border ${isBest?'bg-gold/5':a.id===bestApartmentId?'bg-gold/[0.03]':'bg-background'}`}><div className="flex items-center gap-1.5">{row.render(a)}{isBest&&<Trophy className="size-3.5 text-gold shrink-0"/>}</div></td>;})}</tr>;})}</tbody><tfoot><tr><td className="sticky left-0 z-10 bg-background p-3 border-b-0"/>{sortedApartments.map(a=><td key={`cta-${a.id}`} className="p-3 bg-background"><div className="flex flex-col gap-1.5"><Button size="sm" className="bg-forest hover:bg-forest-dark text-white w-full" onClick={()=>handleViewApartment(a.project?.slug??'',a.slug)}>Voir la fiche<ArrowRight className="size-3.5"/></Button><a href={getWhatsAppUrl(`Bonjour, je suis intéressé(e) par l'appartement ${a.typeName} (${formatSurface(a.surface)}) dans le projet ${a.project?.name}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex"><Button size="sm" variant="outline" className="w-full border-forest/30 text-forest hover:bg-forest/5"><MessageCircle className="size-3.5"/>WhatsApp</Button></a></div></td>)}</tr></tfoot></table></div></div>}<div className="px-5 sm:px-6 py-3 border-t border-border bg-muted/30 shrink-0"><Button variant="outline" onClick={()=>handleOpenChange(false)} className="w-full sm:w-auto">Fermer</Button></div></DialogContent></Dialog>;
}
