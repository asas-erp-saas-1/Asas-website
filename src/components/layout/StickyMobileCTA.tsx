'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Phone, CalendarCheck } from 'lucide-react';
import { getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/router';
import { useComparison } from '@/lib/favorites';

type PropertyContext = 'project' | 'apartment' | 'general';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState<PropertyContext>('general');
  const { navigate } = useRouter();
  const compareCount = useComparison(s => s.compareList.length);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    const pathname = window.location.pathname;
    const apartmentRoute = /\/projects\/[^/]+\/apartments\/[^/]+/.test(pathname);
    const projectRoute = /^\/projects\/[^/]+\/?$/.test(pathname);
    setContext(apartmentRoute ? 'apartment' : projectRoute ? 'project' : 'general');

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide the sticky CTA when the CompareBar is showing (2+ items in comparison)
  if (!visible || compareCount >= 2) return null;

  const whatsappMessage = context === 'apartment'
    ? 'Bonjour, je souhaite des informations sur cet appartement, notamment sa disponibilité, son prix et les modalités de visite.'
    : context === 'project'
      ? 'Bonjour, je souhaite connaître les disponibilités, les prix et les modalités de visite pour ce projet.'
      : 'Bonjour, je souhaite être accompagné(e) dans ma recherche immobilière.';

  const primaryLabel = context === 'apartment'
    ? 'Demander une visite'
    : context === 'project'
      ? 'Voir les disponibilités'
      : 'Parler à un conseiller';

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border px-[max(0.75rem,env(safe-area-inset-left))] py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-xl items-center gap-2">
        <a
          href={getWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter ASAS sur WhatsApp"
          className="flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        <a
          href={getPhoneUrl()}
          aria-label="Appeler ASAS"
          className="flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span>Appeler</span>
        </a>

        <Button
          size="sm"
          className="flex-1 min-h-11 text-xs bg-forest hover:bg-forest-dark text-white border-forest hover:border-forest-dark"
          onClick={() => navigate({ page: 'contact' })}
          aria-label={primaryLabel}
        >
          <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
          <span>{primaryLabel}</span>
        </Button>
      </div>
    </div>
  );
}
