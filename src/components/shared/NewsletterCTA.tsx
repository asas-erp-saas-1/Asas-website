'use client';

import { motion } from 'framer-motion';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { NewsletterForm } from '@/components/shared/NewsletterForm';

interface NewsletterCTAProps {
  /** Visual variant. 'card' = light card on ivory background, 'banner' = full-width forest section. */
  variant?: 'card' | 'banner';
  /** Source attribution */
  source?: string;
  className?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const PERKS = [
  'Avant-première sur les nouveaux projets',
  'Offres exclusives et prix préférentiels',
  'Conseils immobiliers par notre équipe',
];

/* Animated mail icon for the banner variant */
function AnimatedMailIcon() {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0],
        rotate: [0, -5, 0, 5, 0],
      }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <Mail className="w-5 h-5 text-gold" />
    </motion.div>
  );
}

export function NewsletterCTA({
  variant = 'card',
  source = 'SECTION',
  className = '',
}: NewsletterCTAProps) {
  if (variant === 'banner') {
    return (
      <section className={`py-20 px-4 bg-forest relative overflow-hidden ${className}`}>
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        </div>

        {/* Animated gradient border at top */}
        <div aria-hidden className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-5">
            <AnimatedMailIcon />
            <span className="text-xs font-medium text-white/90 uppercase tracking-wider">
              Newsletter ASAS
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ne manquez aucun projet
          </h2>
          <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
            Recevez en avant-première nos nouveaux programmes immobiliers, nos offres exclusives et nos conseils pour réussir votre achat immobilier à Alger.
          </p>

          <div className="max-w-xl mx-auto">
            <NewsletterForm
              source={source}
              variant="inline"
              placeholder="Votre adresse e-mail"
              buttonLabel="Je m'inscris"
            />
          </div>

          <ul className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center text-xs text-white/70">
            {PERKS.map((perk, i) => (
              <motion.li
                key={perk}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>{perk}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>
    );
  }

  // card variant
  return (
    <section className={`py-16 px-4 bg-ivory ${className}`}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-card border border-forest/10 shadow-lg p-8 md:p-10">
          {/* Decorative gradient corner */}
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full bg-forest/8 blur-3xl" />

          {/* Animated gradient border */}
          <div aria-hidden className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-[1px] -left-[1px] -right-[1px] h-[2px] bg-gradient-to-r from-transparent via-forest/40 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mail className="w-3.5 h-3.5 text-forest" />
                </motion.div>
                <span className="text-xs font-semibold text-forest uppercase tracking-wider">
                  Newsletter
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Recevez nos nouveaux projets en avant-première
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Soyez informé en premier de nos lancements, offres exclusives et conseils immobiliers à Alger.
              </p>
              <NewsletterForm
                source={source}
                variant="inline"
                placeholder="votre@email.com"
                buttonLabel="S'abonner"
              />
            </div>

            <ul className="md:w-64 md:border-l md:border-border md:pl-6 space-y-3 flex-shrink-0">
              {PERKS.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
