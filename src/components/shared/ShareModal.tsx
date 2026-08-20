'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/lib/toast-store';
import {
  Share2,
  Link2,
  Mail,
  Check,
} from 'lucide-react';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  description?: string;
}

/* Social platform definitions */
const SOCIAL_PLATFORMS = [
  {
    name: 'WhatsApp',
    color: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.05-.669.15-.199.199-.766.98-.94 1.18-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.656-2.058-.173-.297-.018-.458.13-.606.298-.292.669-.666.669-.666.149-.174.198-.323.099-.522-.099-.198-.669-1.27-.669-1.27s-.247-.553-.644-.553c-.398 0-.94.031-.94.031s-.398 0-.645.553c0 0-.57 1.072-.669 1.27-.099.199-.05.348.1.522 0 0 .37.374.668.666.148.148.303.309.13.606-.176.297-.773 1.27-1.656 2.058-1.135 1.012-2.093 1.325-2.39 1.475-.297.148-.471.123-.644-.075-.173-.2-.766-.981-.94-1.18-.173-.2-.347-.249-.644-.1-.297.1-1.758.818-2.03.967-.273.1-.472.05-.67-.15-.198-.198-.766-.98-.94-1.18-.173-.198-.347-.223-.644-.075l-.03.015c-.199.1-.398.3-.498.498l-.015.03c-.1.199-.05.472.148.67.199.199.98.766 1.18.94.2.173.223.347.075.644-.15.297-.867 1.758-.967 2.03-.099.273-.05.471.15.669.15.199.98.766 1.18.94.198.173.323.249.522.15.1-.099.199-.669 1.27-.669 1.27s.247.553.644.553c.398 0 .94-.031.94-.031s.398 0 .645-.553c0 0 .57-1.072.669-1.27.099-.199.05-.348-.1-.522 0 0-.37-.374-.668-.666-.148-.148-.303-.309-.13-.606.176-.297.773-1.27 1.656-2.058 1.135-1.012 2.093-1.325 2.39-1.475.297-.148.471-.123.644.075z" />
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14L5 20l1.14-2.89A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
  },
  {
    name: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.014 1.831-4.66 4.532-4.66 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'X',
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.425 11.24H16.17l-5.262-6.866L4.69 21.75H1.38l7.733-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.428-.07-2.605-1.602-2.605-1.602 0-2.095 1.23-2.095 2.527v5.647H9.292V9.167h3.41v1.504h.048c.457-.88 1.564-1.806 3.219-1.806 3.438 0 4.074 2.26 4.074 5.195v5.392zM5.334 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.554V9.167h3.562v11.285zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Email',
    color: '#6B7280',
    icon: <Mail className="size-5" />,
    getUrl: (url: string, title: string, description?: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description ? description + '\n\n' : ''}${url}`)}`,
  },
];

/* Animation variants */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export function ShareModal({ open, onOpenChange, title, url, description }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleShare = (platform: (typeof SOCIAL_PLATFORMS)[number]) => {
    const shareUrl = platform.getUrl(url, title, description);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast({ title: 'Lien copié !', variant: 'success' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast({ title: 'Impossible de copier le lien', variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-forest/20 bg-white/90 backdrop-blur-xl shadow-2xl sm:max-w-md overflow-hidden">
        <DialogHeader className="space-y-3">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
            className="mx-auto flex size-12 items-center justify-center rounded-full bg-forest/10"
          >
            <Share2 className="size-6 text-forest" />
          </motion.div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Partager ce projet
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Social buttons grid */}
        <motion.div
          className="grid grid-cols-3 gap-3 py-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {SOCIAL_PLATFORMS.map((platform) => (
            <motion.button
              key={platform.name}
              variants={itemVariants}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleShare(platform)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-colors hover:border-forest/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label={`Partager via ${platform.name}`}
            >
              <span
                className="flex size-10 items-center justify-center rounded-full transition-colors"
                style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
              >
                {platform.icon}
              </span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {platform.name}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Copy link section */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <label className="text-xs font-medium text-muted-foreground">
            Lien de partage
          </label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={url}
              className="flex-1 bg-muted/50 border-border/60 text-sm truncate pr-3 select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className={`
                inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium
                transition-all focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:outline-none
                ${
                  copied
                    ? 'bg-forest text-white shadow-md'
                    : 'bg-forest/10 text-forest hover:bg-forest hover:text-white hover:shadow-md'
                }
              `}
              aria-label={copied ? 'Lien copié' : 'Copier le lien'}
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  Copié
                </>
              ) : (
                <>
                  <Link2 className="size-4" />
                  Copier
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
