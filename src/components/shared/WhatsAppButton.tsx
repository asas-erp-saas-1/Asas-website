'use client';

import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl, ASAS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'floating';
}

export function WhatsAppButton({
  message = 'Bonjour, je souhaite des informations sur vos projets immobiliers.',
  className,
  variant = 'default',
}: WhatsAppButtonProps) {
  const handleClick = () => {
    // Track WhatsApp click for analytics (GA4 / Meta Pixel)
    trackEvent('whatsapp_click', {
      message_label: message.slice(0, 60),
      variant,
      source: 'whatsapp_button',
    });
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'fixed bottom-6 right-6 z-30 hidden md:flex items-center gap-2 rounded-full px-4 py-3 text-white font-medium text-sm shadow-lg transition-transform hover:scale-105 whatsapp-pulse',
          className
        )}
        style={{ backgroundColor: '#25D366' }}
        aria-label="Contacter via WhatsApp"
      >
        <MessageCircle className="size-5" />
        <span>WhatsApp</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-4 py-2 text-white font-medium text-sm shadow-sm transition-colors hover:opacity-90',
        className
      )}
      style={{ backgroundColor: '#25D366' }}
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="size-4" />
      <span>WhatsApp</span>
    </button>
  );
}
