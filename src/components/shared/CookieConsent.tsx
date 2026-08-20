'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, BarChart3, Megaphone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/lib/constants';

const CONSENT_KEY = 'asas_cookie_consent';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const defaultPreferences: Omit<CookiePreferences, 'timestamp'> = {
  essential: true,
  analytics: false,
  marketing: false,
};

const cookieCategories = [
  {
    key: 'essential' as const,
    label: 'Essentiels',
    description:
      'Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.',
    icon: Shield,
    required: true,
  },
  {
    key: 'analytics' as const,
    label: 'Analytique',
    description:
      'Nous aident à comprendre comment les visiteurs interagissent avec le site.',
    icon: BarChart3,
    required: false,
  },
  {
    key: 'marketing' as const,
    label: 'Marketing',
    description:
      'Utilisés pour afficher des publicités pertinentes et suivre l\'efficacité des campagnes.',
    icon: Megaphone,
    required: false,
  },
];

function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function saveConsent(prefs: Omit<CookiePreferences, 'timestamp'>): void {
  const data: CookiePreferences = { ...prefs, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay so the page loads first, then banner slides up
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    saveConsent({ essential: true, analytics: true, marketing: true });
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    saveConsent({ essential: true, analytics: false, marketing: false });
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences);
    setDialogOpen(false);
    setVisible(false);
  }, [preferences]);

  const togglePreference = useCallback(
    (key: 'essential' | 'analytics' | 'marketing') => {
      if (key === 'essential') return; // Cannot toggle essential
      setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    []
  );

  return (
    <>
      {/* Main consent banner */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 1 }}
            className="fixed bottom-0 left-0 right-0 z-[60] w-full"
          >
            <div className="w-full border-t border-forest/10 bg-ivory/80 backdrop-blur-xl supports-[backdrop-filter]:bg-ivory/70">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
                {/* Left: icons + text */}
                <div className="flex items-start gap-3 sm:items-center">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Cookie className="h-5 w-5 text-forest" />
                    <Shield className="h-4 w-4 text-forest/60" />
                  </div>
                  <div className="text-sm leading-relaxed text-charcoal/80">
                    <p>
                      Nous utilisons des cookies pour améliorer votre expérience, analyser le
                      trafic et proposer du contenu personnalisé. En cliquant sur
                      «&nbsp;Accepter&nbsp;», vous consentez à l&apos;utilisation de tous les
                      cookies.
                    </p>
                    <a
                      href={ROUTES.PRIVACY}
                      className="inline-flex items-center gap-1 mt-1 font-medium text-forest underline underline-offset-2 transition-colors hover:text-forest-dark"
                    >
                      <Info className="w-3 h-3" />
                      Politique de confidentialité
                    </a>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPreferences((prev) => ({
                        ...prev,
                        // Reset to current stored or defaults when opening
                        analytics: getStoredConsent()?.analytics ?? prev.analytics,
                        marketing: getStoredConsent()?.marketing ?? prev.marketing,
                      }));
                      setDialogOpen(true);
                    }}
                    className="text-sm font-medium text-forest underline underline-offset-2 transition-colors hover:text-forest-dark"
                  >
                    Personnaliser
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="border-forest/30 text-forest hover:bg-forest/5 font-medium"
                  >
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="bg-forest text-ivory shadow-sm hover:bg-forest-dark font-medium shadow-forest/20"
                  >
                    Accepter
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie preferences dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-forest" />
              Paramètres des cookies
            </DialogTitle>
            <DialogDescription>
              Gérez vos préférences en matière de cookies. Les cookies essentiels ne
              peuvent pas être désactivés car ils sont nécessaires au bon fonctionnement
              du site.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {cookieCategories.map((cat) => {
              const Icon = cat.icon;
              const isChecked = preferences[cat.key];
              return (
                <div
                  key={cat.key}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-forest/70" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-charcoal">
                        {cat.label}
                      </span>
                      <Switch
                        checked={isChecked}
                        disabled={cat.required}
                        onCheckedChange={() => togglePreference(cat.key)}
                        className={
                          cat.required
                            ? 'data-[state=checked]:bg-forest/60'
                            : 'data-[state=checked]:bg-forest'
                        }
                      />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPreferences({ essential: true, analytics: false, marketing: false });
              }}
              className="border-forest/30 text-forest hover:bg-forest/5 font-medium"
            >
              Tout refuser
            </Button>
            <Button
              size="sm"
              onClick={handleSavePreferences}
              className="bg-forest text-ivory shadow-sm hover:bg-forest-dark font-medium shadow-forest/20"
            >
              Enregistrer mes choix
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
