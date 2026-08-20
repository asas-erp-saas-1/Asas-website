'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──

export type Locale = 'fr' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LocaleStore {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
}

// ── Store ──

export const useLocale = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'fr',
      direction: 'ltr',
      setLocale: (locale: Locale) =>
        set({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' }),
    }),
    { name: 'asas-locale' }
  )
);

// ── Helpers ──

/**
 * Returns the French or Arabic string based on the current locale.
 * Works outside React components (reads from store directly).
 */
export function t(fr: string, ar?: string): string {
  const locale = useLocale.getState().locale;
  return locale === 'ar' && ar ? ar : fr;
}

/**
 * Applies locale-related DOM attributes to <html>.
 * Call this on mount and when locale changes.
 */
export function applyLocaleToDocument(locale: Locale): void {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const html = document.documentElement;
  html.setAttribute('dir', dir);
  html.setAttribute('lang', locale);
}

// ── NAV labels (bilingual) ──

export const NAV_LABELS = {
  home: { fr: 'Accueil', ar: 'الرئيسية' },
  projects: { fr: 'Projets', ar: 'المشاريع' },
  services: { fr: 'Services', ar: 'الخدمات' },
  forDevelopers: { fr: 'Promoteurs', ar: 'المطورين' },
  about: { fr: 'À Propos', ar: 'من نحن' },
  insights: { fr: 'Insights', ar: 'تحليلات' },
  contact: { fr: 'Contact', ar: 'اتصل بنا' },
} as const;

// ── STATUS labels (bilingual) ──

export const STATUS_LABELS = {
  AVAILABLE: { fr: 'Disponible', ar: 'متاح' },
  RESERVED: { fr: 'Réservé', ar: 'محجوز' },
  SOLD: { fr: 'Vendu', ar: 'مباع' },
  COMING_SOON: { fr: 'Bientôt disponible', ar: 'قريباً' },
  OFF_MARKET: { fr: 'Retiré du marché', ar: 'مسحوب من السوق' },
  DRAFT: { fr: 'Brouillon', ar: 'مسودة' },
} as const;
