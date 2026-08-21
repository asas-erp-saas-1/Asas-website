// ─── ASAS Design System Tokens ───
// Single source of truth for the visual language.
// Semantic tokens are authoritative; legacy shapes remain compatible while consumers migrate.

const brand = {
  forest: 'oklch(0.37 0.09 155)',
  forestLight: 'oklch(0.52 0.1 155)',
  forestDark: 'oklch(0.25 0.07 155)',
  ivory: 'oklch(0.98 0.005 90)',
  charcoal: 'oklch(0.17 0.01 60)',
  sand: 'oklch(0.92 0.008 80)',
  gold: 'oklch(0.75 0.15 85)',
} as const;

export const colors = {
  brand,
  // Legacy named brand groups retained for existing consumers.
  forest: { DEFAULT: brand.forest, light: brand.forestLight, dark: brand.forestDark },
  charcoal: { DEFAULT: brand.charcoal },
  ivory: { DEFAULT: brand.ivory },
  sand: { DEFAULT: brand.sand },
  gold: { DEFAULT: brand.gold },

  semantic: {
    background: 'background', surface: 'card', surfaceElevated: 'popover', surfaceHover: 'accent', surfaceActive: 'secondary',
    border: 'border', borderSubtle: 'border-subtle', borderStrong: 'border-strong',
    textPrimary: 'foreground', textSecondary: 'muted-foreground', textMuted: 'text-muted', textDisabled: 'text-disabled', textInverse: 'primary-foreground',
    primary: 'primary', primaryHover: 'primary-hover', primaryActive: 'primary-active',
    accent: 'gold', accentHover: 'gold-hover', accentActive: 'gold-active',
    success: 'success', warning: 'warning', danger: 'destructive', info: 'info', overlay: 'overlay', focusRing: 'ring',
  },

  status: {
    available: 'success', reserved: 'warning', sold: 'destructive', comingSoon: 'info', offMarket: 'muted', draft: 'muted',
  },

  // Compatibility surface for existing shadcn/Tailwind consumers.
  ui: {
    background: 'oklch(0.98 0.005 90)', foreground: 'oklch(0.17 0.01 60)', card: 'oklch(1 0 0)', cardForeground: 'oklch(0.17 0.01 60)',
    popover: 'oklch(1 0 0)', popoverForeground: 'oklch(0.17 0.01 60)', primary: brand.forest, primaryForeground: brand.ivory,
    secondary: 'oklch(0.95 0.006 80)', secondaryForeground: brand.charcoal, muted: 'oklch(0.95 0.006 80)', mutedForeground: 'oklch(0.50 0.01 60)',
    accent: brand.sand, accentForeground: brand.charcoal, destructive: 'oklch(0.577 0.245 27.325)', border: 'oklch(0.90 0.006 80)', input: 'oklch(0.90 0.006 80)', ring: brand.forest,
  },
} as const;

export const typography = {
  displayXl: { fontSize: 'clamp(2.75rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.035em' },
  display: { fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.03em' },
  h1: { fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.025em' },
  h2: { fontSize: 'clamp(1.625rem, 3vw, 2.125rem)', fontWeight: 650, lineHeight: 1.18, letterSpacing: '-0.02em' },
  h3: { fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', fontWeight: 600, lineHeight: 1.28, letterSpacing: '-0.015em' },
  h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em' },
  bodyLg: { fontSize: '1.125rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0' },
  bodyLarge: { fontSize: '1.125rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0' },
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.55, letterSpacing: '0' },
  bodySm: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
  bodySmall: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0.01em' },
  label: { fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '0.04em' },
  overline: { fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.08em' },
  button: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.005em' },
  nav: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.25, letterSpacing: '0' },
  price: { fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' as const },
  numeric: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' as const },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64, '4xl': 80, '5xl': 96 } as const;
export const borderRadius = { sm: 6, md: 8, lg: 10, xl: 14, '2xl': 18, full: 9999 } as const;
export const shadows = { none: 'none', subtle: '0 1px 2px rgb(0 0 0 / 0.05)', card: '0 4px 12px rgb(0 0 0 / 0.06)', elevated: '0 12px 28px rgb(0 0 0 / 0.10)', overlay: '0 20px 48px rgb(0 0 0 / 0.16)' } as const;
export const iconSizes = { inline: 14, standard: 16, emphasis: 20, hero: 24 } as const;
export const animation = {
  durationFast: 0.15, durationNormal: 0.2, durationSlow: 0.4,
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  springDefault: { stiffness: 300, damping: 25 }, springSnappy: { stiffness: 400, damping: 30 },
} as const;
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export const zIndex = { base: 0, sticky: 10, header: 20, dropdown: 30, popover: 40, modal: 50, toast: 60, tooltip: 70 } as const;
export const containers = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1440 } as const;
