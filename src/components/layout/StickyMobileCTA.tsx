'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/router';
import { useComparison } from '@/lib/favorites';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const { navigate } = useRouter();
  const compareCount = useComparison(s => s.compareList.length);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || compareCount >= 2) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-3 py-2 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <a
          href={getWhatsAppUrl('Bonjour, je souhaite des informations sur vos projets.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter ASAS sur WhatsApp"
          className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-2 text-sm font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-95 active:translate-y-px"
        >
          <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">WhatsApp</span>
        </a>

        <a
          href={getPhoneUrl()}
          aria-label="Appeler ASAS"
          className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-2 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px"
        >
          <Phone aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">Appeler</span>
        </a>

        <Button
          size="sm"
          className="h-10 min-w-0 flex-1 truncate px-2 text-xs font-semibold"
          onClick={() => navigate({ page: 'contact' })}
        >
          Demander les infos
        </Button>
      </div>
    </div>
  );
}
