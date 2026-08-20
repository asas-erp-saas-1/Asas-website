'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { LEAD_INTENTS, getWhatsAppUrl } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import type { Lead } from '@/lib/types';

// ─── Props ───────────────────────────────────────────────────────────
interface BookingCalendarProps {
  projectName: string;
  apartmentName?: string;
}

// ─── Constants ───────────────────────────────────────────────────────
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] as const;

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;

type Step = 'date' | 'time' | 'form' | 'success';

// ─── Form schema ─────────────────────────────────────────────────────
const bookingSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (min. 2 caractères)'),
  phone: z
    .string()
    .min(10, 'Numéro de téléphone invalide')
    .regex(/^(\+213|0)[5-7]\d{8}$/, 'Format algérien requis (ex: 0555123456)'),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns 0=Mon … 6=Sun (ISO weekday) */
function getISODay(date: Date): number {
  const d = date.getDay(); // 0=Sun … 6=Sat
  return d === 0 ? 6 : d - 1;
}

function formatDateFR(date: Date): string {
  const day = date.getDate();
  const month = MONTH_LABELS[date.getMonth()];
  const weekday = DAY_LABELS[getISODay(date)];
  return `${weekday} ${day} ${month}`;
}

// ─── Component ───────────────────────────────────────────────────────
export function BookingCalendar({ projectName, apartmentName }: BookingCalendarProps) {
  // State
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  // Calendar navigation — start at current month
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // UTM params
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
    keys.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });
    setUtmParams(utm);
  }, []);

  // ── Calendar grid ────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = getISODay(firstDay); // 0-6 blank cells before day 1

    const cells: (Date | null)[] = [];
    // blanks
    for (let i = 0; i < startOffset; i++) cells.push(null);
    // days
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

    return cells;
  }, [viewYear, viewMonth]);

  // Max date = 14 days from today
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 14);
    return d;
  }, [today]);

  function isDayDisabled(date: Date): boolean {
    if (date < today) return true;
    if (date > maxDate) return true;
    if (getISODay(date) === 6) return true; // Sunday = index 6 in ISO
    return false;
  }

  function isDaySelected(date: Date): boolean {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  }

  // Navigation bounds
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const maxMonth = maxDate.getMonth();
  const maxYear = maxDate.getFullYear();
  const canGoNext = viewYear < maxYear || (viewYear === maxYear && viewMonth < maxMonth);

  // ── Form ─────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const onSubmit = async (data: BookingFormData) => {
    setSubmitStatus('loading');

    trackEvent('form_submit', {
      form_id: 'booking_calendar',
      intent: LEAD_INTENTS.BOOK_VISIT,
      project_name: projectName,
      apartment_name: apartmentName ?? '',
    });

    const dateStr = selectedDate ? formatDateFR(selectedDate) : '';
    const lead: Lead = {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      intent: LEAD_INTENTS.BOOK_VISIT,
      message: `Visite planifiée : ${dateStr} à ${selectedTime}`,
      projectName,
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
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'envoi');

      setStep('success');
      trackEvent('form_success', {
        form_id: 'booking_calendar',
        intent: LEAD_INTENTS.BOOK_VISIT,
      });
    } catch {
      setSubmitStatus('error');
      trackEvent('form_failure', {
        form_id: 'booking_calendar',
        reason: 'network_or_server_error',
      });
    }
  };

  // ── WhatsApp URL ─────────────────────────────────────────────────
  const whatsappMessage = useMemo(() => {
    const parts = ['Bonjour, je souhaite planifier une visite'];
    if (projectName) parts.push(`pour le projet ${projectName}`);
    if (apartmentName) parts.push(`- appartement ${apartmentName}`);
    if (selectedDate && selectedTime) {
      parts.push(`le ${formatDateFR(selectedDate)} à ${selectedTime}`);
    }
    return parts.join(' ') + '.';
  }, [projectName, apartmentName, selectedDate, selectedTime]);

  const whatsappUrl = getWhatsAppUrl(whatsappMessage);

  // ── Animations ───────────────────────────────────────────────────
  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-xl border border-forest/20 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-forest px-4 py-3 flex items-center gap-2">
        <Calendar className="size-4 text-white" />
        <h3 className="text-sm font-semibold text-white">
          Planifier une visite
        </h3>
      </div>

      {/* Context */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-muted-foreground">
          {projectName}
          {apartmentName && <> · {apartmentName}</>}
        </p>
      </div>

      {/* Step indicator */}
      <div className="px-4 pb-2 flex items-center gap-1">
        {(['date', 'time', 'form'] as const).map((s, i) => {
          const stepOrder: Record<Step, number> = { date: 0, time: 1, form: 2, success: 3 };
          const active = stepOrder[step] >= i;
          return (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`size-1.5 rounded-full transition-colors ${
                  active ? 'bg-forest' : 'bg-forest/20'
                }`}
              />
              {i < 2 && (
                <div
                  className={`h-px w-4 transition-colors ${
                    stepOrder[step] > i ? 'bg-forest' : 'bg-forest/20'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="px-4 pb-4 relative overflow-hidden" style={{ minHeight: 200 }}>
        <AnimatePresence mode="wait">
          {/* ───── DATE STEP ───── */}
          {step === 'date' && (
            <motion.div
              key="date"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Month nav */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!canGoPrev) return;
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear((y) => y - 1);
                    } else {
                      setViewMonth((m) => m - 1);
                    }
                  }}
                  disabled={!canGoPrev}
                  className="p-1 rounded-md hover:bg-forest/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft className="size-4 text-foreground" />
                </button>

                <span className="text-sm font-semibold text-foreground">
                  {MONTH_LABELS[viewMonth]} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (!canGoNext) return;
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear((y) => y + 1);
                    } else {
                      setViewMonth((m) => m + 1);
                    }
                  }}
                  disabled={!canGoNext}
                  className="p-1 rounded-md hover:bg-forest/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Mois suivant"
                >
                  <ChevronRight className="size-4 text-foreground" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-medium text-muted-foreground uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`blank-${idx}`} />;
                  }

                  const disabled = isDayDisabled(date);
                  const selected = isDaySelected(date);
                  const isToday =
                    date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() &&
                    date.getDate() === today.getDate();

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                        setStep('time');
                        trackEvent('form_start', { form_id: 'booking_calendar' });
                      }}
                      className={`
                        relative flex items-center justify-center size-8 rounded-lg text-xs font-medium
                        transition-all duration-150
                        ${disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-foreground hover:bg-forest/10 cursor-pointer'}
                        ${selected ? 'bg-forest text-white hover:bg-forest-dark hover:text-white' : ''}
                        ${isToday && !selected ? 'ring-1 ring-forest/40' : ''}
                      `}
                      aria-label={formatDateFR(date)}
                    >
                      {date.getDate()}
                      {isToday && (
                        <span className={`absolute bottom-0.5 size-1 rounded-full ${selected ? 'bg-white' : 'bg-forest'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                Dimanches non disponibles
              </p>
            </motion.div>
          )}

          {/* ───── TIME STEP ───── */}
          {step === 'time' && (
            <motion.div
              key="time"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Back & selected date */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('date');
                    setSelectedTime(null);
                  }}
                  className="p-1 rounded-md hover:bg-forest/10 transition-colors"
                  aria-label="Retour à la sélection de date"
                >
                  <ChevronLeft className="size-4 text-foreground" />
                </button>
                <div className="flex items-center gap-1.5 text-sm font-medium text-forest">
                  <Calendar className="size-3.5" />
                  {selectedDate && formatDateFR(selectedDate)}
                </div>
              </div>

              {/* Time slots */}
              <p className="text-xs text-muted-foreground mb-2">
                <Clock className="inline size-3 mr-1 -mt-0.5" />
                Choisissez un créneau horaire
              </p>

              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedTime(slot);
                        setStep('form');
                      }}
                      className={`
                        flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium
                        transition-all duration-150
                        ${isSelected
                          ? 'border-forest bg-forest text-white'
                          : 'border-forest/20 text-foreground hover:border-forest hover:bg-forest/5'
                        }
                      `}
                    >
                      <Clock className="size-3.5" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ───── FORM STEP ───── */}
          {step === 'form' && (
            <motion.div
              key="form"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Back & selected date/time */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('time');
                    setSelectedTime(null);
                  }}
                  className="p-1 rounded-md hover:bg-forest/10 transition-colors"
                  aria-label="Retour au choix d'horaire"
                >
                  <ChevronLeft className="size-4 text-foreground" />
                </button>
                <div className="flex items-center gap-2 text-xs text-forest font-medium">
                  <Calendar className="size-3.5" />
                  {selectedDate && formatDateFR(selectedDate)}
                  <span className="text-forest/40">·</span>
                  <Clock className="size-3.5" />
                  {selectedTime}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Name */}
                <div className="space-y-1">
                  <label htmlFor="booking-name" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <User className="size-3" />
                    Nom <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="booking-name"
                    placeholder="Votre nom complet"
                    className="h-9 text-sm"
                    {...register('name')}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label htmlFor="booking-phone" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Phone className="size-3" />
                    Téléphone <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    placeholder="0555 12 34 56"
                    className="h-9 text-sm"
                    {...register('phone')}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="booking-email" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    Email
                  </label>
                  <Input
                    id="booking-email"
                    type="email"
                    placeholder="votre@email.com"
                    className="h-9 text-sm"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-forest hover:bg-forest-dark text-white h-9 text-sm"
                  disabled={submitStatus === 'loading'}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Confirmer la visite'
                  )}
                </Button>

                {/* Error */}
                {submitStatus === 'error' && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="size-3.5 shrink-0" />
                    Une erreur est survenue. Veuillez réessayer.
                  </div>
                )}
              </form>

              {/* WhatsApp alternative */}
              <div className="mt-3">
                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/15" />
                  </div>
                  <span className="relative bg-white px-2 text-[10px] text-muted-foreground uppercase">
                    ou
                  </span>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 h-9 text-sm"
                  >
                    <MessageCircle className="size-4" />
                    Contactez-nous sur WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          )}

          {/* ───── SUCCESS STEP ───── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="size-7 text-forest" />
              </div>
              <h4 className="text-base font-bold text-foreground mb-1">
                Votre visite est planifiée !
              </h4>
              <p className="text-xs text-muted-foreground max-w-[220px] mb-3">
                Un conseiller ASAS vous contactera pour confirmer votre rendez-vous.
              </p>
              {selectedDate && selectedTime && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-forest/5 border border-forest/20 px-3 py-1.5 text-xs font-medium text-forest">
                  <Calendar className="size-3.5" />
                  {formatDateFR(selectedDate)}
                  <span className="text-forest/40">·</span>
                  <Clock className="size-3.5" />
                  {selectedTime}
                </div>
              )}

              {/* WhatsApp follow-up */}
              <div className="mt-4 w-full max-w-[240px]">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 h-9 text-xs"
                  >
                    <MessageCircle className="size-3.5" />
                    Confirmer sur WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      {step !== 'success' && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            Vos données sont traitées conformément à notre politique de confidentialité.
          </p>
        </div>
      )}
    </div>
  );
}
