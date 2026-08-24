# POSTGRESQL_ARCHITECTURE.md — Current Production Contract

> **Status: CURRENT — verified against live Supabase PostgreSQL on 2026-08-24.**
>
> This document no longer describes a future SQLite → PostgreSQL migration. Production is already PostgreSQL. Future hardening changes must be introduced through reviewed migrations after the Phase 2 baseline.

## 1. Production database

- PostgreSQL on Supabase.
- Prisma 6.19.2.
- Production UUID primary keys use PostgreSQL `gen_random_uuid()` defaults.
- Commercial numeric values such as apartment/project prices and surfaces use PostgreSQL `numeric` and Prisma `Decimal` where applicable.
- Long text uses PostgreSQL `text`.
- JSON application structures use PostgreSQL `jsonb` and Prisma `Json`.
- Timestamps are `timestamptz`.

## 2. Identity

Stable identity is the UUID primary key.

Public slugs are routing identifiers.

- Project slug: globally unique.
- Building slug: globally unique in the current database.
- Apartment slug: unique within its project.
- Apartment number: unique within its project.

The apartment uniqueness contract is:

```text
UNIQUE(project_id, slug)
UNIQUE(project_id, apartment_number)
```

## 3. Core catalog graph

```text
Developer → Project → Building → Apartment
                    ├→ ProjectImage
                    ├→ ProjectAmenity
                    └→ Video
Apartment → ApartmentImage
Apartment → Video
Lead → LeadNote
```

## 4. Publication vs inventory status

Publication is represented by:

```text
published
archived
```

Inventory availability is represented separately by `Apartment.status`.

The application currently uses uppercase canonical status values for new writes and state transitions, while the live database has a historical lowercase default (`available`). The application therefore normalizes legacy lowercase values rather than changing production DDL during stabilization.

A future migration may standardize the database default after the baseline and state-machine policy are formally approved.

## 5. RLS

RLS is enabled on the inspected public tables.

RLS policies are a PostgreSQL security feature and are not represented as normal Prisma model fields. They must be preserved and reviewed separately from the Prisma model contract.

No broad public policy should be added merely to resolve an application error.

## 6. Constraints

Verified core constraints include:

- primary keys on all application tables;
- unique project/building/developer slugs;
- unique admin email/session token/site-content key/newsletter email/rate-limit key;
- project-scoped apartment number and slug uniqueness;
- foreign keys with explicit delete actions for catalog and CRM relationships.

`projects.developer_id` currently has valid data but no database FK. The application models the intended relationship; adding the FK is a future hardening migration, not part of the baseline.

## 7. Future database hardening

The following are **future migrations**, not current production facts:

- price/surface CHECK constraints;
- standardized status representation/default;
- `projects.developer_id` foreign key;
- additional indexes justified by measured query/RLS workloads;
- historical price/version tables;
- reservation/contract/commission/financial ledgers when those ERP domains become implemented.

Each future change must be validated against real production data before deployment.

## 8. Migration policy

The production database is already populated and currently has no Prisma migration history table.

Therefore:

```text
live schema
  ↓
reconcile
  ↓
baseline candidate
  ↓
isolated validation
  ↓
record baseline applied
  ↓
future migrations
```

Never reset production and never use `prisma db push` as production migration management.

## 9. Authoritative documents

For current decisions use:

- `ENGINEERING_SOURCE_OF_TRUTH.md`
- `PHASE2_SCHEMA_CONTRACT.md`
- `PHASE2_COLUMN_RECONCILIATION.md`
- `PHASE2_CONSTRAINT_RECONCILIATION.md`
- `PHASE2_TABLE_OWNERSHIP.md`
- `DATABASE.md`

Historical PostgreSQL design material remains in Git history but is not an active implementation instruction.