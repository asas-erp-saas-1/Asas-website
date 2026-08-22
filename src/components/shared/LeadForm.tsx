'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEAD_INTENT_LABELS, getWhatsAppUrl, getPhoneUrl } from '@/lib/constants';
import { CheckCircle, Loader2, AlertCircle, MessageCircle, Phone, User, Mail, CircleDollarSign, FileText, CalendarCheck, BookmarkCheck, PhoneCall as PhoneCallIcon, Info } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import type { Lead } from '@/lib/lead-contracts';

const leadFormSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (min. 2 caracteres)'),
  phone: z.string().min(10, 'Numero de telephone invalide').regex(/^(\+213|0)[5-7]\d{8}$/, 'Format algerien requis (ex: 0555123456)'),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
  intent: z.string().min(1, 'Veuillez selectionner un motif'),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;
const INTENT_ICON_MAP: Record<string, typeof Info> = {
  REQUEST_INFORMATION: Info, REQUEST_PRICE: CircleDollarSign, REQUEST_FLOOR_PLAN: FileText,
  BOOK_VISIT: CalendarCheck, WHATSAPP: MessageCircle, CALL: PhoneCallIcon, RESERVATION: BookmarkCheck,
};

interface LeadFormProps { projectId?: string; projectName?: string; apartmentId?: string; apartmentName?: string; intent?: string; showWhatsApp?: boolean; showPhone?: boolean; compact?: boolean; onClose?: () => void; }

