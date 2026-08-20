'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAD_INTENTS, LEAD_INTENT_LABELS, getWhatsAppUrl, getPhoneUrl, ASAS } from '@/lib/constants';
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  MessageCircle,
  Phone,
  User,
  Mail,
  MessageSquare,
  CircleDollarSign,
  FileText,
  CalendarCheck,
  BookmarkCheck,
  PhoneCall as PhoneCallIcon,
  Package,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import type { Lead } from '@/lib/types';

const leadFormSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (min. 2 caracteres)'),
  phone: z.string().min(10, 'Numero de telephone invalide').regex(/^(\+213|0)[5-7]\d{8}$/, 'Format algerien requis (ex: 0555123456)'),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
  intent: z.string().min(1, 'Veuillez selectionner un motif'),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

/** Map intent keys to icons */
const INTENT_ICON_MAP: Record<string, typeof Info> = {
  REQUEST_INFORMATION: Info,
  REQUEST_PRICE: CircleDollarSign,
  REQUEST_FLOOR_PLAN: FileText,
  BOOK_VISIT: CalendarCheck,
  WHATSAPP: MessageCircle,
  CALL: PhoneCallIcon,
  RESERVATION: BookmarkCheck,
};

interface LeadFormProps {
  projectId?: string;
  projectName?: string;
  apartmentId?: string;
  apartmentName?: string;
  intent?: string;
  showWhatsApp?: boolean;
  showPhone?: boolean;
  compact?: boolean;
  onClose?: () => void;
}

