# Phase 2 — Database Engineering & Schema Contract

**Status:** ACTIVE — forensic contract audit started 2026-08-23

## 1. Phase 1 exit verification

The latest production deployment is `READY` on Vercel for commit `8a728a17db2e4624123d87eac5806ef7e17fb0fe`.
The deployment fixes the public catalog DTO boundary (`PublicApartmentCard`) and is the first current deployment after the final TypeScript blocker. No runtime error/warning logs were observed for that deployment during the verification window.

Phase 1 is therefore closed for the deployment/type-contract layer.

## 2. Non-negotiable Phase 2 rule

Supabase production is the live database. No destructive `db push`, reset, or blind Prisma migration is permitted.
Before any DDL change, the current PostgreSQL schema must be reconciled against `prisma/schema.postgres.prisma` table-by-table and column-by-column.

## 3. Critical discovery: existing migration history is not the production schema

The repository contains `prisma/migrations/postgres/0001_init/migration.sql`, but production does not contain `_prisma_migrations` and its live tables are snake_case (`projects`, `apartments`, etc.) while the committed migration creates quoted Prisma-style names (`Project`, `Apartment`, etc.).

**Conclusion:** the committed `0001_init` migration must NOT be applied to the existing production database. It is not a valid baseline for the live database.

A new production baseline/reconciliation strategy is required before normal `migrate deploy` can be treated as authoritative.

## 4. Live production inventory

Current public tables observed in Supabase:

- admin_profiles
- admin_sessions
- admin_users
- analytics_events
- apartment_images
- apartments
- audit_logs
- buildings
- developers
- lead_notes
- leads
- login_rate_limits
- media
- newsletter_subscriptions
- project_amenities
- project_images
- projects
- seo
- site_content
- videos

The repository's current Prisma schema models 15 of these as Prisma-managed application models. The additional tables (`admin_profiles`, `analytics_events`, `media`, `seo`, and `login_rate_limits` depending on application ownership) must be explicitly classified as Prisma-managed, Supabase-managed, or external/application-support tables before the contract is finalized.

## 5. Confirmed contract mismatches

### `apartments`

Live database:

- `apartment_number` is `NOT NULL`; Prisma currently declares it optional.
- `surface` is PostgreSQL `numeric`; Prisma declares `Int`.
- `price` is PostgreSQL `numeric`; Prisma declares `Int`.
- legacy/support columns exist that are not represented by the Prisma model: `parking`, `balcony`, `images`.
- live data currently has 8 apartments, no null apartment numbers, no fractional surfaces/prices, and no null bedrooms.

Prisma:

- `apartmentNumber String? @map("apartment_number")`
- `surface Int`
- `price Int?`

**Decision pending:** normalize the database to the intended Prisma contract rather than weakening the application model. The existing integer-valued data makes numeric→integer conversion technically safe, but the migration must still be staged and verified before production DDL.

### `projects`

The live table contains the expanded public catalog fields expected by the current Prisma model, including `published`, `archived`, SEO fields, localized fields, delivery metadata, and `display_order`.

Live values currently include 5 projects and no null `city`/`district` values.

The live schema also contains compatibility columns such as `images` that are not part of the current Prisma model.

### `leads`

The live table contains `assigned_to` and the attribution fields expected by the current Prisma model. A previous deployment reported `leads.assigned_to` missing; current live introspection confirms the column now exists. That previous error is therefore treated as historical drift, not as a current blocker.

### `project_amenities`

Current live introspection confirms both `description` and `description_ar` exist. A previous deployment reported `project_amenities.description` missing; that error is treated as historical drift and must not trigger an unnecessary production migration.

### `videos`

The live database uses `display_order`; Prisma maps its `order` field to `display_order`, which is the correct contract mapping.

## 6. Constraints currently present

The live database has primary keys and foreign keys for the main project/apartment graph, including:

- projects → buildings: CASCADE
- projects → apartments: CASCADE
- buildings → apartments: SET NULL
- projects → project_images: CASCADE
- projects → project_amenities: CASCADE
- apartments → apartment_images: CASCADE
- projects/apartments → videos: CASCADE
- leads → lead_notes: CASCADE
- admin_users → admin_sessions: CASCADE

The live database also has uniqueness constraints including project slug, building slug, developer slug, admin email, site-content key, newsletter email, session token, and apartment `(project_id, apartment_number)` / `(project_id, slug)` constraints.

These must be reconciled against Prisma before indexes or constraints are changed.

## 7. RLS state

RLS is enabled on all inspected public tables.

Current explicit policies include:

- public project read
- public apartment read
- public media read
- public analytics insert
- public lead insert
- public newsletter insert/update
- admin profile self-read

Several RLS-enabled tables have no policies. This is intentional only if those tables are inaccessible through the relevant client role; otherwise it is a security/availability defect.

**RLS is therefore not to be modified piecemeal.** The policy matrix must be designed from the application's public/admin access model and then applied as a controlled migration.

## 8. Runtime connection contract

The production Prisma runtime now defensively appends:

- `pgbouncer=true`
- `connection_limit=1`

when missing from `DATABASE_URL`, because Supabase transaction pooling does not support prepared statements and Vercel serverless workloads should use a small connection limit.

This matches current Supabase guidance and prevents the historical `42P05 prepared statement already exists` failure.

## 9. Phase 2 execution order

1. Freeze the live schema as an observed baseline.
2. Classify every live table as Prisma-managed, Supabase-managed, or application-support/external.
3. Reconcile every Prisma model against its live table.
4. Reconcile every column: name, type, nullability, default, and mapping.
5. Reconcile PK/FK/UNIQUE/CASCADE semantics.
6. Reconcile indexes against real query paths.
7. Establish a truthful Prisma migration baseline for the existing database.
8. Create only additive/controlled reconciliation migrations.
9. Verify on a non-production database before production deployment.
10. Apply RLS policy matrix after schema contract is stable.
11. Re-run Prisma generation, build, smoke tests, and production runtime verification.

## 10. Current blockers before schema DDL

- The repository's `0001_init` migration is not a valid representation of the current production schema.
- `_prisma_migrations` is absent from the production database.
- The exact ownership of the five extra live tables must be recorded.
- Apartment numeric types and nullability require an explicit contract decision before DDL.
- RLS policies require a complete access matrix before changing any policy.

**No destructive database change has been made during this audit.**
