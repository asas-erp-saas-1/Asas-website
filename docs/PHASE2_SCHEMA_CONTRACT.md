# Phase 2 — Database Engineering & Schema Contract

## Status

**ACTIVE — schema reconciliation and migration-baseline preparation**

## Scope

This phase establishes a truthful, version-controlled contract between the live Supabase PostgreSQL database and Prisma. It deliberately separates live production state, Prisma application model, migration history, RLS/security policy state, and performance/index strategy.

No destructive production operation is part of this phase unless separately reviewed and explicitly approved.

## Evidence-based rules

- Supabase production is currently the live source of truth.
- The existing legacy Prisma migration history must not be treated as a representation of the live database until reconciled.
- Prisma Migrate supports baselining an existing production database; the baseline is marked applied rather than executed against existing tables.
- Supabase recommends version-controlled migrations for remote schema changes and warns that direct remote schema changes bypass migration history.
- RLS policies must be designed from the application's access model and indexed according to policy predicates.

## Current production inventory

Observed public tables include:

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

The repository's Prisma schema does not currently own every one of these tables. Ownership must be explicitly classified before migration automation is enabled.

## Contract decisions already made

### Apartments

The live apartment identity is project-scoped:

- `(project_id, apartment_number)` is unique.
- `(project_id, slug)` is unique.

Therefore `slug` must not be globally unique in Prisma. Application routes that receive only a slug must resolve the record with `findFirst` and then perform mutations by stable `id`, unless the route also receives project identity.

`surface` and `price` are PostgreSQL numeric values and Prisma represents them as `Decimal`.

`apartment_number` is non-null in production and is required in Prisma.

### Projects

`slug` is globally unique and remains a Prisma `@unique` field.

### Relations

Project-scoped relations are modeled explicitly. Lead relations are represented on both sides so Prisma Client can validate the relation graph.

### Public DTO boundary

The public website uses `PublicApartmentCard` rather than exposing the full Prisma/domain `Apartment` model. UI code must not widen the public DTO merely to satisfy a domain type.

## Migration-baseline strategy

Before introducing normal production `prisma migrate deploy` behavior:

1. Verify the Prisma schema against the live database.
2. Archive or replace the obsolete migration history that does not represent production.
3. Generate a baseline migration from the reconciled schema.
4. Review the generated SQL manually.
5. Verify unsupported database features and any intentionally external tables.
6. Apply/resolve the baseline as already applied; do not execute the baseline against the populated production database.
7. Create subsequent migrations only for intentional schema changes.

The baseline is a history marker, not a production data migration.

## RLS strategy

RLS is enabled on the production public tables inspected so far. Policies are not uniform across all tables.

Before adding or changing policies, create an access matrix covering:

- anonymous/public website reads,
- lead creation,
- newsletter subscription,
- analytics event insertion,
- authenticated admin reads,
- authenticated admin writes,
- privileged destructive/archive operations,
- audit-log writes,
- service-role-only operations.

Every policy predicate must be checked for an appropriate index. Do not add a broad `USING (true)` policy to administrative tables.

## Index strategy

Indexes will be evaluated from real query paths rather than from generic recommendations. Priority candidates include:

- apartments `(project_id, slug)` — uniqueness already provides an index
- apartments `(project_id, apartment_number)` — uniqueness already provides an index
- apartments `status`
- apartments `published`
- apartments `project_id`
- buildings `project_id`
- project_images `project_id, sort_order`
- apartment_images `apartment_id, sort_order`
- leads `status`
- leads `created_at`
- leads `project_id`
- leads `apartment_id`
- lead_notes `lead_id, created_at`
- admin_sessions `user_id`
- admin_sessions `expires_at`

Composite indexes will be added only when query plans or known access paths justify them.

## Production safety

Never use the following as a shortcut against production:

- `prisma migrate reset`
- blind `prisma db push`
- dropping/recreating production tables
- applying the obsolete legacy initial migration
- adding RLS policies without an access matrix
- changing column types without a data compatibility check

## Verification gates

Phase 2 cannot be declared complete until all gates pass:

1. Prisma schema validates.
2. Prisma Client generates successfully.
3. TypeScript passes.
4. Production Next.js build passes.
5. Live schema and Prisma schema have a documented reconciliation result.
6. Migration baseline is reviewed and safely recorded.
7. PK/FK/UNIQUE semantics are reconciled.
8. Index strategy is reviewed against query paths.
9. RLS access matrix is complete.
10. RLS policies are validated without exposing admin data.
11. Production smoke tests pass.
12. No unresolved schema drift remains.

## Research references

- Prisma Migrate: https://docs.prisma.io/docs/orm/prisma-migrate
- Prisma baselining: https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining
- Prisma migrate resolve: https://www.prisma.io/docs/cli/migrate/resolve
- Prisma migrate diff: https://docs.prisma.io/docs/cli/migrate/diff
- Supabase database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase RLS performance: https://supabase.com/docs/guides/database/postgres/row-level-security

## Change-control principle

The schema contract is infrastructure. Treat it with the same discipline as a financial ledger: every structural change must be explainable, reversible where possible, tested against representative data, and traceable to a version-controlled migration.