export function LeadForm({
  projectId,
  projectName,
  apartmentId,
  apartmentName,
  intent: defaultIntent,
  showWhatsApp,
  showPhone,
  compact,
  onClose,
}: LeadFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [formStarted, setFormStarted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  // Honeypot — bots fill it, humans never see it. Server rejects if non-empty.
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    // Capture UTM params from URL
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });
    setUtmParams(utm);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      intent: defaultIntent ?? '',
      message: '',
    },
  });

  // Watch field values for progress and validation indicators
  const watchedValues = watch();
  const nameValue = watchedValues.name;
  const phoneValue = watchedValues.phone;

  // Progress indicator: 2 required fields (name + phone)
  const requiredProgress = useMemo(() => {
    let filled = 0;
    if (nameValue && nameValue.length >= 2) filled++;
    if (phoneValue && /^(\+213|0)[5-7]\d{8}$/.test(phoneValue)) filled++;
    return filled;
  }, [nameValue, phoneValue]);

  // Check if a field is valid (for green checkmark display)
  const isFieldValid = (field: string): boolean => {
    switch (field) {
      case 'name':
        return !!nameValue && nameValue.length >= 2;
      case 'phone':
        return !!phoneValue && /^(\+213|0)[5-7]\d{8}$/.test(phoneValue);
      case 'email':
        return !!watchedValues.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email);
      default:
        return false;
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  };

  const onSubmit = async (data: LeadFormData) => {
    setStatus('loading');

    trackEvent('form_submit', {
      form_id: 'shared_lead_form',
      intent: data.intent,
      project_name: projectName ?? '',
      apartment_name: apartmentName ?? '',
    });

    const lead: Lead = {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      intent: data.intent,
      message: data.message || undefined,
      projectId,
      projectName,
      apartmentId,
      apartmentName,
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      utmSource: utmParams.utm_source,
      utmMedium: utmParams.utm_medium,
      utmCampaign: utmParams.utm_campaign,
      utmContent: utmParams.utm_content,
      utmTerm: utmParams.utm_term,
      gclid: utmParams.gclid,
      fbclid: utmParams.fbclid,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      source: 'WEBSITE',
      // Honeypot — sent to the server; if non-empty, the lead is silently dropped.
      website: honeypot,
    } as Lead;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      setStatus('success');
      trackEvent('form_success', {
        form_id: 'shared_lead_form',
        intent: data.intent,
      });
    } catch {
      setStatus('error');
      trackEvent('form_failure', {
        form_id: 'shared_lead_form',
        reason: 'network_or_server_error',
      });
    }
  };

  // Focus ring style with forest-green glow
  const focusGlowStyle = (fieldName: string): string => {
    if (focusedField === fieldName) {
      return 'ring-2 ring-forest/40 border-forest shadow-[0_0_0_3px_rgba(34,139,34,0.15)]';
    }
    return '';
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
          }}
          className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 12,
              delay: 0.15,
            }}
          >
            <CheckCircle className="size-8 text-forest" />
          </motion.div>
        </motion.div>
        <h3 className="text-xl font-bold text-foreground">
          Merci pour votre intérêt
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Votre demande a bien été reçue. Un conseiller ASAS vous contactera prochainement.
        </p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
            Fermer
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulaire de contact">
      {/* Honeypot field — visually hidden, bots auto-fill it, real users never see it.
          Server-side rejection: see /api/leads/route.ts (website field non-empty → 201 + hp-blocked). */}
      <div className="absolute -left-[9999px] -top-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir (anti-spam)</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      {/* Progress indicator bar */}
      <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-forest"
          initial={{ width: '0%' }}
          animate={{ width: `${(requiredProgress / 2) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
        <span className="sr-only">{requiredProgress} champs requis sur 2 remplis</span>
      </div>

      {/* Context indicator */}
      {(projectName || apartmentName) && (
        <div className="rounded-lg bg-forest/5 border border-forest/20 px-3 py-2 text-xs text-forest font-medium">
          {projectName && <span>Projet : {projectName}</span>}
          {apartmentName && <span className="block">Appartement : {apartmentName}</span>}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="lead-name" className="text-sm font-medium text-foreground">
          Nom <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="lead-name"
            placeholder="Votre nom complet"
            className={`pl-9 ${focusGlowStyle('name')}`}
            {...register('name', {
              onBlur: () => handleFieldBlur('name'),
            })}
            onFocus={() => {
              setFocusedField('name');
              if (!formStarted) {
                setFormStarted(true);
                trackEvent('form_start', { form_id: 'shared_lead_form' });
              }
            }}
            onBlurCapture={() => setFocusedField(null)}
            aria-invalid={!!errors.name}
          />
          <AnimatePresence>
            {touchedFields.has('name') && isFieldValid('name') && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle className="h-4 w-4 text-forest" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {errors.name && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="size-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label htmlFor="lead-phone" className="text-sm font-medium text-foreground">
          Telephone <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="lead-phone"
            type="tel"
            placeholder="0555 12 34 56"
            className={`pl-9 ${focusGlowStyle('phone')}`}
            {...register('phone', {
              onBlur: () => handleFieldBlur('phone'),
            })}
            onFocus={() => setFocusedField('phone')}
            onBlurCapture={() => setFocusedField(null)}
            aria-invalid={!!errors.phone}
          />
          <AnimatePresence>
            {touchedFields.has('phone') && isFieldValid('phone') && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle className="h-4 w-4 text-forest" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="size-3" />
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Email (optional) */}
      <div className="space-y-1.5">
        <label htmlFor="lead-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="lead-email"
            type="email"
            placeholder="votre@email.com"
            className={`pl-9 ${focusGlowStyle('email')}`}
            {...register('email', {
              onBlur: () => handleFieldBlur('email'),
            })}
            onFocus={() => setFocusedField('email')}
            onBlurCapture={() => setFocusedField(null)}
            aria-invalid={!!errors.email}
          />
          <AnimatePresence>
            {touchedFields.has('email') && isFieldValid('email') && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle className="h-4 w-4 text-forest" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {errors.email && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="size-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Intent */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Motif <span className="text-destructive">*</span>
        </label>
        <Select
          defaultValue={defaultIntent ?? ''}
          onValueChange={(value) => setValue('intent', value, { shouldValidate: true })}
        >
          <SelectTrigger
            className={`w-full ${focusGlowStyle('intent')}`}
            aria-invalid={!!errors.intent}
            onFocus={() => setFocusedField('intent')}
            onBlur={() => setFocusedField(null)}
          >
            <SelectValue placeholder="Selectionnez un motif" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEAD_INTENT_LABELS).map(([key, label]) => {
              const IntentIcon = INTENT_ICON_MAP[key] ?? Package;
              return (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <IntentIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.intent && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="size-3" />
            {errors.intent.message}
          </p>
        )}
      </div>

      {/* Message (optional) */}
      <div className="space-y-1.5">
        <label htmlFor="lead-message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Textarea
            id="lead-message"
            placeholder="Votre message (optionnel)"
            rows={3}
            className={`pl-9 ${focusGlowStyle('message')}`}
            {...register('message')}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
      </div>

      {/* Submit */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="w-full bg-forest hover:bg-forest-dark text-white"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer ma demande'
          )}
        </Button>
      </motion.div>

      {/* WhatsApp & Phone CTAs */}
      {(showWhatsApp || showPhone) && (
        <div className="flex gap-2">
          {showWhatsApp && (
            <a
              href={getWhatsAppUrl(projectName ? `Bonjour, je suis intéressé(e) par ${projectName}.` : 'Bonjour, je cherche un appartement.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button type="button" variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </a>
          )}
          {showPhone && (
            <a href={getPhoneUrl()} className="flex-1">
              <Button type="button" variant="outline" className="w-full border-forest text-forest hover:bg-forest/5">
                <Phone className="size-4" />
                Appeler
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>Une erreur est survenue. Veuillez réessayer.</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Vos données sont traitées conformément à notre politique de confidentialité.
      </p>
    </form>
  );
}
