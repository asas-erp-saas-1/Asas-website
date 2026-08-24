# ASAS Real Estate Platform

> **Verified production architecture (2026-08-24):** Next.js 16 + TypeScript + Prisma 6.19.2 + PostgreSQL on Supabase + Vercel.
>
> This repository is currently a **premium real-estate public website + Admin CMS**. It is being engineered with ERP-grade data integrity, security, auditability and operational discipline, but it is **not yet a full ERP/accounting/construction system**. Do not treat future ERP capabilities as implemented features.

## Current engineering status

- **Phase 1 — deployment/type-contract stabilization:** closed for the original production blocker.
- **Phase 2 — Database Engineering & Schema Contract:** active.
- **Production database:** existing Supabase PostgreSQL is the source of truth until the schema contract is fully reconciled.
- **Prisma Migrate baseline:** **not yet applied to production**. Do not run `prisma db push`, reset production, or apply the old `prisma/migrations/postgres/0001_init` migration blindly.
- **Current Vercel deployment:** the latest commit is being validated in production CI/CD; check Vercel before declaring a release green.
- **Live database:** 20 public tables were observed during the current audit; ownership is being classified before migration baselining.

The authoritative current state is maintained in [`docs/ENGINEERING_SOURCE_OF_TRUTH.md`](docs/ENGINEERING_SOURCE_OF_TRUTH.md) and [`docs/PHASE2_SCHEMA_CONTRACT.md`](docs/PHASE2_SCHEMA_CONTRACT.md).

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + Turbopack |
| Language | TypeScript 5, strict build/type checking |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Database | PostgreSQL on Supabase (production) |
| ORM | Prisma 6.19.2 |
| Auth | DB-backed bcrypt + httpOnly cookie sessions |
| RBAC | ADMIN / EDITOR / VIEWER, enforced server-side |
| State | Zustand + TanStack Query v5 |
| Validation | Zod |
| Storage | Supabase Storage in production; local development fallback where explicitly supported |
| Deployment | Vercel |

## Database rules — non-negotiable

1. Production Supabase PostgreSQL is the current database source of truth.
2. Never run `prisma db push` against production.
3. Never run `prisma migrate reset` against production.
4. Never apply the historical `0001_init` migration blindly; it does not represent the current live database.
5. Before the first production Prisma baseline, reconcile tables, columns, types, nullability, defaults, relations, constraints, indexes and RLS.
6. After baseline, all future schema changes must be committed migration files and deployed through a controlled migration pipeline.
7. Do not weaken the database contract merely to silence TypeScript; fix the application boundary instead.
8. Stable database IDs are identities. Public slugs are routing identifiers and may be scoped by parent entity.
9. Any destructive production migration requires an explicit backup/rollback plan and pre-production verification.

## Development commands

```bash
bun install
bun run db:generate
bun run typecheck
bun run lint
bun run build
```

The repository's current `package.json` does not define a production-safe `db:push` command. Do not invent one.

## Production verification

Every release candidate must pass:

1. Prisma generation
2. TypeScript typecheck
3. Next.js production build
4. Vercel deployment status
5. Runtime error inspection
6. Public catalog smoke tests
7. Admin authentication/RBAC smoke tests
8. Database contract verification

## Repository structure

```text
prisma/
  schema.postgres.prisma        # current PostgreSQL application contract
  migrations/                   # migration history; baseline is being rebuilt safely
src/
  app/                          # Next.js App Router + API routes
  components/                   # public/admin UI
  lib/                          # database, auth, storage, logging, security
scripts/                        # operational scripts
.github/workflows/              # CI
vercel.json                     # Vercel configuration
docs/                           # engineering specifications and runbooks
```

## Source-of-truth hierarchy

When documents disagree, use this order:

1. **Live Supabase PostgreSQL schema/data** for current production reality.
2. **Current source code on `main`** for implemented application behavior.
3. **Current Prisma PostgreSQL schema** for the intended ORM contract under reconciliation.
4. **Current engineering baseline documents** for decisions and migration strategy.
5. Older audit/phase documents are historical evidence only and must not override verified current state.

## Documentation

- [`docs/ENGINEERING_SOURCE_OF_TRUTH.md`](docs/ENGINEERING_SOURCE_OF_TRUTH.md) — current architecture, scope, verified facts, decisions and next gates.
- [`docs/PHASE2_SCHEMA_CONTRACT.md`](docs/PHASE2_SCHEMA_CONTRACT.md) — Prisma ↔ Supabase reconciliation and migration safety.
- [`docs/PHASE2_TABLE_OWNERSHIP.md`](docs/PHASE2_TABLE_OWNERSHIP.md) — live table ownership classification.
- [`docs/DATABASE_INDEX_STRATEGY.md`](docs/DATABASE_INDEX_STRATEGY.md) — reconciled PostgreSQL index strategy.
- [`docs/PRODUCTION_RUNBOOK.md`](docs/PRODUCTION_RUNBOOK.md) — production operational procedures; verify against the source-of-truth before executing.

Historical documents remain in Git for auditability. If a historical document conflicts with the current source of truth, it must be treated as superseded rather than as an instruction.

## Testing

```bash
bun run lint
bun run typecheck
bun run build
```

A passing build is necessary but not sufficient for production readiness. Database, security, RLS and runtime smoke tests are separate release gates.

## Scope boundary

The current product is a real-estate sales/marketing website and Admin CMS. Future ERP-grade modules may include reservations, contracts, finance, inventory workflows, commissions and deeper CRM operations, but those are **future scope unless present in the verified source and database contract**.

## License

Proprietary — ASAS Real Estate. All rights reserved.