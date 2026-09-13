'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { APARTMENT_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { CheckCircle2, Clock3, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type: 'project' | 'apartment';
}

const APARTMENT_ICONS: Record<string, LucideIcon> = {
  AVAILABLE: CheckCircle2,
  RESERVED: Clock3,
  SOLD: LockKeyhole,
  COMING_SOON: Sparkles,
  OFF_MARKET: EyeOff,
};

const PROJECT_ICONS: Record<string, LucideIcon> = {
  AVAILABLE: CheckCircle2,
  COMING_SOON: Sparkles,
  SOLD_OUT: LockKeyhole,
};

const ICON_COLORS: Record<string, string> = {
  AVAILABLE: 'text-primary-foreground/90',
  RESERVED: 'text-foreground/70',
  SOLD: 'text-primary-foreground/80',
  COMING_SOON: 'text-primary-foreground/90',
  OFF_MARKET: 'text-foreground/60',
  SOLD_OUT: 'text-primary-foreground/80',
};

const STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: 'border-transparent bg-primary text-primary-foreground',
  RESERVED: 'border-gold/30 bg-gold/15 text-foreground',
  SOLD: 'border-transparent bg-foreground/55 text-background',
  COMING_SOON: 'border-transparent bg-forest-light text-primary-foreground',
  OFF_MARKET: 'border-border bg-muted text-muted-foreground',
  SOLD_OUT: 'border-transparent bg-foreground/55 text-background',
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const labels = type === 'project' ? PROJECT_STATUS_LABELS : APARTMENT_STATUS_LABELS;
  const label = labels[status];
  if (!label) return null;

  const Icon = (type === 'project' ? PROJECT_ICONS : APARTMENT_ICONS)[status] ?? EyeOff;
  const className = STATUS_CLASSES[status] ?? 'border-border bg-muted text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="inline-flex min-w-0"
    >
      <Badge className={`${className} max-w-full gap-1.5 text-xs font-semibold`}>
        <Icon className={`size-3.5 shrink-0 ${ICON_COLORS[status] ?? 'text-current'}`} aria-hidden="true" />
        <span className="min-w-0 truncate">{label.fr}</span>
      </Badge>
    </motion.div>
  );
}
