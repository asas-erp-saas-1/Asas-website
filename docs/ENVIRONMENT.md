# Environment Variables — Full Reference

Source of truth: `.env.example` at the repo root. Validated by `src/lib/env.ts`.

> **Classification** (Phase 2 directive §6):
> `PUBLIC` — safe to expose to the browser (`NEXT_PUBLIC_*` prefix only).
> `SERVER` — server-only; never prefixed with `NEXT_PUBLIC_`.
> `DATABASE` — connection strings; server-only.
> `AUTH` — session/cookie secrets; server-only.
> `STORAGE` — Supabase Storage credentials; `service_role` is server-only.
> `DEPLOYMENT` — environment markers.

Any var containing `SECRET`/`PRIVATE`/`SERVICE_ROLE`/`PASSWORD` is implicitly server-only and
MUST NEVER be prefixed with `NEXT_PUBLIC_`. The Next.js compiler inlines any `NEXT_PUBLIC_*`
var into the client bundle — never put a secret there.

---

## Variable matrix

| Name                              | Class       | Required? | Default / behavior                              | Dev | Preview | Prod |
| --------------------------------- | ----------- | --------- | ----------------------------------------------- |:---:|:-------:|:----:|
| `DATABASE_URL`                    | DATABASE    | **YES**   | —                                               | ●   | ●       | ●    |
| `DIRECT_URL`                      | DATABASE    | Prod only | (SQLite ignores)                                 | ○   | ●       | ●    |
| `SHADOW_DATABASE_URL`             | DATABASE    | Optional  | (only for `prisma migrate dev` on Postgres)     | ○   | ○       | —    |
| `NEXT_PUBLIC_SITE_URL`            | PUBLIC      | **YES**   | `http://localhost:3000` fallback in dev only    | ●   | ●       | ●    |
| `NEXT_PUBLIC_SUPABASE_URL`         | PUBLIC      | Prod¹     | —                                                | ○   | ●       | ●    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | PUBLIC      | Prod¹     | —                                                | ○   | ●       | ●    |
| `SUPABASE_SERVICE_ROLE_KEY`       | STORAGE     | Prod¹     | —                                                | ○   | ●       | ●    |
| `ADMIN_SESSION_TTL`               | AUTH        | Optional  | `28800000` (8 hours, ms)                         | ○   | ○       | ○    |
| `ADMIN_SESSION_DRIVER`            | AUTH        | Optional  | `db` in prod, `memory` in dev                    | ○   | ●       | ●    |
| `ADMIN_BOOTSTRAP_PASSWORD`        | AUTH        | Bootstrap | Random 24-char printed once if unset             | ○   | ●²      | ●²   |
| `SEED_REFUSE_NON_EMPTY`           | DEPLOYMENT  | Optional  | `false`. `true` = refuse to seed populated DB   | ○   | ●       | ●    |

Legend: ● = set, ○ = optional / not set, — = not applicable.
¹ Required in production; without it the storage layer throws 503 on every upload.
² Only required on the very first seed run on a fresh database; afterward it is
ignored by the idempotent `upsert`-based seed.

---

## DATABASE tier

### `DATABASE_URL`
- **Class:** DATABASE (server-only).
- **Required:** YES (all tiers).
- **Dev value:** `file:./db/custom.db` — relative SQLite path.
- **Prod value:** Supabase pooled Postgres URL on port `6543`:
  `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres`
- **Validation:** `src/lib/env.ts` throws in production if missing. In dev, returns empty
  string + console warning (so the dev server still boots with a clear error visible).
- **Used by:** the Prisma client (`src/lib/db.ts`) for all runtime queries.

### `DIRECT_URL`
- **Class:** DATABASE (server-only).
- **Required:** YES in production; optional in dev (SQLite ignores it).
- **Prod value:** Supabase direct Postgres URL on port `5432`:
  `postgresql://postgres.[ref]:[pw]@aws-0-[region].supabase.com:5432/postgres`