export function LeadForm({ projectId, projectName, apartmentId, apartmentName, intent: defaultIntent, showWhatsApp, showPhone, compact, onClose }: LeadFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [formStarted, setFormStarted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [honeypot, setHoneypot] = useState('');
  useEffect(() => { if (typeof window === 'undefined') return; const params = new URLSearchParams(window.location.search); const utm: Record<string,string> = {}; ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'].forEach(k => { const v=params.get(k); if(v) utm[k]=v; }); setUtmParams(utm); }, []);
  const { register, handleSubmit, setValue, watch, formState:{errors} } = useForm<LeadFormData>({ resolver:zodResolver(leadFormSchema), defaultValues:{name:'',phone:'',email:'',intent:defaultIntent??'',message:''} });
  const watchedValues=watch(); const nameValue=watchedValues.name; const phoneValue=watchedValues.phone;
  const requiredProgress=useMemo(()=>((nameValue&&nameValue.length>=2)?1:0)+((phoneValue&&/^(\+213|0)[5-7]\d{8}$/.test(phoneValue))?1:0),[nameValue,phoneValue]);
  const isFieldValid=(field:string)=>field==='name'?!!nameValue&&nameValue.length>=2:field==='phone'?!!phoneValue&&/^(\+213|0)[5-7]\d{8}$/.test(phoneValue):field==='email'?!!watchedValues.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email):false;
  const onSubmit=async(data:LeadFormData)=>{ setStatus('loading'); trackEvent('form_submit',{form_id:'shared_lead_form',intent:data.intent,project_name:projectName??'',apartment_name:apartmentName??''}); const lead:Lead={name:data.name,phone:data.phone,email:data.email||undefined,intent:data.intent,message:data.message||undefined,projectId,projectName,apartmentId,apartmentName,pageUrl:typeof window!=='undefined'?window.location.href:undefined,utmSource:utmParams.utm_source,utmMedium:utmParams.utm_medium,utmCampaign:utmParams.utm_campaign,utmContent:utmParams.utm_content,utmTerm:utmParams.utm_term,gclid:utmParams.gclid,fbclid:utmParams.fbclid,referrer:typeof document!=='undefined'?document.referrer:undefined,source:'WEBSITE',website:honeypot}; try{const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead)});if(!res.ok)throw new Error('Erreur lors de l\'envoi');setStatus('success');trackEvent('form_success',{form_id:'shared_lead_form',intent:data.intent});}catch{setStatus('error');trackEvent('form_failure',{form_id:'shared_lead_form',reason:'network_or_server_error'});}};
  const focusGlowStyle=(field:string)=>focusedField===field?'ring-2 ring-forest/40 border-forest shadow-[0_0_0_3px_rgba(34,139,34,0.15)]':'';
  if(status==='success') return <div className="flex flex-col items-center justify-center gap-4 py-10 text-center"><CheckCircle className="size-12 text-forest"/><h3 className="text-xl font-bold">Merci pour votre intérêt</h3><p className="text-sm text-muted-foreground max-w-sm">Votre demande a bien été reçue. Un conseiller ASAS vous contactera prochainement.</p>{onClose&&<Button variant="outline" size="sm" onClick={onClose}>Fermer</Button>}</div>;
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulaire de contact">
    <div className="absolute -left-[9999px] -top-[9999px] w-px h-px overflow-hidden" aria-hidden="true"><label htmlFor="website">Ne pas remplir</label><input id="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/></div>
    <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden"><div className="absolute left-0 top-0 h-full rounded-full bg-forest" style={{width:`${requiredProgress*50}%`}}/></div>
    {(projectName||apartmentName)&&<div className="rounded-lg bg-forest/5 border border-forest/20 px-3 py-2 text-xs text-forest font-medium">{projectName&&<span>Projet : {projectName}</span>}{apartmentName&&<span className="block">Appartement : {apartmentName}</span>}</div>}
    <div className="space-y-1.5"><label htmlFor="lead-name" className="text-sm font-medium">Nom *</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input id="lead-name" placeholder="Votre nom complet" className={`pl-9 ${focusGlowStyle('name')}`} {...register('name')} onFocus={()=>{setFocusedField('name');if(!formStarted){setFormStarted(true);trackEvent('form_start',{form_id:'shared_lead_form'});}}} onBlurCapture={()=>setFocusedField(null)}/>{touchedFields.has('name')&&isFieldValid('name')&&<CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest"/>}</div>{errors.name&&<p className="text-xs text-destructive"><AlertCircle className="size-3 inline mr-1"/>{errors.name.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-phone" className="text-sm font-medium">Telephone *</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input id="lead-phone" type="tel" placeholder="0555 12 34 56" className={`pl-9 ${focusGlowStyle('phone')}`} {...register('phone')} onFocus={()=>setFocusedField('phone')} onBlurCapture={()=>setFocusedField(null)}/>{touchedFields.has('phone')&&isFieldValid('phone')&&<CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest"/>}</div>{errors.phone&&<p className="text-xs text-destructive"><AlertCircle className="size-3 inline mr-1"/>{errors.phone.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-email" className="text-sm font-medium">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input id="lead-email" type="email" placeholder="votre@email.com" className={`pl-9 ${focusGlowStyle('email')}`} {...register('email')} onFocus={()=>setFocusedField('email')} onBlurCapture={()=>setFocusedField(null)}/></div>{errors.email&&<p className="text-xs text-destructive">{errors.email.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-intent" className="text-sm font-medium">Motif *</label><Select value={watchedValues.intent} onValueChange={v=>setValue('intent',v,{shouldValidate:true})}><SelectTrigger id="lead-intent"><SelectValue placeholder="Choisissez votre demande"/></SelectTrigger><SelectContent>{Object.entries(LEAD_INTENT_LABELS).map(([key,label])=>{const Icon=INTENT_ICON_MAP[key]??Info;return <SelectItem key={key} value={key}><span className="flex items-center gap-2"><Icon className="size-4"/>{label}</span></SelectItem>})}</SelectContent></Select>{errors.intent&&<p className="text-xs text-destructive">{errors.intent.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-message" className="text-sm font-medium">Message</label><Textarea id="lead-message" placeholder="Votre demande..." rows={compact?3:4} {...register('message')}/></div>
    <Button type="submit" disabled={status==='loading'} className="w-full bg-forest hover:bg-forest-dark text-white">{status==='loading'?<><Loader2 className="size-4 animate-spin mr-2"/>Envoi...</>:'Envoyer ma demande'}</Button>
    {status==='error'&&<p className="text-xs text-destructive"><AlertCircle className="size-3 inline mr-1"/>Une erreur est survenue. Veuillez réessayer.</p>}
    {(showWhatsApp||showPhone)&&<div className="flex gap-2">{showWhatsApp&&<a href={getWhatsAppUrl(`Bonjour, je souhaite des informations sur ${projectName??'un bien ASAS'}.`)} target="_blank" rel="noreferrer" className="flex-1"><Button type="button" variant="outline" className="w-full"><MessageCircle className="size-4 mr-2"/>WhatsApp</Button></a>}{showPhone&&<a href={getPhoneUrl()} className="flex-1"><Button type="button" variant="outline" className="w-full"><Phone className="size-4 mr-2"/>Appeler</Button></a>}</div>}
  </form>;
}
