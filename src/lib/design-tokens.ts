// ─── ASAS Design System Tokens ───
// Single source of truth for brand, interface and interaction decisions.
// Business/domain constants remain in src/lib/constants.ts.

export const colors = {
  forest: {
    DEFAULT: 'oklch(0.37 0.09 155)',
    light: 'oklch(0.52 0.1 155)',
    dark: 'oklch(0.25 0.07 155)',
    darkMode: {
      DEFAULT: 'oklch(0.45 0.1 155)',
      light: 'oklch(0.55 0.1 155)',
      dark: 'oklch(0.30 0.08 155)',
    },
  },
  charcoal: {
    DEFAULT: 'oklch(0.17 0.01 60)',
    darkMode: { DEFAULT: 'oklch(0.95 0.005 90)' },
  },
  ivory: {
    DEFAULT: 'oklch(0.98 0.005 90)',
    darkMode: { DEFAULT: 'oklch(0.15 0.005 60)' },
  },
  sand: {
    DEFAULT: 'oklch(0.92 0.008 80)',
    darkMode: { DEFAULT: 'oklch(0.25 0.008 60)' },
  },
  gold: {
    DEFAULT: 'oklch(0.75 0.15 85)',
    darkMode: { DEFAULT: 'oklch(0.75 0.15 85)' },
  },
  semantic: {
    primary: 'forest' as const,
    surface: 'ivory' as const,
    text: 'charcoal' as const,
    accent: 'gold' as const,
    neutral: 'sand' as const,
  },
  status: {
    available: 'forest' as const,
    reserved: 'gold' as const,
    sold: 'red' as const,
    comingSoon: 'forest' as const,
    offMarket: 'gray' as const,
    draft: 'gray' as const,
  },
  ui: {
    background: 'oklch(0.98 0.005 90)',
    foreground: 'oklch(0.17 0.01 60)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.17 0.01 60)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.17 0.01 60)',
    primary: 'oklch(0.37 0.09 155)',
    primaryForeground: 'oklch(0.98 0.005 90)',
    secondary: 'oklch(0.95 0.006 80)',
    secondaryForeground: 'oklch(0.17 0.01 60)',
    muted: 'oklch(0.95 0.006 80)',
    mutedForeground: 'oklch(0.50 0.01 60)',
    accent: 'oklch(0.92 0.008 80)',
    accentForeground: 'oklch(0.17 0.01 60)',
    destructive: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.90 0.006 80)',
    input: 'oklch(0.90 0.006 80)',
    ring: 'oklch(0.37 0.09 155)',
  },
} as const;

export const typography = {
  display: { fontSize: 'clamp(2.25rem, 7vw, 3.5rem)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.025em' },
  h1: { fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' },
  h2: { fontSize: 'clamp(1.625rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.015em' },
  h3: { fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 600, lineHeight: 1.25 },
  h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
  bodyLarge: { fontSize: '1.125rem', fontWeight: 400, lineHeight: 1.65 },
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
  bodySmall: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
  label: { fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1.2, textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  button: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1 },
  price: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' as const },
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32,
  '2xl': 48, '3xl': 64, '4xl': 80, '5xl': 96,
} as const;

export const borderRadius = {
  sm: 6, md: 8, lg: 10, xl: 14, full: 9999,
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 12px rgba(0,0,0,0.07)',
  lg: '0 12px 28px rgba(0,0,0,0.09)',
  xl: '0 20px 40px rgba(0,0,0,0.12)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.05)',
} as const;

export const iconSizes = { inline: 14, standard: 16, emphasis: 20, hero: 24 } as const;

export const animation = {
  springDefault: { stiffness: 300, damping: 25 },
  springSnappy: { stiffness: 400, damping: 30 },
  springBouncy: { stiffness: 500, damping: 15 },
  durationFast: 0.15,
  durationNormal: 0.3,
  durationSlow: 0.5,
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export const zIndex = { base: 0, dropdown: 10, sticky: 20, fixed: 30, overlay: 40, modal: 50, popover: 60, toast: 70, tooltip: 80, top: 90 } as const;
export const containers = { sm: 640, md: 768, lg: 1024, xl: 1280, '7xl': 1280, full: 1440 } as const;
