'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  BarChart3,
  ShieldCheck,
  HeadphonesIcon,
  MapPin,
  Calculator,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from '@/lib/router';

interface Feature {
  id: string;
  icon: typeof Building2;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  bgColor: string;
  action?: () => void;
  actionLabel?: string;
}

const features: Feature[] = [
  {
    id: 'projects',
    icon: Building2,
    title: 'Projets Premium',
    description: 'Découvrez une sélection exclusive de programmes immobiliers neufs à Alger, soigneusement vérifiés et commercialisés par ASAS.',
    benefits: ['Projets certifiés CNERIB', 'Visites virtuelles 3D', 'Mise à jour en temps réel', 'Garantie promoteur'],
    color: 'text-forest',
    bgColor: 'bg-forest/10',
    action: undefined,
    actionLabel: 'Explorer les projets',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analyses de Marché',
    description: 'Accédez à des données exclusives sur le marché immobilier algérien : tendances de prix, zones les plus demandées, prévisions.',
    benefits: ['Tendances par quartier', 'Comparaison de prix', 'Indicateurs de demande', 'Rapports personnalisés'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'security',
    icon: ShieldCheck,
    title: 'Transaction Sécurisée',
    description: 'Un processus d\'achat encadré et transparent, avec accompagnement juridique complet de la réservation à la signature notariale.',
    benefits: ['Accompagnement juridique', 'Contrat de réservation', 'Suivi notarial', 'Paiement sécurisé'],
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'support',
    icon: HeadphonesIcon,
    title: 'Conseil Personnalisé',
    description: 'Un conseiller dédié vous accompagne dans votre projet, de la recherche du bien idéal jusqu\'à la remise des clés.',
    benefits: ['Conseiller attitré', 'Disponible 7j/7', 'Expertise locale', 'Suivi post-achat'],
    color: 'text-gold',
    bgColor: 'bg-gold/10',
    action: undefined,
    actionLabel: 'Contacter un conseiller',
  },
];

/**
 * Interactive feature showcase with tab-style navigation.
 * Each feature reveals its benefits with staggered animation.
 */
export function InteractiveFeatureShowcase() {
  const [activeId, setActiveId] = useState('projects');
  const router = useRouter();
  const activeFeature = features.find(f => f.id === activeId) ?? features[0];

  const handleAction = (feature: Feature) => {
    if (feature.id === 'projects') {
      router.goProjects();
    } else if (feature.id === 'support') {
      router.goContact();
    }
  };

  return (
    <div className="w-full">
      {/* Tab navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = feature.id === activeId;
          return (
            <motion.button
              key={feature.id}
              onClick={() => setActiveId(feature.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-200
                ${isActive
                  ? 'bg-forest text-white shadow-lg shadow-forest/20'
                  : 'bg-white border border-border text-foreground hover:border-forest/30 hover:bg-forest/5'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{feature.title}</span>
              {isActive && (
                <motion.div
                  layoutId="feature-tab-glow"
                  className="absolute inset-0 rounded-xl bg-forest/10 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feature content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          {/* Left: Icon + description */}
          <div className="space-y-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${activeFeature.bgColor}`}
            >
              <activeFeature.icon className={`h-8 w-8 ${activeFeature.color}`} />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl md:text-3xl font-bold text-foreground"
            >
              {activeFeature.title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base text-muted-foreground leading-relaxed"
            >
              {activeFeature.description}
            </motion.p>

            {/* CTA button */}
            {activeFeature.actionLabel && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(activeFeature)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white font-medium shadow-lg shadow-forest/20 hover:bg-forest-dark transition-colors"
              >
                {activeFeature.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>

          {/* Right: Benefits list */}
          <div className="space-y-3">
            {activeFeature.benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: 0.1 + i * 0.08,
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border hover:border-forest/20 transition-colors group"
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${activeFeature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <CheckCircle2 className={`h-4 w-4 ${activeFeature.color}`} />
                </span>
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </motion.div>
            ))}

            {/* Decorative accent */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 pt-2 text-xs text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-forest" />
              <span>Exclusivité ASAS — Service premium</span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
