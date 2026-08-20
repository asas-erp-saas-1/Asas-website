'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/lib/toast-store';
import { trackEvent } from '@/lib/analytics';

interface NewsletterFormProps {
  /** Variant controls the layout: 'inline' for compact horizontal use, 'stacked' for vertical. */
  variant?: 'inline' | 'stacked';
  /** Source attribution stored with the subscription. */
  source?: string;
  /** Optional placeholder override. */
  placeholder?: string;
  /** Optional className for the root element. */
  className?: string;
  /** Optional button label override. */
  buttonLabel?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterForm({
  variant = 'inline',
  source = 'FOOTER',
  placeholder = 'Votre adresse e-mail',
  className = '',
  buttonLabel = "S'inscrire",
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setStatus('error');
      setErrorMessage("Adresse e-mail invalide");
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      // Capture UTM params from URL for attribution
      const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
      const utmSource = url?.searchParams.get('utm_source') ?? undefined;
      const utmMedium = url?.searchParams.get('utm_medium') ?? undefined;
      const utmCampaign = url?.searchParams.get('utm_campaign') ?? undefined;

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          source,
          locale: 'fr',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Échec de l'inscription");
      }

      setStatus('success');
      setEmail('');
      trackEvent('newsletter_subscribe', { source, email_domain: trimmedEmail.split('@')[1] });
      addToast({
        title: 'Inscription réussie !',
        description: data.alreadySubscribed
          ? 'Vous étiez déjà inscrit à notre newsletter.'
          : data.reactivated
            ? 'Votre inscription a été réactivée avec succès.'
            : 'Merci ! Vous recevrez nos nouvelles offres et projets.',
        variant: 'success',
      });

      // Reset success state after 3s so the form returns to idle
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      const message = err instanceof Error ? err.message : "Échec de l'inscription";
      setErrorMessage(message);
      addToast({
        title: 'Erreur',
        description: message,
        variant: 'error',
      });
    }
  };

  const isInline = variant === 'inline';

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${isInline ? 'flex-col sm:flex-row gap-3' : 'flex-col gap-3'} ${className}`}
      noValidate
    >
      <div className="relative flex-1">
        <Mail
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
            status === 'error' ? 'text-red-500' : 'text-muted-foreground'
          }`}
          aria-hidden="true"
        />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder={placeholder}
          disabled={status === 'loading' || status === 'success'}
          aria-label="Adresse e-mail"
          aria-invalid={status === 'error'}
          className={`w-full pl-10 pr-4 py-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-colors disabled:opacity-60 ${
            status === 'error' ? 'border-red-400' : 'border-border'
          }`}
        />
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`${isInline ? 'sm:flex-shrink-0 sm:w-auto w-full' : 'w-full'}`}
      >
        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`w-full bg-forest hover:bg-forest-dark text-white relative overflow-hidden group`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === 'loading' ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Inscription...
              </motion.span>
            ) : status === 'success' ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </motion.span>
                Inscrit !
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {buttonLabel}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Sparkle decoration on idle state */}
          {status === 'idle' && (
            <motion.span
              className="absolute -top-1 -right-1 pointer-events-none"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.8, 0.4],
                rotate: [0, 15, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-3 h-3 text-white/60" />
            </motion.span>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {status === 'error' && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-600 flex items-center gap-1.5 mt-1"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
