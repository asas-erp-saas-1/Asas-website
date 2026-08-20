'use client';

import { useLocale, applyLocaleToDocument } from '@/lib/locale';
import { useIsClient } from '@/lib/use-is-client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

/**
 * Language toggle: switches between French (FR) and Arabic (ع).
 * Updates the locale store and immediately applies dir/lang to <html>.
 * Visual: ghost icon button matching ThemeToggle / Favorites sizing.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const isClient = useIsClient();

  // Until mounted, render an invisible placeholder of the same size
  // to keep layout stable and avoid hydration mismatch.
  if (!isClient) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-9 rounded-md"
      />
    );
  }

  const isArabic = locale === 'ar';
  const nextLocale = isArabic ? 'fr' : 'ar';
  const displayLabel = isArabic ? 'FR' : 'ع';
  const tooltipLabel = isArabic ? 'الفرنسية' : 'العربية';

  const handleToggle = () => {
    setLocale(nextLocale);
    applyLocaleToDocument(nextLocale);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            aria-label={tooltipLabel}
            className="relative inline-flex items-center justify-center size-9 rounded-md text-foreground hover:text-forest hover:bg-forest/5 transition-colors overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={locale}
                initial={{ y: -8, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="inline-flex text-sm font-semibold"
              >
                {displayLabel}
              </motion.span>
            </AnimatePresence>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