- **Why both:** pooled connections (`DATABASE_URL`) cannot run `prisma migrate deploy`
  reliably because migrations need a session-scoped connection. Prisma uses `DIRECT_URL`
  for migrations and `DATABASE_URL` for runtime. See [`docs/DATABASE.md`](DATABASE.md) §4.

### `SHADOW_DATABASE_URL`
- **Class:** DATABASE (server-only).
- **Required:** Only for `prisma migrate dev` on Postgres (i.e. local dev against a
  Postgres database, not SQLite). Production deploys never need it.
- **Supabase recipe:** create a separate "shadow" Supabase project, or use a `__shadow`
  schema in the same project.

---

## PUBLIC tier (browser-safe)

### `NEXT_PUBLIC_SITE_URL`
- **Class:** PUBLIC (inlined into the client bundle).
- **Required:** YES.
- **Dev default:** `http://localhost:3000` (if unset in dev).
- **Prod value:** canonical production URL, e.g. `https://asas.dz`.
- **Used by:** sitemap (`src/app/sitemap.ts`), canonical URLs, OpenGraph tags,
  JSON-LD structured data, manifest.

### `NEXT_PUBLIC_SUPABASE_URL`
- **Class:** PUBLIC.
- **Required:** Production only (when Supabase Storage is wired).
- **Value:** `https://[project-ref].supabase.co`.
- **Used by:** `src/lib/storage.ts` — gated check `isSupabaseStorageConfigured()` returns
  true iff this AND `SUPABASE_SERVICE_ROLE_KEY` are both set. The Supabase client is
  lazy-imported so it never appears in the browser bundle.

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Class:** PUBLIC.
- **Required:** Production only (paired with the URL above).
- **Value:** Supabase anon public key (safe for browser — Supabase RLS protects rows).
- **Used by:** reserved for client-side reads if/when added; not currently imported
  by any client component.

---

## STORAGE tier (server-only)

### `SUPABASE_SERVICE_ROLE_KEY`
- **Class:** STORAGE (server-only). NEVER prefix with `NEXT_PUBLIC_`.
- **Required:** Production only (paired with `NEXT_PUBLIC_SUPABASE_URL`).
- **Value:** Supabase service_role JWT (full DB + Storage bypass RLS).
- **Used by:** `src/lib/storage.ts` → `getSupabaseAdmin()` creates a service-role client
  for `saveBlob` / `deleteBlob`. Lazy-imported so it never touches the client bundle.
- **Leak prevention:** grep the repo — no `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` exists, and
  `src/lib/env.ts` reads the var only via `process.env`, never inlined.

---

## AUTH tier (server-only)

### `ADMIN_SESSION_TTL`
- **Class:** AUTH.
- **Required:** Optional.
- **Default:** `28800000` (8 hours, in milliseconds).
- **Used by:** `src/lib/admin-auth.ts` → `SESSION_TTL_MS`. The session row's `expiresAt`
  is set to `now + TTL` at login; expired rows are pruned opportunistically on every
  `verifyAdminAuth` call.

### `ADMIN_SESSION_DRIVER`
- **Class:** AUTH.
- **Required:** Optional.
- **Default:** `db` in production, `memory` in dev.
- **Values:** `db` (use the `AdminSession` table — multi-instance safe, one DB round-trip
  per protected request) or `memory` (in-process `Map` — dev only, breaks under
  multi-instance serverless).
- **Override:** only set this for testing; production should let it default to `db`.

### `ADMIN_BOOTSTRAP_PASSWORD`
- **Class:** AUTH.
- **Required:** Only on the first seed of a fresh production database.
- **Behavior:** read **once** in `prisma/seed.ts` (`process.env.ADMIN_BOOTSTRAP_PASSWORD`).
  If set, the admin user is created/upserted with that password (bcrypt-hashed). If unset,
  a random 24-char password is generated, the admin user is created with it, and the
  password is printed ONCE to stdout (never persisted, never shown again).
- **Lifecycle:** after the first seed, subsequent seed runs use `upsert` and do not
  overwrite the password hash, so the env var is silently ignored. Rotate the password
  via the admin UI (Users tab) instead.
