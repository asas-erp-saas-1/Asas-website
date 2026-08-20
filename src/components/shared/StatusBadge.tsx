'use client';

import { Badge } from '@/components/ui/badge';
import { APARTMENT_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Lock, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type: 'project' | 'apartment';
}

/* Contextual icon mapping for apartment statuses */
const APARTMENT_ICONS: Record<string, LucideIcon> = {
  AVAILABLE: CheckCircle2,
  RESERVED: Clock,
  SOLD: Lock,
  COMING_SOON: Sparkles,
};

/* Contextual icon mapping for project statuses */
const PROJECT_ICONS: Record<string, LucideIcon> = {
  AVAILABLE: CheckCircle2,
  COMING_SOON: Sparkles,
  SOLD_OUT: Lock,
};

/* Icon color classes */
const APARTMENT_ICON_COLORS: Record<string, string> = {
  AVAILABLE: 'text-emerald-500',
  RESERVED: 'text-amber-500',
  SOLD: 'text-slate-400',
  COMING_SOON: 'text-blue-500',
};

const PROJECT_ICON_COLORS: Record<string, string> = {
  AVAILABLE: 'text-emerald-500',
  COMING_SOON: 'text-blue-500',
  SOLD_OUT: 'text-slate-400',
};

/* Enhanced dot color mapping */
const APARTMENT_DOT_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-400',
  RESERVED: 'bg-amber-400',
  SOLD: 'bg-slate-400',
  COMING_SOON: 'bg-blue-400',
};

const PROJECT_DOT_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-400',
  COMING_SOON: 'bg-blue-400',
  SOLD_OUT: 'bg-slate-400',
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  if (type === 'project') {
    const label = PROJECT_STATUS_LABELS[status];
    if (!label) return null;

    const colorClass =
      status === 'AVAILABLE'
        ? 'status-available'
        : status === 'COMING_SOON'
        ? 'status-coming-soon'
        : 'status-sold';

    const dotColor = PROJECT_DOT_COLORS[status] ?? 'bg-slate-400';
    const Icon = PROJECT_ICONS[status] ?? Lock;
    const iconColor = PROJECT_ICON_COLORS[status] ?? 'text-slate-400';
    const shouldPulse = status === 'AVAILABLE';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="inline-flex"
      >
        <Badge className={`${colorClass} text-xs font-medium gap-1.5`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor} ${shouldPulse ? 'animate-status-pulse' : ''}`} />
          {label.fr}
        </Badge>
      </motion.div>
    );
  }

  const label = APARTMENT_STATUS_LABELS[status];
  if (!label) return null;

  const dotColor = APARTMENT_DOT_COLORS[status] ?? 'bg-slate-400';
  const Icon = APARTMENT_ICONS[status] ?? Lock;
  const iconColor = APARTMENT_ICON_COLORS[status] ?? 'text-slate-400';
  const shouldPulse = status === 'AVAILABLE' || status === 'EN_VENTE';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="inline-flex"
    >
      <Badge className={`${label.color} text-xs font-medium gap-1.5`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor} ${shouldPulse ? 'animate-status-pulse' : ''}`} />
        {label.fr}
      </Badge>
    </motion.div>
  );
}
