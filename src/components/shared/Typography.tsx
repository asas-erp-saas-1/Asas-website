import type { ReactNode, HTMLAttributes } from 'react';
import { formatPrice } from '@/lib/constants';

// ─── ASAS Typography System ───
// Responsive, content-safe primitives for the public real-estate experience.

type TypographyProps = {
  children: ReactNode;
  className?: string;
};

const cnText = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Display({ children, className }: TypographyProps) {
  return (
    <p className={cnText('text-[clamp(2.25rem,7vw,3.5rem)] font-extrabold tracking-[-0.025em] leading-[1.06] text-balance', className)}>
      {children}
    </p>
  );
}

export function Heading1({ children, className }: TypographyProps) {
  return (
    <h1 className={cnText('text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-[-0.02em] leading-[1.12] text-balance break-words', className)}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className }: TypographyProps) {
  return (
    <h2 className={cnText('text-[clamp(1.625rem,4vw,2.25rem)] font-bold tracking-[-0.015em] leading-[1.18] text-balance break-words', className)}>
      {children}
    </h2>
  );
}

export function Heading3({ children, className }: TypographyProps) {
  return (
    <h3 className={cnText('text-[clamp(1.25rem,3vw,1.5rem)] font-semibold leading-[1.25] text-balance break-words', className)}>
      {children}
    </h3>
  );
}

export function Heading4({ children, className }: TypographyProps) {
  return (
    <h4 className={cnText('text-lg sm:text-xl font-semibold leading-[1.35] break-words', className)}>
      {children}
    </h4>
  );
}

export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cnText('text-base sm:text-lg font-normal leading-relaxed max-w-prose', className)}>
      {children}
    </p>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cnText('text-base font-normal leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function BodySmall({ children, className }: TypographyProps) {
  return (
    <p className={cnText('text-sm font-normal leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function Caption({ children, className }: TypographyProps) {
  return (
    <p className={cnText('text-xs font-normal leading-[1.4]', className)}>
      {children}
    </p>
  );
}

interface PriceDisplayProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  value: number | null | undefined;
  currency?: string;
}

export function PriceDisplay({ value, className, ...rest }: PriceDisplayProps) {
  return (
    <span
      className={cnText('inline-block max-w-full text-xl sm:text-2xl font-bold leading-tight tabular-nums break-words', className)}
      {...rest}
    >
      {formatPrice(value)}
    </span>
  );
}

export function PropertyLabel({ children, className }: TypographyProps) {
  return (
    <span className={cnText('inline-block max-w-full text-[0.6875rem] sm:text-xs uppercase font-semibold tracking-[0.08em] leading-tight break-words', className)}>
      {children}
    </span>
  );
}
