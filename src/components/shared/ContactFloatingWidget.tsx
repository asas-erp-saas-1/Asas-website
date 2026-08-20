'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, PhoneCall, MailOpen, MessageSquareText, Plus, ChevronRight } from 'lucide-react';
import { ASAS, getWhatsAppUrl, getPhoneUrl } from '@/lib/constants';
import { useRouter } from '@/lib/router';

interface ContactOption {
  id: string;
  label: string;
  icon: typeof MessageCircle;
  color: string;
  hoverColor: string;
  action: () => void;
}

/** WhatsApp icon with green color and small SVG badge */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <span className="relative inline-flex">
      <MessageCircle className={className} />
      <svg
        viewBox="0 0 10 10"
        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-[#25D366]"
        aria-hidden="true"
      >
        <circle cx="5" cy="5" r="5" />
        <path
          d="M3 5.2L4.3 6.5 7 3.5"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ContactFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteractedRef = useRef(false);
  const router = useRouter();

  const clearTooltipTimers = useCallback(() => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }
  }, []);

  const options: ContactOption[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle, // rendered via WhatsAppIcon
      color: 'bg-[#25D366]',
      hoverColor: 'hover:bg-[#1da851]',
      action: () => {
        window.open(
          getWhatsAppUrl('Bonjour, je souhaite des informations sur vos projets.'),
          '_blank',
          'noopener,noreferrer'
        );
      },
    },
    {
      id: 'phone',
      label: 'Téléphone',
      icon: PhoneCall,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => {
        window.open(getPhoneUrl(), '_self');
      },
    },
    {
      id: 'email',
      label: 'Email',
      icon: MailOpen,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      action: () => {
        window.open(
          `mailto:${ASAS.email}?subject=Demande%20d%27information%20-%20ASAS`,
          '_self'
        );
      },
    },
    {
      id: 'chat',
      label: 'Nous écrire',
      icon: MessageSquareText,
      color: 'bg-forest',
      hoverColor: 'hover:bg-forest-dark',
      action: () => {
        const leadForm = document.getElementById('lead-form');
        if (leadForm) {
          leadForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          router.navigate({ page: 'contact' });
        }
      },
    },
  ];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        hasInteractedRef.current = true;
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        hasInteractedRef.current = true;
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Tooltip logic: show "Besoin d'aide ?" after 5s of no interaction, auto-hide after 3s
  useEffect(() => {
    clearTooltipTimers();

    if (!isOpen && !hasInteractedRef.current) {
      tooltipTimerRef.current = setTimeout(() => {
        if (!hasInteractedRef.current && !isOpen) {
          setShowTooltip(true);
          tooltipHideTimerRef.current = setTimeout(() => {
            setShowTooltip(false);
          }, 3000);
        }
      }, 5000);
    }

    return clearTooltipTimers;
  }, [isOpen, clearTooltipTimers]);

  const toggleOpen = () => {
    hasInteractedRef.current = true;
    setShowTooltip(false);
    clearTooltipTimers();
    setIsOpen((prev) => !prev);
  };

  // Spring-based stagger animation
  const optionVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.06,
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      scale: 0.5,
      y: 10,
      transition: {
        delay: (3 - i) * 0.04,
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    }),
  };

  // Breathing animation for idle FAB
  const fabBreathing = {
    scale: [1, 1.06, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  return (
    <>
      {/* Backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="contact-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            style={{ pointerEvents: 'auto' }}
            onClick={() => {
              setIsOpen(false);
              hasInteractedRef.current = true;
            }}
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end gap-3"
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute bottom-16 right-0 mb-1 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg"
            >
              Besoin d&apos;aide ?
              <span className="absolute -bottom-1 right-5 w-2 h-2 rotate-45 bg-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-end gap-2"
            >
              {options.map((option, i) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    custom={i}
                    variants={optionVariants}
                    onClick={() => {
                      option.action();
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-white text-sm font-medium shadow-lg transition-all duration-200 ${option.color} ${option.hoverColor} hover:shadow-xl active:scale-95`}
                    aria-label={option.label}
                  >
                    <span className="whitespace-nowrap">{option.label}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
                    {option.id === 'whatsapp' ? (
                      <WhatsAppIcon className="h-4 w-4 shrink-0" />
                    ) : (
                      <Icon className="h-4 w-4 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB toggle button */}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={!isOpen ? fabBreathing : { scale: 1 }}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-forest text-white shadow-xl transition-shadow duration-200 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          aria-label={isOpen ? 'Fermer le menu de contact' : 'Ouvrir le menu de contact'}
          aria-expanded={isOpen}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
