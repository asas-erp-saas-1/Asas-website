// ─── ASAS Design System Tokens ───
// Single source of truth for all design decisions.
// Reflects the actual CSS variable values defined in globals.css.

// ── Color Tokens ──

export const colors = {
  // Brand — Forest Green (primary)
  forest: {
    DEFAULT: 'oklch(0.37 0.09 155)',
    light: 'oklch(0.52 0.1 155)',
    dark: 'oklch(0.25 0.07 155)',
    /** Dark mode overrides */
    darkMode: {
      DEFAULT: 'oklch(0.45 0.1 155)',
      light: 'oklch(0.55 0.1 155)',
      dark: 'oklch(0.30 0.08 155)',
    },
  },

  // Brand — Charcoal (dark text)
  charcoal: {
    DEFAULT: 'oklch(0.17 0.01 60)',
    /** Dark mode override */
    darkMode: {
      DEFAULT: 'oklch(0.95 0.005 90)',
    },
  },

  // Brand — Ivory (light background)
  ivory: {
    DEFAULT: 'oklch(0.98 0.005 90)',
    /** Dark mode override */
    darkMode: {
      DEFAULT: 'oklch(0.15 0.005 60)',
    },
  },

  // Brand — Sand (warm neutral)
  sand: {
    DEFAULT: 'oklch(0.92 0.008 80)',
    /** Dark mode override */
    darkMode: {
      DEFAULT: 'oklch(0.25 0.008 60)',
    },
  },

  // Brand — Gold (accent)
  gold: {
    DEFAULT: 'oklch(0.75 0.15 85)',
    /** Same in dark mode */
    darkMode: {
      DEFAULT: 'oklch(0.75 0.15 85)',
    },
  },

  // Semantic aliases (which brand color to use)
  semantic: {
    primary: 'forest' as const,
    surface: 'ivory' as const,
    text: 'charcoal' as const,
    accent: 'gold' as const,
    neutral: 'sand' as const,
  },

  // Status colors — mapped to Tailwind classes used in StatusBadge / AvailabilityBadge
  status: {
    available: 'forest' as const,       // green badge
    reserved: 'gold' as const,          // gold / amber badge
    sold: 'red' as const,               // red badge (destructive)
    comingSoon: 'sky' as const,         // sky / blue badge
    offMarket: 'gray' as const,         // gray / muted badge
    draft: 'gray' as const,             // gray badge
  },

  // UI system colors (shadcn semantic tokens)
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

// ── Typography Tokens ──

export const typography = {
  display: {
    fontSize: '3rem',       // 48px — text-5xl
    fontWeight: 800,        // font-extrabold
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h1: {
    fontSize: '2.25rem',    // 36px — text-4xl
    fontWeight: 700,        // font-bold
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
  },
  h2: {
    fontSize: '1.875rem',   // 30px — text-3xl
    fontWeight: 700,        // font-bold
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',     // 24px — text-2xl
    fontWeight: 600,        // font-semibold
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.25rem',    // 20px — text-xl
    fontWeight: 600,        // font-semibold
    lineHeight: 1.4,
  },
  bodyLarge: {
    fontSize: '1.125rem',   // 18px — text-lg
    fontWeight: 400,        // font-normal
    lineHeight: 1.6,
  },
  body: {
    fontSize: '1rem',       // 16px — text-base
    fontWeight: 400,        // font-normal
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: '0.875rem',   // 14px — text-sm
    fontWeight: 400,        // font-normal
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',    // 12px — text-xs
    fontWeight: 400,        // font-normal
    lineHeight: 1.4,
  },
  label: {
    fontSize: '0.75rem',    // 12px — text-xs
    fontWeight: 600,        // font-semibold
    lineHeight: 1.2,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em', // tracking-wider
  },
  button: {
    fontSize: '0.875rem',   // 14px — text-sm
    fontWeight: 600,        // font-semibold
    lineHeight: 1,
  },
  price: {
    fontSize: '1.5rem',     // 24px — text-2xl
    fontWeight: 700,        // font-bold
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums' as const,
  },
} as const;

// ── Spacing Tokens ──
// Based on 4px base unit, matching Tailwind's default scale

export const spacing = {
  xs: 4,       // 1   in Tailwind
  sm: 8,       // 2
  md: 12,      // 3
  base: 16,    // 4
  lg: 24,      // 6
  xl: 32,      // 8
  '2xl': 48,   // 12
  '3xl': 64,   // 16
  '4xl': 80,   // 20
  '5xl': 96,   // 24
} as const;

// ── Border Radius Tokens ──
// Root --radius: 0.625rem (10px)

export const borderRadius = {
  sm: 6,     // calc(--radius - 4px)
  md: 8,     // calc(--radius - 2px)
  lg: 10,    // --radius
  xl: 14,    // calc(--radius + 4px)
  full: 9999,
} as const;

// ── Shadow Tokens ──

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.1)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.05)',
} as const;

// ── Icon Size Tokens ──

export const iconSizes = {
  inline: 14,    // size-3.5  — inline with text
  standard: 16,  // size-4    — standard buttons/nav
  emphasis: 20,  // size-5    — emphasis, CTA
  hero: 24,      // size-6    — hero / feature icons
} as const;

// ── Animation Tokens ──

export const animation = {
  // Framer Motion spring configs (used in Navbar, cards, etc.)
  springDefault: { stiffness: 300, damping: 25 },
  springSnappy: { stiffness: 400, damping: 30 },    // nav pill, hover
  springBouncy: { stiffness: 500, damping: 15 },    // badges, favorites

  // Duration constants
  durationFast: 0.15,     // micro-interactions (exit, quick fade)
  durationNormal: 0.3,    // standard transitions
  durationSlow: 0.5,      // large reveals, page transitions

  // Easing
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

// ── Breakpoint Tokens ──
// Match Tailwind's default breakpoints

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ── Z-Index Scale ──
// Prevents z-index wars by centralizing layers

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  top: 90,
} as const;

// ── Container Max Widths ──

export const containers = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '7xl': 1280,      // max-w-7xl — used in Navbar & Footer
  full: 1440,
} as const;
