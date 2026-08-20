# ASAS Real Estate Platform

> **Production packaging:** PostgreSQL/Supabase is the production runtime. Prisma now generates separate PostgreSQL and SQLite clients so the existing SQLite content can be migrated safely without changing the production client.

Production-grade real-estate CMS + public website on Next.js 16 + Prisma + PostgreSQL (Supabase).
Includes DB-backed admin sessions, Supabase Storage abstraction, honeypot-protected lead
capture, structured logging, and a 24-action audit log.

> **Status:** Phase 2 release-ready. Deployed via Vercel + Supabase.
> Full runbook: [`docs/PRODUCTION_RUNBOOK.md`](docs/PRODUCTION_RUNBOOK.md).

---

## Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                            |
| Language   | TypeScript 5 (strict, `ignoreBuildErrors: false`)            |
| Styling    | Tailwind CSS 4 + shadcn/ui (New York) + Radix UI              |
| Database   | Prisma 6.19 — SQLite (dev), PostgreSQL/Supabase (production)  |
| Auth       | DB-backed bcrypt + httpOnly cookie (8h TTL, `AdminSession` table) |
| RBAC       | ADMIN / EDITOR / VIEWER — enforced per route via `sessionHasRole` |
| State      | Zustand (client), TanStack Query v5 (server)                  |
| Validation | Zod 4 on every mutation                                       |
| Storage    | `src/lib/storage.ts` — Supabase Storage (prod) / local fs (dev) |
| Logging    | `src/lib/logger.ts` — NDJSON in prod, color in dev, PII-redact |
| CI         | `.github/workflows/ci.yml` — lint + typecheck + build          |

---

## Quick start (development)

```bash
bun install
bun run db:generate   # generate both PostgreSQL + SQLite clients
bun run db:push        # apply SQLite schema (dev only — never use in prod)
bun run db:seed        # idempotent seed (4 projects, 28 apartments, admin user)
bun run dev            # http://localhost:3000
```

