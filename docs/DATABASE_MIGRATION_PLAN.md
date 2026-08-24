# DATABASE_MIGRATION_PLAN.md — SUPERSEDED

> **Status: SUPERSEDED.**
>
> This plan described a future SQLite → PostgreSQL migration. Production is already running on Supabase PostgreSQL, so following this document would be dangerous and would duplicate/mutate the live database incorrectly.

## Do not execute

The historical instructions in this document must not be used, including:

- creating production tables with `prisma db push`;
- importing the old SQLite dataset into production;
- using the historical row-count expectations;
- applying the old CHECK/index/enum scripts blindly;
- treating SQLite as the production source of truth.

## Current procedure

Use the verified Phase 2 control plane instead:

1. [`ENGINEERING_SOURCE_OF_TRUTH.md`](ENGINEERING_SOURCE_OF_TRUTH.md)
2. [`PHASE2_SCHEMA_CONTRACT.md`](PHASE2_SCHEMA_CONTRACT.md)
3. [`PHASE2_COLUMN_RECONCILIATION.md`](PHASE2_COLUMN_RECONCILIATION.md)
4. [`PHASE2_CONSTRAINT_RECONCILIATION.md`](PHASE2_CONSTRAINT_RECONCILIATION.md)
5. [`PHASE2_TABLE_OWNERSHIP.md`](PHASE2_TABLE_OWNERSHIP.md)
6. [`DATABASE.md`](DATABASE.md)

## Correct migration strategy

```text
Live Supabase PostgreSQL
        ↓
introspect / reconcile
        ↓
review baseline candidate
        ↓
validate in isolated database
        ↓
record baseline as already applied
        ↓
future migrations only
```

Production data must not be recreated from historical SQLite data as part of this stabilization effort.

The original document is preserved in Git history for audit purposes only.