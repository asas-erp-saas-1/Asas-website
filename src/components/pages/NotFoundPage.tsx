'use client';

import { motion } from 'framer-motion';
import { ScrollRevealSection } from '@/components/shared/ScrollRevealSection';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/router';
import { Home, Building2, Construction, ArrowLeft, Search } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center">
      <ScrollRevealSection
        className="w-full max-w-2xl mx-auto px-4 py-20 text-center"
        direction="up"
        accent
      >
        {/* Decorative 404 number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          className="mb-8"
        >
          <span className="text-[8rem] md:text-[10rem] font-black text-forest/10 leading-none block select-none">
            404
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest/10 mb-6"
        >
          <Construction className="h-8 w-8 text-forest" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-forest-dark mb-4"
        >
          404 — Page introuvable
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base md:text-lg text-muted-foreground max-w-md mx-auto mb-10"
        >
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => router.goHome()}
            className="bg-forest hover:bg-forest-dark text-white gap-2 min-w-[200px]"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.goProjects()}
            className="border-forest/30 text-forest hover:bg-forest/5 hover:border-forest/50 gap-2 min-w-[200px]"
          >
            <Building2 className="h-4 w-4" />
            Voir nos projets
          </Button>
        </motion.div>

        {/* Decorative bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-border/40"
        >
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>
              Astuce : Utilisez <kbd className="mx-1 inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">Ctrl+K</kbd> pour rechercher rapidement
            </span>
          </div>
        </motion.div>
      </ScrollRevealSection>
    </main>
  );
}
