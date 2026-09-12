'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Phone, CalendarCheck } from 'lucide-react';
import { getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/router';

type PropertyContext = 'project' | 'apartment' | 'general';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState<PropertyContext>('general');
  const { navigate } = useRouter();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);

    const pathname = window.location.pathname;
    const apartmentRoute = /\/projects\/[^/]+\/apartments\/[^/]+/.test(pathname);
    const projectRoute = /^\/projects\/[^/]+\/?$/.test(pathname);
    setContext(apartmentRoute ? 'apartment' : projectRoute ? 'project' : 'general');

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

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

  const handlePrimaryAction = () => {
    if (context === 'project') {
      const inventory = document.getElementById('apartments');
      if (inventory) {
        inventory.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    const leadForm = document.querySelector('form[aria-label="Formulaire de contact"]');
    if (leadForm instanceof HTMLElement) {
      leadForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstField = leadForm.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input:not([type="hidden"]), textarea, select'
      );
      if (firstField) {
        window.setTimeout(() => firstField.focus({ preventScroll: true }), 450);
      }
      return;
    }

    navigate({ page: 'contact' });
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-background/95 px-[max(0.75rem,env(safe-area-inset-left))] py-2 pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(23,35,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/90"
      role="region"
      aria-label="Actions rapides"
    >
      <div className="mx-auto flex w-full max-w-xl items-center gap-2">
        <Button
          size="sm"
          className="order-1 min-h-11 flex-[1.4] border-forest bg-forest text-xs text-white shadow-sm hover:border-forest-dark hover:bg-forest-dark"
          onClick={handlePrimaryAction}
          aria-label={primaryLabel}
        >
          <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{primaryLabel}</span>
        </Button>

        <a
          href={getWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter ASAS sur WhatsApp"
          className="order-2 flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        <a
          href={getPhoneUrl()}
          aria-label="Appeler ASAS"
          className="order-3 inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="sr-only">Appeler</span>
        </a>
      </div>
    </div>
  );
}
