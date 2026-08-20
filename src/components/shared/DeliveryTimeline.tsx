'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

export interface DeliveryTimelineProps {
  deliveryYear: number;
  deliveryQuarter: string;
  status: string;
  projectName: string;
}

type QuarterState = 'completed' | 'active' | 'pending';

interface QuarterNode {
  label: string;
  quarter: number;
  state: QuarterState;
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const lineVariant = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function DeliveryTimeline({
  deliveryYear,
  deliveryQuarter,
  status,
  projectName,
}: DeliveryTimelineProps) {
  // Parse delivery quarter (e.g., "Q1" -> 1)
  const deliveryQ = parseInt(deliveryQuarter.replace('Q', ''), 10) || 1;

  // Determine current quarter
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQ = Math.floor(now.getMonth() / 3) + 1;

  // Build quarter nodes for the delivery year
  const quarters: QuarterNode[] = [1, 2, 3, 4].map((q) => {
    let state: QuarterState = 'pending';

    if (currentYear > deliveryYear) {
      // Delivery year is fully in the past
      state = 'completed';
    } else if (currentYear < deliveryYear) {
      // Delivery year is fully in the future
      state = 'pending';
    } else {
      // Same year — compare quarters
      if (q < currentQ) {
        state = 'completed';
      } else if (q === currentQ) {
        // Current quarter, but also check if it's the delivery quarter
        state = q <= deliveryQ ? 'active' : 'active';
      } else {
        state = 'pending';
      }
    }

    // If the delivery quarter is completed, mark it
    if (q === deliveryQ && currentYear > deliveryYear) {
      state = 'completed';
    }
    if (q === deliveryQ && currentYear === deliveryYear && currentQ > deliveryQ) {
      state = 'completed';
    }

    // Mark delivery quarter as the special "active" if it IS the current quarter
    if (q === currentQ && currentYear === deliveryYear) {
      state = 'active';
    }

    return {
      label: `Q${q}`,
      quarter: q,
      state,
    };
  });

  // Check if delivered
  const isDelivered =
    currentYear > deliveryYear ||
    (currentYear === deliveryYear && currentQ > deliveryQ);

  const statusLabel = isDelivered
    ? 'Livré'
    : status === 'AVAILABLE'
    ? 'En vente'
    : status === 'COMING_SOON'
    ? 'Bientôt'
    : 'En cours';

  const statusColorClass = isDelivered
    ? 'bg-forest/15 text-forest'
    : 'bg-gold/15 text-gold';

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-forest" />
          <h3 className="text-sm font-semibold text-foreground">
            Calendrier de livraison {deliveryYear}
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColorClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Timeline — horizontal on md+, vertical on mobile */}
      {/* Horizontal layout */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between">
          {quarters.map((q, idx) => (
            <div key={q.label} className="flex items-center flex-1 last:flex-none">
              {/* Node */}
              <motion.div variants={nodeVariant} className="flex flex-col items-center relative z-10">
                <div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-300
                    ${q.state === 'completed'
                      ? 'bg-forest border-forest text-white'
                      : q.state === 'active'
                      ? 'bg-gold/15 border-gold text-gold'
                      : 'bg-sand/50 border-border text-muted-foreground'
                    }
                  `}
                >
                  {q.state === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : q.state === 'active' ? (
                    <>
                      <Circle className="h-5 w-5" />
                      <span className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-30" />
                    </>
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-bold ${
                    q.state === 'completed'
                      ? 'text-forest'
                      : q.state === 'active'
                      ? 'text-gold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {q.label}
                </span>
                {q.quarter === deliveryQ && (
                  <span className="mt-0.5 text-[10px] font-medium text-forest/70">
                    Livraison
                  </span>
                )}
              </motion.div>

              {/* Connector line */}
              {idx < quarters.length - 1 && (
                <motion.div
                  variants={lineVariant}
                  className={`
                    flex-1 h-0.5 mx-2 origin-left
                    ${q.state === 'completed'
                      ? 'bg-forest'
                      : q.state === 'active'
                      ? 'bg-gold/40'
                      : 'bg-border'
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vertical layout (mobile) */}
      <div className="md:hidden">
        <div className="relative flex flex-col">
          {/* Vertical line background */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-border" />

          {quarters.map((q, idx) => (
            <motion.div
              key={q.label}
              variants={nodeVariant}
              className="flex items-center gap-4 relative pb-4 last:pb-0"
            >
              {/* Node */}
              <div
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full border-2 shrink-0 z-10 transition-colors duration-300
                  ${q.state === 'completed'
                    ? 'bg-forest border-forest text-white'
                    : q.state === 'active'
                    ? 'bg-gold/15 border-gold text-gold'
                    : 'bg-sand/50 border-border text-muted-foreground'
                  }
                `}
              >
                {q.state === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : q.state === 'active' ? (
                  <>
                    <Circle className="h-5 w-5" />
                    <span className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-30" />
                  </>
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold ${
                    q.state === 'completed'
                      ? 'text-forest'
                      : q.state === 'active'
                      ? 'text-gold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {q.label} {deliveryYear}
                </span>
                {q.quarter === deliveryQ && (
                  <span className="text-xs font-medium text-forest/70">
                    Livraison prévue
                  </span>
                )}
                <span className="text-xs text-muted-foreground mt-0.5">
                  {q.state === 'completed'
                    ? 'Terminé'
                    : q.state === 'active'
                    ? 'En cours'
                    : 'À venir'}
                </span>
              </div>

              {/* Vertical connector colored segment */}
              {idx < quarters.length - 1 && (
                <motion.div
                  variants={lineVariant}
                  className={`
                    absolute left-[23px] top-[48px] w-0.5 h-[calc(100%-48px)] origin-top z-10
                    ${q.state === 'completed'
                      ? 'bg-forest'
                      : q.state === 'active'
                      ? 'bg-gold/40'
                      : 'bg-transparent'
                    }
                  `}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project name footer */}
      <motion.div
        variants={nodeVariant}
        className="mt-5 pt-4 border-t border-border flex items-center justify-between"
      >
        <span className="text-xs text-muted-foreground">{projectName}</span>
        <StatusBadge status={status} type="project" />
      </motion.div>
    </motion.div>
  );
}
