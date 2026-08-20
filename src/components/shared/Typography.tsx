import type { ReactNode, HTMLAttributes } from 'react';
import { formatPrice } from '@/lib/constants';

// ─── Typography System Components ───
// Enforce the design system tokens from @/lib/design-tokens.
// These are NOT meant to replace existing elements immediately,
// but to provide a typed, design-system-compliant alternative
// that can be adopted incrementally.

type TypographyProps = {
  children: ReactNode;
  className?: string;
};

// ── Display ──
// text-5xl font-extrabold tracking-tight — hero headlines

export function Display({ children, className }: TypographyProps) {
  return (
    <p className={`text-5xl font-extrabold tracking-tight leading-[1.1] ${className ?? ''}`}>
      {children}
    </p>
  );
}

// ── Headings ──

export function Heading1({ children, className }: TypographyProps) {
  return (
    <h1 className={`text-4xl font-bold tracking-tight leading-[1.2] ${className ?? ''}`}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className }: TypographyProps) {
  return (
    <h2 className={`text-3xl font-bold tracking-tight leading-[1.25] ${className ?? ''}`}>
      {children}
    </h2>
  );
}

export function Heading3({ children, className }: TypographyProps) {
  return (
    <h3 className={`text-2xl font-semibold leading-[1.3] ${className ?? ''}`}>
      {children}
    </h3>
  );
}

export function Heading4({ children, className }: TypographyProps) {
  return (
    <h4 className={`text-xl font-semibold leading-[1.4] ${className ?? ''}`}>
      {children}
    </h4>
  );
}

// ── Body ──

export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={`text-lg font-normal leading-relaxed ${className ?? ''}`}>
      {children}
    </p>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={`text-base font-normal leading-normal ${className ?? ''}`}>
      {children}
    </p>
  );
}

export function BodySmall({ children, className }: TypographyProps) {
  return (
    <p className={`text-sm font-normal leading-normal ${className ?? ''}`}>
      {children}
    </p>
  );
}

// ── Caption ──

export function Caption({ children, className }: TypographyProps) {
  return (
    <p className={`text-xs font-normal leading-[1.4] ${className ?? ''}`}>
      {children}
    </p>
  );
}

// ── Price Display ──
// Formatted price with tabular-nums for alignment in grids.
// Uses the existing formatPrice() from constants.

interface PriceDisplayProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  value: number | null | undefined;
  currency?: string; // defaults to 'DA' via formatPrice
}

export function PriceDisplay({ value, className, ...rest }: PriceDisplayProps) {
  return (
    <span
      className={`text-2xl font-bold leading-none tabular-nums ${className ?? ''}`}
      {...rest}
    >
      {formatPrice(value)}
    </span>
  );
}

// ── Property Label ──
// text-xs uppercase font-semibold tracking-wider — badges, categories, tags

export function PropertyLabel({ children, className }: TypographyProps) {
  return (
    <span className={`text-xs uppercase font-semibold tracking-wider ${className ?? ''}`}>
      {children}
    </span>
  );
}
