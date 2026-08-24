# Database Architecture — ASAS Real Estate Platform

> **Current verified state — 2026-08-24**
>
> This document is now aligned with the live Supabase PostgreSQL database and the current Prisma contract. Historical SQLite/production-migration instructions have been removed from the active procedure.

## 1. Production database

- Engine: PostgreSQL on Supabase.
- ORM: Prisma 6.19.2.
- Runtime connection: pooled `DATABASE_URL` with the production connection safeguards implemented in `src/lib/db.ts`.
- Migration connection: `DIRECT_URL` is reserved for migration operations.
- The live database is the source of truth until the Prisma migration baseline is safely established.

### Important migration state

Production currently does **not** have a `_prisma_migrations` history table.

The historical `prisma/migrations/postgres/0001_init` migration represents an older schema and must **not** be applied blindly to production.

The correct sequence is:

```text
Live PostgreSQL
  ↓
full schema reconciliation
  ↓
reviewed baseline candidate
  ↓
isolated validation
  ↓
mark baseline as applied
  ↓
future migrations only
```

No `prisma db push` or reset is permitted against production.

## 2. Live table ownership

The current production database contains 20 observed public tables.

### Prisma-managed

- `projects`
- `buildings`
- `apartments`
- `project_images`
- `apartment_images`
- `developers`
- `project_amenities`
- `leads`
- `lead_notes`
- `site_content`
- `newsletter_subscriptions`
- `admin_users`
- `admin_sessions`
- `videos`
- `audit_logs`
- `login_rate_limits`

### External/support — not automatically owned by Prisma

- `admin_profiles`
- `analytics_events`
- `media`
- `seo`

See [`PHASE2_TABLE_OWNERSHIP.md`](PHASE2_TABLE_OWNERSHIP.md) for the ownership rules.

## 3. Current application contract

The principal real-estate graph is:

```text
Developer
   ↓
Project
   ├── Building
   │     └── Apartment
   ├── ProjectImage
   ├── ProjectAmenity
   └── Video

Apartment
   ├── ApartmentImage
   └── Video

Lead
   └── LeadNote
```

The current Prisma contract also contains site content, newsletter, admin users/sessions, audit logs and login rate limits.

## 4. Critical identity rules

### Project

`Project.slug` is globally unique.

### Apartment

An apartment is identified by its stable UUID `id`.

Public routing uses a **project-scoped slug**:

```text
UNIQUE(project_id, slug)
```

Inventory numbering is also project-scoped:

```text
UNIQUE(project_id, apartment_number)
```

Application code must not use `findUnique({ slug })` when the database contract is project-scoped.

### Commercial values

The live PostgreSQL database uses `numeric` for apartment/project commercial values that require decimal-safe storage. Prisma represents these as `Decimal` where appropriate.

Public API DTOs must convert Decimal values to the public numeric representation at the application boundary.

## 5. Publishing boundary

Public catalog queries must respect:

```text
published = true
archived = false
```

for both the apartment and its parent project where applicable.

Inventory availability/status is a separate business dimension from publication. Do not use `status` as a substitute for publication state.

## 6. Current live inventory facts

Verified directly against Supabase during the Phase 2 audit:

- 5 projects.
- 5 projects published and not archived.
- 8 apartments.
- 8 apartments published and not archived.
- All 8 current apartments have status `AVAILABLE`.
- Project districts are currently non-null and non-empty.
- Apartment numbers are currently non-null.

These are audit-time observations, not hardcoded application assumptions.

## 7. Constraints and indexes

The current live database includes primary keys, foreign keys and project-scoped apartment uniqueness constraints. Indexes have been reconciled in [`DATABASE_INDEX_STRATEGY.md`](DATABASE_INDEX_STRATEGY.md).

Do not add indexes merely because they appear in an old migration. New indexes must be justified by real query paths, ordering/filtering requirements, or RLS predicates.

Supabase's current RLS guidance specifically recommends indexing columns used by policies where appropriate because PostgreSQL evaluates policy expressions against candidate rows.

## 8. RLS

RLS is enabled on the inspected public tables.

Existing policies are part of the live security baseline. Phase 2 will produce a complete policy matrix before changing them.

Do not add a blanket `USING (true)` policy to make an application query work. Public, authenticated, editor and admin access must be intentional.

## 9. Prisma migration policy

### Development

Use a disposable development/staging database for migration generation and validation.

### Production

Use committed migration files and a controlled deployment pipeline.

Prisma's official guidance for an existing production database is to baseline the existing state and then apply only migrations created after that baseline.

Recommended lifecycle:

```text
schema change
  ↓
local/isolated DB
  ↓
prisma migrate diff / reviewed migration
  ↓
CI validation
  ↓
staging / isolated verification
  ↓
production migrate deploy
```

`prisma migrate reset` is development-only. `prisma migrate deploy` is the production application mechanism after a truthful baseline exists.

## 10. Operational rules

- Never reset production.
- Never use `db push` as production schema management.
- Never edit production DDL without recording the change in version-controlled migration history.
- Never make a Prisma field optional/weak merely to silence TypeScript if production data says otherwise.
- Never use a public slug as the sole identity when the database defines composite uniqueness.
- Never assume a passing Prisma generation means the live database is safe.
- Never mark a migration baseline applied until its SQL has been reviewed and tested against an isolated database.

## 11. Authoritative references

- [`ENGINEERING_SOURCE_OF_TRUTH.md`](ENGINEERING_SOURCE_OF_TRUTH.md)
- [`PHASE2_SCHEMA_CONTRACT.md`](PHASE2_SCHEMA_CONTRACT.md)
- [`PHASE2_TABLE_OWNERSHIP.md`](PHASE2_TABLE_OWNERSHIP.md)
- [`DATABASE_INDEX_STRATEGY.md`](DATABASE_INDEX_STRATEGY.md)

Historical database documents remain available in Git history for audit purposes but are not active operating instructions.