- **Security:** never commit this value. Set it in your terminal session, run the seed,
  then unset. For Vercel env vars, do NOT set this as a project-wide var unless you
  intend to re-bootstrap on every deploy (you don't — the seed only runs on operator
  demand).

---

## DEPLOYMENT tier

### `SEED_REFUSE_NON_EMPTY`
- **Class:** DEPLOYMENT.
- **Required:** Optional; recommended `true` in CI and production envs.
- **Default:** `false`.
- **Behavior:** when `true`, `prisma/seed.ts` checks `prisma.project.count()` at start
  and refuses to seed if any project exists (logs a warning, exits 0). This is a final
  guard against accidental data destruction — the seed is already idempotent (uses
  `upsert`), but this still prevents a CI pipeline from silently mutating a populated
  production database if `DATABASE_URL` is misconfigured.
- **Set in:** Vercel project env (Production + Preview), CI workflow env, any shell that
  runs `bun run db:seed` against a non-fresh database.

---

## Vercel-set vars (do not declare)

These are set automatically by Vercel and read by `src/lib/env.ts`:

- `NODE_ENV` — `production` / `development` / `test`. Drives the `tier` getter.
- `VERCEL` — truthy on Vercel. Exposed as `env.isVercel`.
- `VERCEL_ENV` — `production` / `preview` / `development`.
- `VERCEL_URL` — ephemeral deploy URL (useful for preview deploys).
- `NEXT_PUBLIC_VERCEL_ENV` — same as `VERCEL_ENV` but inlined into the client.

---

## Validation behavior (`src/lib/env.ts`)

The `env` object is built once at module load:

```ts
import { env } from '@/lib/env';
env.DATABASE_URL            // throws in prod if missing; returns '' in dev with warning
env.NEXT_PUBLIC_SITE_URL    // throws in prod if missing
env.ADMIN_SESSION_TTL_MS    // parsed int, defaults to 8h
env.SUPABASE_STORAGE_CONFIGURED  // derived: Boolean(NEXT_PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
env.isProduction            // tier === 'production'
env.isVercel                // Boolean(process.env.VERCEL)
```

Production failure mode: throws an `Error` whose message names the missing var and
points to this doc + `.env.example`. The error fires on first access of `env`, which
is at module import — so it surfaces during cold start of any API route that imports
`@/lib/env` (transitively via `db.ts`, `admin-auth.ts`, `storage.ts`). Vercel's log
drain captures the stack trace.

---

## Per-tier `.env` recipes

### `.env` (development)
```env
DATABASE_URL=file:./db/custom.db
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_SESSION_TTL=28800000
# Supabase vars optional in dev (local fs fallback in src/lib/storage.ts)
# ADMIN_BOOTSTRAP_PASSWORD unset → seed prints a random password once
```

### `.env.production` (or Vercel project envs — Production scope)
```env
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].supabase.com:5432/postgres
NEXT_PUBLIC_SITE_URL=https://asas.dz
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_SESSION_TTL=28800000
ADMIN_SESSION_DRIVER=db
SEED_REFUSE_NON_EMPTY=true
```

### `.env.preview` (Vercel Preview scope)
Same as Production but with `NEXT_PUBLIC_SITE_URL` set to the preview deploy URL
(`https://asas-pr-<n>.vercel.app`) and `SEED_REFUSE_NON_EMPTY=true`. Preview databases
should be a separate Supabase branch or a separate project — never share production.

---

## Security checklist for env vars

- [ ] No `NEXT_PUBLIC_*` var holds a secret (service_role, password, JWT secret).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only in Vercel → Settings → Environment Variables,
      scoped to Production (and Preview if you have a preview Supabase project).
- [ ] `.env` (dev) is gitignored. `.env.example` is the only env file committed.
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` is set in the operator's shell, never as a Vercel env
      var unless you intend to re-bootstrap on every deploy.
- [ ] `SEED_REFUSE_NON_EMPTY=true` is set in CI and in any shell that targets a
      non-fresh production database.

See [`docs/SECURITY.md`](SECURITY.md) for the full security posture.
