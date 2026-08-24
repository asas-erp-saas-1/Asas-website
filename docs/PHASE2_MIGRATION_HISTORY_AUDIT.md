# Phase 2 — Migration History Audit

**Status:** IN PROGRESS — baseline candidate not applied
**Verified:** 2026-08-24

## Executive finding

ASAS currently has two separate migration histories that must not be conflated:

1. Supabase remote migration history — 14 migrations are recorded in the Supabase project from 2026-08-18 through 2026-08-22.
2. Prisma migration folders in Git — `prisma/migrations/` and `prisma/migrations/postgres/` contain historical Prisma SQL that does not represent the current production schema.

The production database does not expose a Prisma `_prisma_migrations` history table. Therefore Prisma Migrate has not been established as the authoritative production migration ledger yet.

## Historical Prisma state

`prisma/migrations/postgres/0001_init/migration.sql` is not a valid production baseline. It creates old quoted Prisma model names (`Project`, `Apartment`, etc.), uses text identifiers, globally unique apartment slugs, integer money/surface fields, and assumptions that conflict with live PostgreSQL.

The repository also contains `0002_login_rate_limit`, but the existence of these files does not prove that the live database was created from them.

**Decision:** preserve the historical migration files for audit/history, but treat them as **SUPERSEDED / NON-AUTHORITATIVE FOR PRODUCTION**. Do not execute them against production.

## Current Supabase history

Verified remote migrations include:

- create_asas_real_estate_core
- remove_erp_and_create_clean_asas_schema
- secure_asas_storage_policies
- seed_asas_inventory_from_current_site
- seed_asas_catalog_from_current_site
- align_prisma_postgres_schema_for_production_v2
- bootstrap_asas_admin_account
- normalize_catalog_media_and_buildings
- harden_public_schema_rls_and_function_search_paths
- add_catalog_and_crm_foreign_key_indexes
- optimize_admin_profile_rls_policy
- align_prisma_runtime_columns (three recorded revisions)

This is the current database migration record for Supabase. It should remain the authoritative history for Supabase-managed database changes until an explicit Prisma-vs-Supabase ownership model is approved.

## Migration ownership decision

For Phase 2, Prisma should own the application tables represented in `prisma/schema.postgres.prisma`.

The following live support tables are not to be silently absorbed into Prisma ownership:

- `media`
- `seo`
- `analytics_events`
- `admin_profiles`

They must remain explicitly classified as Supabase/application-support tables unless a later architecture decision changes ownership.

## Baseline decision

The correct Prisma baseline must be generated from the **reconciled current Prisma schema**, then manually adjusted for known live-database differences that are intentionally deferred as post-baseline hardening.

Known deliberate post-baseline hardening item:

- `projects.developer_id -> developers.id` FK is modeled by Prisma but currently absent in the live database. Existing rows were verified to have no orphan developer references. This should be introduced as a future controlled hardening migration, not silently represented as already present in the live baseline.

## Required next implementation step

Generate the baseline candidate with the official Prisma workflow:

```text
prisma migrate diff --from-empty --to-schema prisma/schema.postgres.prisma --script
```

Review the result before adding it to any live migration history. The candidate must not be executed on production. Prisma documents this as the correct pattern for baselining an existing data-bearing database. See:

- https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining
- https://docs.prisma.io/docs/cli/migrate/diff
- https://docs.prisma.io/docs/cli/migrate/resolve

## Production safety decision

`prisma migrate deploy` remains intentionally fail-closed in the application scripts until a single deterministic Prisma migration directory and baseline process are established and independently verified.

No production DDL was executed during this audit.
