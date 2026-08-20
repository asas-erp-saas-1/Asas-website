'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { ASAS, getPhoneUrl, getWhatsAppUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/router';
import { useComparison } from '@/lib/favorites';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const { navigate } = useRouter();
  const compareCount = useComparison(s => s.compareList.length);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide the sticky CTA when the CompareBar is showing (2+ items in comparison)
  if (!visible || compareCount >= 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <a
          href={getWhatsAppUrl('Bonjour, je souhaite des informations sur vos projets.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="size-4" />
          <span>WhatsApp</span>
        </a>

        {/* Appeler */}
        <a
          href={getPhoneUrl()}
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
        >
          <Phone className="size-4" />
          <span>Appeler</span>
        </a>

        {/* Demander les infos */}
        <Button
          size="sm"
          className="flex-1 h-10 text-xs bg-forest hover:bg-forest-dark text-white border-forest hover:border-forest-dark"
          onClick={() => navigate({ page: 'contact' })}
        >
          Demander les infos
        </Button>
      </div>
    </div>
  );
}
