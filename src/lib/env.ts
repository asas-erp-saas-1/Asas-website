/** Centralised, server-only environment validation for ASAS. */

type EnvTier = 'production' | 'development' | 'test';

function getTier(): EnvTier {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'test') return 'test';
  return 'development';
}

/** Next.js evaluates server modules while producing the build output. Runtime
 * secrets must not be required merely to import a route during `next build`.
 */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function required(name: string, value: string | undefined, tier: EnvTier): string {
  if (value && value.trim()) return value.trim();
  if (tier === 'production' && !isBuildPhase()) {
    throw new Error(`[env] Missing required environment variable: ${name}. Set it in Vercel project settings → Environment Variables.`);
  }
  if (!isBuildPhase()) {
    console.warn(`[env] WARNING: ${name} is not set — using dev placeholder.`);
  }
  return '';
}

function optional(value: string | undefined, fallback = ''): string {
  return value && value.trim() ? value.trim() : fallback;
}

function optionalInt(value: string | undefined, fallback: number): number {
  if (!value || !value.trim()) return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function firstSet(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => Boolean(value && value.trim()));
}

function buildEnv() {
  const tier = getTier();

  // Supabase/Vercel integrations may expose the PostgreSQL connection as
  // POSTGRES_PRISMA_URL or POSTGRES_URL. DATABASE_URL remains the canonical
  // name used by Prisma. VITE_* aliases are accepted for the public Supabase
  // values because they were already configured manually by the project owner.
  const DATABASE_URL = required(
    'DATABASE_URL',
    firstSet(
      process.env.DATABASE_URL,
      process.env.POSTGRES_PRISMA_URL,
      process.env.POSTGRES_URL,
    ),
    tier,
  );
  const DIRECT_URL = optional(
    firstSet(process.env.DIRECT_URL, process.env.POSTGRES_URL_NON_POOLING),
  );
  const SHADOW_DATABASE_URL = optional(process.env.SHADOW_DATABASE_URL);

  const NEXT_PUBLIC_SITE_URL = required(
    'NEXT_PUBLIC_SITE_URL',
    firstSet(process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`),
    tier,
  ) || 'http://localhost:3000';

  const NEXT_PUBLIC_SUPABASE_URL = optional(
    firstSet(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.VITE_SUPABASE_URL),
  );
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = optional(
    firstSet(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.VITE_SUPABASE_ANON_KEY,
    ),
  );

  const ADMIN_SESSION_TTL_MS = optionalInt(
    process.env.ADMIN_SESSION_TTL,
    8 * 60 * 60 * 1000,
  );
  const SUPABASE_SERVICE_ROLE_KEY = optional(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const SUPABASE_STORAGE_CONFIGURED = Boolean(
    NEXT_PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY,
  );
  const tierIsProduction = tier === 'production';

  return {
    DATABASE_URL,
    DIRECT_URL,
    SHADOW_DATABASE_URL,
    NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_CONFIGURED,
    ADMIN_SESSION_TTL_MS,
    isProduction: tierIsProduction,
    isBuildPhase: isBuildPhase(),
    isVercel: Boolean(process.env.VERCEL),
    tier,
  };
}

export const env = buildEnv();
export type Env = ReturnType<typeof buildEnv>;

export function isSupabaseStorageConfigured(): boolean {
  return env.SUPABASE_STORAGE_CONFIGURED;
}