If `ADMIN_BOOTSTRAP_PASSWORD` is unset, the seed prints a random 24-char password **once**.
Save it; it is never persisted or shown again. See [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

---

## Phase 2 changes (highlights)

- **DB-backed admin sessions** — `AdminSession` table; in-memory Map only in dev. Selected by
  `ADMIN_SESSION_DRIVER` (`db` in prod, `memory` in dev). Multi-instance safe on Vercel. See
  [`docs/SECURITY.md`](docs/SECURITY.md) §1.2.
- **Storage abstraction** — `src/lib/storage.ts` auto-detects Supabase Storage when
  `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set, and falls back to local
  filesystem under `/public/uploads` only in dev. In production without Supabase, `saveBlob`
  throws with a clear 503-style message instead of EROFS on Vercel's read-only filesystem.
- **Migrations, not `db push`** — production uses `prisma migrate deploy` against committed
  baselines under `prisma/migrations/postgres/0001_init/`. See [`docs/DATABASE.md`](docs/DATABASE.md).
- **CI** — `.github/workflows/ci.yml` runs lint + typecheck + build on every PR. Migrations are
  never run from CI (operator-driven only). See the file header for rationale.
- **Honeypot on lead + newsletter** — hidden `website` field; bot fill = fake 201 success + log.
- **Cache strategy** — public read endpoints use `withPublicCache()` (`s-maxage=60,
  stale-while-revalidate=300`); admin/mutation routes use `withSecurityHeaders()` (`no-store`).
  See `src/lib/with-security-headers.ts`.
- **Structured logger** — `src/lib/logger.ts`. NDJSON in prod, color in dev. PII redaction
  (phone/email → first 4 chars + bullets). Secret keys (`password`, `token`, `cookie`,
  `databaseUrl`, `serviceRoleKey`) are redacted to `[REDACTED]`. `withLogging()` HOF wraps routes.
- **New env vars** — `ADMIN_SESSION_DRIVER`, `ADMIN_BOOTSTRAP_PASSWORD`, `SEED_REFUSE_NON_EMPTY`.
  Full reference: [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

---

## Production deployment (short version)

1. Create a Supabase project; copy pooled (`DATABASE_URL`) + direct (`DIRECT_URL`) URLs.
2. Create a `media` bucket in Supabase Storage (public read).
3. Apply the production schema:
   ```bash
   DATABASE_URL=postgresql://...pooler...:6543/postgres \
   DIRECT_URL=postgresql://...direct...:5432/postgres \
   bunx prisma migrate deploy --schema=prisma/schema.postgres.prisma
   ```
4. Migrate data from SQLite (idempotent, preserves IDs):
   ```bash
   DATABASE_URL=postgresql://...pooler...:6543/postgres \
   bun run scripts/migrate-to-postgres.ts
   ```
5. Bootstrap the production admin user (one-time; does not seed demo content):
   ```bash
   ADMIN_EMAIL='admin@example.com' \
   ADMIN_NAME='ASAS Admin' \
   ADMIN_BOOTSTRAP_PASSWORD='choose-a-strong-password-16chars-min' \
   bun run db:seed:postgres
   ```
6. Push to GitHub → import into Vercel → set env vars (see `.env.example`) → Deploy.

Full procedure + rollback + troubleshooting: [`docs/PRODUCTION_RUNBOOK.md`](docs/PRODUCTION_RUNBOOK.md).

---

## Project structure

```
prisma/
  schema.prisma              # SQLite dev schema (15 models incl. AdminSession)
  schema.postgres.prisma     # PostgreSQL production schema (native Json/Text)
  migrations/postgres/0001_init/   # committed baseline migration
  seed.ts                     # idempotent; reads ADMIN_BOOTSTRAP_PASSWORD
src/
  app/api/                    # 30+ route handlers (public + admin)
  components/{pages,shared,ui}/
  lib/
    admin-auth.ts             # bcrypt + DB sessions + RBAC helpers
    audit.ts                  # logAudit() — best-effort, 8KB cap
    storage.ts                # saveBlob/deleteBlob — Supabase or local fs
    env.ts                    # validated env accessor; throws on missing prod vars
    logger.ts                 # structured NDJSON logger with PII redaction
    with-security-headers.ts  # withSecurityHeaders / withPublicCache
    db.ts                     # Prisma client singleton
scripts/migrate-to-postgres.ts # SQLite → PostgreSQL, idempotent, preserves IDs
.github/workflows/ci.yml      # PR/push: lint + typecheck + build
vercel.json                   # build/install/region config
.env.example                  # all env vars with classification
docs/                         # see Documentation section below
```

---

## Documentation

| Document                                            | Purpose                                                |
| --------------------------------------------------- | ------------------------------------------------------ |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)        | Every env var, classification, defaults, tier per var  |
| [`docs/SECURITY.md`](docs/SECURITY.md)              | Auth, RBAC, rate limits, honeypot, audit, headers, risks |
| [`docs/DATABASE.md`](docs/DATABASE.md)              | Models, indexes, migrations, connection pooling, JSON  |
| [`docs/PRODUCTION_RUNBOOK.md`](docs/PRODUCTION_RUNBOOK.md) | Pre-deploy checklist, deploy/migrate/rollback/backup, on-call |
| `docs/ARCHITECTURE.md`                              | System architecture                                    |
| `docs/ADMIN_GUIDE.md`                               | Admin CMS user guide                                   |
| `docs/PHASE_2_DECISIONS.md`                         | Decision log for Phase 2 changes                       |

---

## Testing

```bash
bun run lint            # ESLint — must be 0 errors
bun run typecheck       # tsc --noEmit — must be 0 errors
bun run build           # next build — must succeed (CI gate)
```

CI runs all three on every PR (`.github/workflows/ci.yml`). A unit-test suite for
pure business logic (status transitions, magic-bytes verification, slug generation)
is planned but not yet present.

---

## License

Proprietary — ASAS Real Estate. All rights reserved.
