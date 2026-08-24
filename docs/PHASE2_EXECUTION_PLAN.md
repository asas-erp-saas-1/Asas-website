# ASAS Phase 2 — Execution Plan

**Status:** ACTIVE — forensic reconciliation / baseline preparation
**Last verified:** 2026-08-24

## 1. Objective

Establish a truthful, reproducible and safe database contract between the live Supabase PostgreSQL database, the Prisma application schema, and the version-controlled migration strategy.

The internal ASAS ERP and external public real-estate website share the database but must remain separate UX/application boundaries.

## 2. Current verified production state

- Supabase project: `xwokfufeeodobkuaxvgx`
- Public tables currently observed: 20
- Projects: 5 rows
- Apartments: 8 rows
- Leads: 1 row
- Developers: 1 row
- Project amenities: 19 rows
- Project images: 4 rows
- Apartment images: 19 rows
- Audit logs: 15 rows
- Admin users: 1 row
- Admin sessions: 1 row
- All inspected public tables have RLS enabled.
- Supabase has its own migration history with migrations dated 2026-08-18 through 2026-08-22.
- This Supabase migration history must not be confused with Prisma's `_prisma_migrations` history; they are separate migration systems.

## 3. Critical finding — Prisma migration path is currently unsafe

The repository contains:

- `prisma/migrations/` — legacy migration history
- `prisma/migrations/postgres/` — newer PostgreSQL-oriented history
- `prisma/schema.postgres.prisma` — current PostgreSQL Prisma contract

Current package scripts call `prisma migrate deploy --schema=prisma/schema.postgres.prisma`, but Prisma CLI migration discovery is not explicitly configured to use `prisma/migrations/postgres` in the current Prisma 6.11.x package configuration.

Therefore the production migration command must be considered **BLOCKED / unsafe to invoke** until migration ownership/path is normalized.

Do not run `prisma migrate deploy` against production until this is resolved and independently verified.

## 4. Critical finding — existing Prisma migrations are not a truthful baseline

`prisma/migrations/postgres/0001_init/migration.sql` still describes an older schema with TEXT IDs, globally unique apartment slugs, integer money/surface fields and other assumptions that do not match live PostgreSQL.

It must not be executed against the populated production database.

The baseline must be generated from the reconciled live-compatible Prisma contract, manually reviewed, and recorded as already applied according to Prisma's documented baselining workflow.

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
2. Live support tables not currently modeled as Prisma entities include `media`, `seo`, `analytics_events`, and `admin_profiles`. Ownership must remain explicit; they must not be silently pulled into Prisma Migrate ownership.
3. RLS is enabled broadly, but several tables have no policies. This is a security-design task, not a reason to add permissive policies blindly.
4. Supabase Security Advisor reports `vector` in `public` and leaked-password protection disabled; these are infrastructure/security hardening tasks and require separate validation before changing production configuration.
5. Supabase Performance Advisor reports several unused indexes. These are low-priority at the current data volume and must not be removed solely because usage is currently zero.
6. The live apartment status default remains lowercase `available`, while application writes have been normalized to canonical uppercase values. The default should be changed only through a deliberate migration after the baseline strategy is established.

## 6. Migration strategy

1. Freeze accidental Prisma production deployment commands.
2. Finish column/type/default/constraint reconciliation.
3. Decide and document ownership of support tables.
4. Normalize the Prisma migration directory/configuration so there is one unambiguous migration history.
5. Generate a baseline from the reconciled schema.
6. Review generated SQL and compare it with live database structure.
7. Do not execute the baseline against production.
8. Record the baseline as applied only after independent verification.
9. Create subsequent migrations only for intentional changes.
10. Introduce CI/CD migration deployment only after the migration path is deterministic and tested.

## 7. RLS strategy

Build an access matrix before changing policies:

- public website SELECT for published catalog data;
- public lead INSERT;
- public newsletter INSERT/controlled update;
- public analytics INSERT;
- admin authenticated SELECT;
- admin authenticated CRUD where appropriate;
- privileged archive/delete operations;
- audit log write path;
- service-role-only operations.

Do not create `USING (true)` policies for administrative tables.

## 8. Acceptance gates

Phase 2 is complete only when:

- Prisma schema validates;
- Prisma client generation succeeds;
- TypeScript passes;
- production build passes;
- live-vs-Prisma reconciliation is documented;
- one deterministic Prisma migration history is established;
- baseline is reviewed and safely recorded;
- constraints and delete actions are reconciled;
- index strategy is justified by actual access paths;
- RLS access matrix is approved by evidence;
- RLS policies are implemented and tested;
- Supabase security/performance findings are triaged;
- production smoke tests pass;
- no known accidental migration path can target production with the obsolete history.

## 9. External research used

- Prisma baselining: https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining
- Prisma migrate diff: https://docs.prisma.io/docs/cli/migrate/diff
- Prisma migration status: https://docs.prisma.io/docs/cli/migrate/status
- Prisma migration history: https://www.prisma.io/docs/orm/v6/prisma-migrate/understanding-prisma-migrate/migration-histories
- Prisma config/migration path: https://docs.prisma.io/docs/orm/v6/reference/prisma-config-reference
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase migrations: https://supabase.com/docs/guides/deployment/database-migrations

## 10. Engineering rule

No production DDL is authorized by this document. This file is the execution plan and evidence ledger for Phase 2; actual schema changes require a separate reviewed migration artifact and validation gate.
