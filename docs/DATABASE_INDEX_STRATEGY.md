# DATABASE_INDEX_STRATEGY.md — PostgreSQL Index Contract

> Phase 2 — live Supabase reconciliation. This document supersedes the old SQLite-oriented index notes.

## 1. Live production baseline

The production database is PostgreSQL on Supabase. Indexes were inspected directly from `pg_indexes`.

The current live inventory includes primary/unique indexes and supporting foreign-key/query indexes on projects, buildings, apartments, media, images, leads, audit logs, sessions, newsletter subscriptions, videos, amenities, and rate limits.

### Important identity rule

`apartments.slug` is **not globally unique**. Production enforces:

```sql
UNIQUE (project_id, slug)
UNIQUE (project_id, apartment_number)
```

Therefore public apartment identity is project-scoped. Application code must not use `findUnique({ slug })` as if `slug` were globally unique.

## 2. Current live indexes that are authoritative

### Projects
- primary key on `id`
- unique index on `slug`

### Buildings
- primary key on `id`
- unique index on `slug`
- index on `project_id`

### Apartments
- primary key on `id`
- unique `(project_id, apartment_number)`
- unique `(project_id, slug)`
- index on `project_id`
- index on `building_id`
- index on `status`

### Project / apartment media
- image primary keys
- image foreign-key indexes on `project_id` / `apartment_id`
- image `type` indexes

### Leads
- index on `status`
- index on `created_at DESC`
- index on `project_id`
- index on `apartment_id`

### Audit logs
- index on `actor_email`
- index on `action`
- index on `(entity_type, entity_id)`
- index on `created_at`

Other live supporting indexes cover sessions, login rate limits, newsletter subscriptions, videos, project amenities and analytics/media support tables.

## 3. Indexes deliberately NOT part of the production baseline

The Prisma contract previously declared indexes such as:

- `projects(published)`
- `projects(archived)`
- `projects(developer_id)`
- `apartments(published)`

Those indexes were not observed in the live database and therefore must **not** be falsely represented as already applied by the production baseline.

They belong in a future performance migration only if query evidence demonstrates that they are useful.

## 4. Query-driven candidates for the next performance migration

### Public project catalogue

Current query pattern:

```text
WHERE published = true
  AND archived = false
ORDER BY featured DESC, display_order ASC, name ASC
```

Candidate: a partial/composite index designed around the actual cardinality and sort pattern. Do not add it blindly; verify with `EXPLAIN (ANALYZE, BUFFERS)` after the catalogue grows.

### Public apartment catalogue

Current pattern:

```text
WHERE project_id = ?
  AND published = true
  AND archived = false
ORDER BY display_order
```

Candidate: partial `(project_id, display_order)` index for published, non-archived units.

### Admin inventory

Current filters include project, building, status and ordering. Existing single-column indexes are acceptable at the present data volume. A composite `(project_id, status, display_order)` index should be introduced only after query-plan evidence or meaningful inventory growth.

### Lead pipeline

Current indexes already cover the principal status/date/project/apartment access paths. A `(status, created_at DESC)` composite index is a future candidate if the lead table becomes large enough to justify it.

## 5. JSON/JSONB indexing policy

Do not add GIN indexes to `features`, `rooms`, or audit JSON merely because PostgreSQL supports them. Add only after an actual containment/search predicate and query-plan evidence exist.

## 6. Foreign-key indexing policy

Every high-volume FK used in joins/filtering should have an index. The current live schema already indexes the main catalog, lead, media and session foreign keys.

## 7. Baseline rule

The Prisma baseline must describe the **observed production state**, not the desired future state. Future indexes belong in explicit forward migrations.

This distinction is critical because `prisma migrate resolve` records a baseline as already applied; including indexes that do not actually exist would create false migration history and schema drift.

## 8. Verification gate

Before adding a performance index:

1. identify the exact query;
2. measure the current plan;
3. estimate write/storage cost;
4. add the index in a forward migration;
5. re-run the query plan;
6. verify application behavior;
7. monitor before adding another index.
