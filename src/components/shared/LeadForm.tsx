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
  const markTouched=(field:string)=>setTouchedFields(prev=>new Set(prev).add(field));
  const onSubmit=async(data:LeadFormData)=>{ setStatus('loading'); trackEvent('form_submit',{form_id:'shared_lead_form',intent:data.intent,project_name:projectName??'',apartment_name:apartmentName??''}); const lead:Lead={name:data.name,phone:data.phone,email:data.email||undefined,intent:data.intent,message:data.message||undefined,projectId,projectName,apartmentId,apartmentName,pageUrl:typeof window!=='undefined'?window.location.href:undefined,utmSource:utmParams.utm_source,utmMedium:utmParams.utm_medium,utmCampaign:utmParams.utm_campaign,utmContent:utmParams.utm_content,utmTerm:utmParams.utm_term,gclid:utmParams.gclid,fbclid:utmParams.fbclid,referrer:typeof document!=='undefined'?document.referrer:undefined,source:'WEBSITE',website:honeypot}; try{const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead)});if(!res.ok)throw new Error('Erreur lors de l\'envoi');setStatus('success');trackEvent('form_success',{form_id:'shared_lead_form',intent:data.intent});}catch{setStatus('error');trackEvent('form_failure',{form_id:'shared_lead_form',reason:'network_or_server_error'});}};
  const focusGlowStyle=(field:string)=>focusedField===field?'ring-2 ring-forest/40 border-forest shadow-[0_0_0_3px_rgba(34,139,34,0.15)]':'';
  if(status==='success') return <div className="flex flex-col items-center justify-center gap-4 py-10 text-center" role="status" aria-live="polite"><CheckCircle className="size-12 text-forest" aria-hidden="true"/><h3 className="text-xl font-bold">Merci pour votre intérêt</h3><p className="text-sm text-muted-foreground max-w-sm">Votre demande a bien été reçue. Un conseiller ASAS vous contactera prochainement.</p>{onClose&&<Button variant="outline" size="sm" onClick={onClose}>Fermer</Button>}</div>;
  return <form onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0 space-y-4" aria-label="Formulaire de contact" noValidate>
    <div className="absolute -left-[9999px] -top-[9999px] w-px h-px overflow-hidden" aria-hidden="true"><label htmlFor="website">Ne pas remplir</label><input id="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/></div>
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progression des champs obligatoires" aria-valuemin={0} aria-valuemax={2} aria-valuenow={requiredProgress}><div className="absolute inset-y-0 left-0 rounded-full bg-forest transition-[width] duration-300 motion-reduce:transition-none" style={{width:`${requiredProgress*50}%`}}/></div>
    {(projectName||apartmentName)&&<div className="min-w-0 rounded-lg border border-forest/20 bg-forest/5 px-3 py-2 text-xs font-medium text-forest break-words">{projectName&&<span>Projet : {projectName}</span>}{apartmentName&&<span className="block">Appartement : {apartmentName}</span>}</div>}
    <div className="space-y-1.5"><label htmlFor="lead-name" className="text-sm font-medium">Nom *</label><div className="relative min-w-0"><User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="lead-name" autoComplete="name" placeholder="Votre nom complet" className={`min-h-11 pl-9 pr-10 ${focusGlowStyle('name')}`} {...register('name')} onFocus={()=>{setFocusedField('name');if(!formStarted){setFormStarted(true);trackEvent('form_start',{form_id:'shared_lead_form'});}}} onBlur={()=>{setFocusedField(null);markTouched('name')}} aria-invalid={!!errors.name} aria-describedby={errors.name?'lead-name-error':undefined}/>{touchedFields.has('name')&&isFieldValid('name')&&<CheckCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest" aria-hidden="true"/>}</div>{errors.name&&<p id="lead-name-error" className="text-xs text-destructive" role="alert"><AlertCircle className="mr-1 inline size-3" aria-hidden="true"/>{errors.name.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-phone" className="text-sm font-medium">Telephone *</label><div className="relative min-w-0"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="lead-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0555 12 34 56" className={`min-h-11 pl-9 pr-10 ${focusGlowStyle('phone')}`} {...register('phone')} onFocus={()=>setFocusedField('phone')} onBlur={()=>{setFocusedField(null);markTouched('phone')}} aria-invalid={!!errors.phone} aria-describedby={errors.phone?'lead-phone-error':undefined}/>{touchedFields.has('phone')&&isFieldValid('phone')&&<CheckCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest" aria-hidden="true"/>}</div>{errors.phone&&<p id="lead-phone-error" className="text-xs text-destructive" role="alert"><AlertCircle className="mr-1 inline size-3" aria-hidden="true"/>{errors.phone.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-email" className="text-sm font-medium">Email</label><div className="relative min-w-0"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="lead-email" type="email" inputMode="email" autoComplete="email" placeholder="votre@email.com" className={`min-h-11 pl-9 pr-10 ${focusGlowStyle('email')}`} {...register('email')} onFocus={()=>setFocusedField('email')} onBlur={()=>{setFocusedField(null);markTouched('email')}} aria-invalid={!!errors.email} aria-describedby={errors.email?'lead-email-error':undefined}/>{errors.email&&<p id="lead-email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>}</div></div>
    <div className="space-y-1.5"><label htmlFor="lead-intent" className="text-sm font-medium">Motif *</label><Select value={watchedValues.intent} onValueChange={v=>{setValue('intent',v,{shouldValidate:true,shouldDirty:true});markTouched('intent')}}><SelectTrigger id="lead-intent" className="min-h-11" aria-invalid={!!errors.intent} aria-describedby={errors.intent?'lead-intent-error':undefined}><SelectValue placeholder="Choisissez votre demande"/></SelectTrigger><SelectContent className="max-h-[min(22rem,calc(100dvh-8rem))]">{Object.entries(LEAD_INTENT_LABELS).map(([key,label])=>{const Icon=INTENT_ICON_MAP[key]??Info;return <SelectItem key={key} value={key} className="min-h-11"><span className="flex min-w-0 items-center gap-2"><Icon className="size-4 shrink-0" aria-hidden="true"/><span className="min-w-0 break-words">{label}</span></span></SelectItem>})}</SelectContent></Select>{errors.intent&&<p id="lead-intent-error" className="text-xs text-destructive" role="alert">{errors.intent.message}</p>}</div>
    <div className="space-y-1.5"><label htmlFor="lead-message" className="text-sm font-medium">Message</label><Textarea id="lead-message" autoComplete="off" placeholder="Votre demande..." rows={compact?3:4} className="min-h-24 resize-y" {...register('message')} /></div>
    <Button type="submit" disabled={status==='loading'} className="min-h-11 w-full bg-forest text-white hover:bg-forest-dark">{status==='loading'?<><Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true"/>Envoi...</>:'Envoyer ma demande'}</Button>
    {status==='error'&&<p className="text-xs text-destructive" role="alert" aria-live="assertive"><AlertCircle className="mr-1 inline size-3" aria-hidden="true"/>Une erreur est survenue. Veuillez réessayer.</p>}
    {(showWhatsApp||showPhone)&&<div className="flex min-w-0 flex-col gap-2 sm:flex-row">{showWhatsApp&&<a href={getWhatsAppUrl(`Bonjour, je souhaite des informations sur ${projectName??'un bien ASAS'}.`)} target="_blank" rel="noreferrer" className="min-w-0 flex-1"><Button type="button" variant="outline" className="min-h-11 w-full"><MessageCircle className="mr-2 size-4 shrink-0"/>WhatsApp</Button></a>}{showPhone&&<a href={getPhoneUrl()} className="min-w-0 flex-1"><Button type="button" variant="outline" className="min-h-11 w-full"><Phone className="mr-2 size-4 shrink-0"/>Appeler</Button></a>}</div>}
  </form>;
}
