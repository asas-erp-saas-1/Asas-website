/**
 * Environment variable validation.
 *
 * In production, the application MUST fail clearly when a required
 * environment variable is missing — silent fallbacks lead to runtime errors
 * that are hard to diagnose (e.g. connecting to a wrong DB, missing auth
 * secrets, exposing the wrong canonical URL).
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const url = env.DATABASE_URL;            // throws if missing in prod
 *   const siteUrl = env.NEXT_PUBLIC_SITE_URL;
 *
 * Classification (per Phase 2 directive §6):
 *   PUBLIC      — safe to expose to the browser (NEXT_PUBLIC_* prefix)
 *   SERVER      — server-only, never prefixed with NEXT_PUBLIC_
 *   DATABASE    — connection strings, server-only
 *   AUTH        — session/cookie secrets, server-only
 *   STORAGE     — Supabase Storage credentials, server-only for service_role
 *
 * Variables classified SERVER / DATABASE / AUTH / STORAGE are NEVER exposed
 * to client code (no NEXT_PUBLIC_ prefix). The validation runs server-side
 * only.
 */

type EnvTier = 'production' | 'development' | 'test';

function getTier(): EnvTier {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'test') return 'test';
  return 'development';
}

function required(name: string, value: string | undefined, tier: EnvTier): string {
  if (value && value.trim()) return value.trim();
  // In production: missing required env var = hard fail.
  if (tier === 'production') {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
      `Set it in your Vercel project settings → Environment Variables. ` +
      `See .env.example for the full list.`,
    );
  }
  // In development: return a placeholder so the dev server still boots.
  // The developer will see a clear warning in the console.
  console.warn(`[env] WARNING: ${name} is not set — using dev placeholder.`);
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

/**
 * Centralised, validated environment accessor.
 *
 * Access pattern:
 *   import { env } from '@/lib/env';
 *   env.DATABASE_URL     // validated
 *   env.NEXT_PUBLIC_SITE_URL
 *   env.ADMIN_SESSION_TTL_MS
 *
 * NOTE: This module is safe to import from server code only (API routes,
 * server components, server utilities). Do NOT import from 'use client' files.
 */
function buildEnv() {
  const tier = getTier();

  // ─── DATABASE (server-only) ────────────────────────────────────────
  const DATABASE_URL = required('DATABASE_URL', process.env.DATABASE_URL, tier);
  // DIRECT_URL is required for Prisma migrate (non-pooled connection).
  // In SQLite dev mode, it can be omitted.
  const DIRECT_URL = optional(process.env.DIRECT_URL);
  // Shadow DB for Prisma migrate in non-SQLite dev. Optional.
  const SHADOW_DATABASE_URL = optional(process.env.SHADOW_DATABASE_URL);

  // ─── PUBLIC (browser-safe) ─────────────────────────────────────────
  const NEXT_PUBLIC_SITE_URL = required(
    'NEXT_PUBLIC_SITE_URL',
    process.env.NEXT_PUBLIC_SITE_URL,
    tier,
  ) || 'http://localhost:3000';
  const NEXT_PUBLIC_SUPABASE_URL = optional(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = optional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // ─── AUTH ──────────────────────────────────────────────────────────
  // Session TTL in milliseconds (default 8 hours).
  const ADMIN_SESSION_TTL_MS = optionalInt(process.env.ADMIN_SESSION_TTL, 8 * 60 * 60 * 1000);

  // ─── STORAGE (server-only) ────────────────────────────────────────
  // The service-role key is server-only. NEVER prefix with NEXT_PUBLIC_.
  const SUPABASE_SERVICE_ROLE_KEY = optional(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Derived: is Supabase Storage wired?
  const SUPABASE_STORAGE_CONFIGURED = Boolean(
    NEXT_PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY,
  );

  // ─── DEPLOYMENT ───────────────────────────────────────────────────
  const isProduction = tier === 'production';
  const isVercel = Boolean(process.env.VERCEL);

  return {
    // DATABASE
    DATABASE_URL,
    DIRECT_URL,
    SHADOW_DATABASE_URL,
    // PUBLIC (browser-safe)
    NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // AUTH
    ADMIN_SESSION_TTL_MS,
    // STORAGE (server-only)
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_CONFIGURED,
    // DEPLOYMENT
    isProduction,
    isVercel,
    tier,
  };
}

export const env = buildEnv();

export type Env = ReturnType<typeof buildEnv>;

/**
 * Quick check: is the storage layer pointing at Supabase?
 * Useful in routes that need to know whether to return a public URL vs a
 * signed URL (Supabase Storage private bucket).
 */
export function isSupabaseStorageConfigured(): boolean {
  return env.SUPABASE_STORAGE_CONFIGURED;
}
