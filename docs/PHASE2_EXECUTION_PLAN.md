# ASAS Phase 2 — Execution Plan

**Status:** ACTIVE — schema reconciliation / migration baseline validation
**Last verified:** 2026-08-24

## 1. Objective

Establish a truthful, reproducible and safe database contract between the live Supabase PostgreSQL database, the Prisma application schema, and the version-controlled migration strategy.

The internal ASAS ERP and external public real-estate website share the database but remain separate UX/application boundaries.

## 2. Current verified production state

- Supabase project: `xwokfufeeodobkuaxvgx`
- Public tables currently observed: 20
- Projects: 5 rows; all 5 currently published and none archived
- Apartments: 8 rows; all 8 currently published and none archived
- Leads: 1 row
- Developers: 1 row
- Project amenities: 19 rows
- Project images: 4 rows
- Apartment images: 19 rows
- Audit logs: 15 rows
- Admin users: 1 row
- Admin sessions: 1 row
- `media` currently contains 0 rows
- All inspected public tables have RLS enabled.
- Supabase has its own migration history with migrations dated 2026-08-18 through 2026-08-24.
- This Supabase migration history must not be confused with Prisma's `_prisma_migrations` history; they are separate migration systems.

## 3. Critical finding — Prisma migration path is currently unsafe

The repository contains:

- `prisma/migrations/` — legacy migration history
- `prisma/migrations/postgres/` — newer PostgreSQL-oriented history
- `prisma/schema.postgres.prisma` — current PostgreSQL Prisma contract

Current package scripts intentionally route production migration commands through `scripts/migrations/prisma-production-deploy-blocked.ts`. The package still uses Prisma 6.x, while the latest successful Vercel build generated Prisma Client 6.19.2 from the lockfile. The migration path must remain blocked until ownership/path is normalized.

Do not run `prisma migrate deploy` against production until this is resolved and independently verified.

## 4. Critical finding — existing Prisma migrations are not a truthful baseline

`prisma/migrations/postgres/0001_init/migration.sql` describes an older schema with TEXT IDs, globally unique apartment slugs, integer money/surface fields and other assumptions that do not match live PostgreSQL.

It must not be executed against the populated production database.

The baseline must be generated from the reconciled live-compatible Prisma contract, manually reviewed, and recorded as already applied according to Prisma's documented baselining workflow.

A baseline candidate definition is now documented in `docs/PHASE2_BASELINE_CANDIDATE.md`; the actual generated SQL is still awaiting execution in an environment with the repository's Prisma CLI and dependencies available.

## 5. Current schema contract findings

### Confirmed aligned

- UUID primary keys using database-side `gen_random_uuid()` representation in Prisma.
- Project slug globally unique.
- Apartment `(project_id, apartment_number)` unique.
- Apartment `(project_id, slug)` unique.
- Apartment `surface` and `price` represented as Prisma `Decimal`.
- `apartment_number` required.
- Project/Building/Apartment/Image/Lead relation graph is represented in Prisma.

### Remaining contract issues / decisions

1. `projects.developer_id` exists in live data but the corresponding FK to `developers.id` is not present in live PostgreSQL. Prisma currently models the relation. This is an intentional post-baseline hardening candidate, not a baseline assumption.
2. Live support tables not currently modeled as Prisma entities include `media`, `seo`, `analytics_events`, and `admin_profiles`. Ownership remains explicit; they must not be silently pulled into Prisma Migrate ownership.
3. RLS is enabled broadly. Existing public catalog policies were too broad and have now been hardened to published/non-archived boundaries. Administrative tables have not been opened with permissive policies.
4. Supabase Security Advisor reports `vector` in `public` and leaked-password protection disabled; these are infrastructure/security hardening tasks and require separate validation before changing production configuration.
5. Supabase Performance Advisor reports several unused indexes. These are low-priority at the current data volume and must not be removed solely because usage is currently zero.
6. The live apartment status default remains lowercase `available`, while application writes have been normalized to canonical uppercase values. The default should be changed only through a deliberate migration after the baseline strategy is established.

## 6. Applied Phase 2 database hardening

Migration:

`20260824025911_phase2_harden_public_rls_catalog_boundary`

Applied directly through the Supabase migration interface and recorded in `supabase_migrations.schema_migrations`.

Changes:

- public project SELECT now requires `published = true AND archived = false`;
- public apartment SELECT now requires `published = true AND archived = false`;
- public media SELECT now requires a published/non-archived project or apartment whose parent project is also published/non-archived;
- public newsletter UPDATE and DELETE privileges were revoked;
- unrestricted administrative public policies were not introduced.

The matching migration SQL is version-controlled at:

`supabase/migrations/20260824025911_phase2_harden_public_rls_catalog_boundary.sql`

Post-migration policy inspection confirmed the intended predicates and newsletter privilege reduction.

## 7. Migration strategy

1. Freeze accidental Prisma production deployment commands.
2. Finish column/type/default/constraint reconciliation.
3. Decide and document ownership of support tables.
4. Normalize the Prisma migration directory/configuration so there is one unambiguous migration history.
5. Generate a baseline from the reconciled schema in a runnable repository environment.
6. Review generated SQL and compare it with live database structure.
7. Do not execute the baseline against production.
8. Record the baseline as applied only after independent verification.
9. Create subsequent migrations only for intentional changes.
10. Introduce CI/CD migration deployment only after the migration path is deterministic and tested.

## 8. RLS strategy

Access matrix is documented in `docs/PHASE2_RLS_ACCESS_MATRIX.md`.

Implemented boundary hardening covers:

- public website SELECT for published catalog data;
- public newsletter INSERT without unrestricted public update/delete;
- existing public lead INSERT;
- existing public analytics INSERT;
- administrative tables remain closed unless an explicit policy exists.

The authenticated ERP access model still requires application-route verification before broad authenticated CRUD policies are introduced.

## 9. Acceptance gates

Phase 2 is not complete yet. Remaining gates include:

- runnable Prisma baseline SQL generated from the checked-in schema;
- baseline SQL reviewed against live PostgreSQL;
- one deterministic Prisma migration history established;
- constraints and delete actions reconciled;
- application contract fully reconciled against nullable/default/status semantics;
- RLS access matrix fully verified against all ERP/public routes;
- Supabase security/performance findings fully triaged;
- Prisma validate/generate/typecheck/lint/build verified from the current main commit;
- production smoke tests after the latest database hardening;
- no known accidental migration path can target production with the obsolete history.

## 10. External research used

- Prisma baselining: https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining
- Prisma migrate diff: https://docs.prisma.io/docs/cli/migrate/diff
- Prisma migration status: https://docs.prisma.io/docs/cli/migrate/status
- Prisma migration history: https://www.prisma.io/docs/orm/v6/prisma-migrate/understanding-prisma-migrate/migration-histories
- Prisma config/migration path: https://docs.prisma.io/docs/orm/v6/reference/prisma-config-reference
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase migrations: https://supabase.com/docs/guides/deployment/database-migrations

## 11. Engineering rule

No Prisma baseline has been applied to production. Supabase changes are applied only through named, version-controlled migrations. Prisma production deployment remains fail-closed until the baseline and migration ownership are deterministic.
