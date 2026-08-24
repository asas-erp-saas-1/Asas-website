# Phase 2 — Column Reconciliation Register

**Status:** ACTIVE — no production DDL performed.

This register records differences found by comparing the live Supabase PostgreSQL catalog with `prisma/schema.postgres.prisma`.

## Confirmed corrections already applied

| Area | Live PostgreSQL | Previous Prisma contract | Current decision |
|---|---|---|---|
| Apartment `surface` | `numeric`, nullable | `Int` | `Decimal?` |
| Apartment `price` | `numeric`, nullable | `Int?` | `Decimal?` |
| Apartment `apartment_number` | `text NOT NULL` | optional | required |
| Apartment `slug` | `text NOT NULL` + composite uniqueness | global `@unique` assumption in application code | project-scoped `@@unique([projectId, slug])` |
| Apartment `type_name` | nullable | required | `String?` |
| Apartment `apartment_type` | nullable, DB default null | Prisma default `F3` | no Prisma default; application creation explicitly chooses a type |
| UUID primary keys | DB default `gen_random_uuid()` | Prisma-level `uuid()` | `dbgenerated("gen_random_uuid()")` |
| Project/Apartment display order | nullable integer / default 0 | mapped Prisma order field | retained as mapped `order` |

## Status normalization finding

Production currently contains apartment status values using uppercase canonical values. The PostgreSQL default is historically lowercase `available`.

This is a **contract smell**, not a reason to change production DDL during stabilization.

Current application behavior therefore:

- creates new apartments with canonical uppercase `AVAILABLE` unless an explicit status is supplied;
- normalizes status values to uppercase for admin state-machine transitions;
- accepts both uppercase and legacy lowercase `AVAILABLE/RESERVED` values in public AI search;
- retains the live database default in Prisma until a controlled migration is designed.

A later migration may standardize the database default to `AVAILABLE`, but that is intentionally deferred until the baseline is established and the business status state machine is formally approved.

## Database-generated UUID decision

The live database already owns UUID generation with `gen_random_uuid()` on application tables. Representing this as `dbgenerated("gen_random_uuid()")` makes the Prisma contract truthful to PostgreSQL and allows database-side inserts to remain valid.

Prisma's documentation notes that `dbgenerated()` is the correct representation for database defaults that Prisma itself does not own. This is important for migration diff accuracy.

## Remaining verification before baseline

- Verify every Prisma-managed column against the live catalog.
- Verify every default expression, not only its resulting type.
- Verify foreign keys and `ON DELETE` actions.
- Verify unique constraints and indexes independently.
- Verify RLS is preserved; Prisma introspection does not model all PostgreSQL security features.
- Verify external/support tables are not accidentally included in the Prisma baseline.
- Generate the baseline candidate only after these checks.

**Production migration history remains untouched.**