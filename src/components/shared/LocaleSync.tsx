'use client';

import { useEffect } from 'react';
import { useLocale, applyLocaleToDocument } from '@/lib/locale';

/**
 * Invisible component that syncs the Zustand locale store
 * to document.documentElement dir/lang attributes.
 * Must be rendered inside ThemeProvider (after hydration).
 */
export function LocaleSync() {
  const locale = useLocale((s) => s.locale);

  useEffect(() => {
    applyLocaleToDocument(locale);
  }, [locale]);

  return null;
}
