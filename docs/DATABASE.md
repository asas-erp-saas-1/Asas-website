# Database Architecture — ASAS Real Estate Platform

This document supersedes `docs/DATABASE_ARCHITECTURE.md`, `docs/POSTGRESQL_ARCHITECTURE.md`,
and `docs/DATABASE_INDEX_STRATEGY.md` for the Phase 2 state.

- **Dev engine:** SQLite (single file at `db/custom.db`).
- **Prod engine:** PostgreSQL 15+ via Supabase.
- **ORM:** Prisma 6.19.
- **Schemas:**
  - `prisma/schema.prisma` — SQLite (dev).
  - `prisma/schema.postgres.prisma` — PostgreSQL (production source of truth).
  Both describe the same 15 models; the Postgres one uses native `Json` and `@db.Text`.
- **Client singleton:** `src/lib/db.ts` — exactly one `new PrismaClient()` in the entire
  `src/` tree (verified by `rg "new PrismaClient" src/`). Dev-only `globalForPrisma` cache
  is correct for Vercel serverless.

Cross-references:
- [`ENVIRONMENT.md`](ENVIRONMENT.md) — `DATABASE_URL`, `DIRECT_URL`, `SHADOW_DATABASE_URL`.
- [`SECURITY.md`](SECURITY.md) — `AdminSession`, `AuditLog`.
- [`PRODUCTION_RUNBOOK.md`](PRODUCTION_RUNBOOK.md) — migration + backup procedures.

---

## 1. Models (15)

| # | Model                    | Purpose                                                |
| - | ------------------------ | ------------------------------------------------------ |
| 1 | `Project`                | Real-estate development (top of hierarchy)             |
| 2 | `Building`               | Building within a project (Project → Building → Apartment) |
| 3 | `Apartment`              | Sellable unit (with status, price, features, SEO)      |
| 4 | `ProjectImage`           | Typed + ordered image (hero, gallery, exterior, …)    |
| 5 | `ApartmentImage`         | Typed + ordered image (hero, gallery, floor-plan, …)  |
| 6 | `Developer`              | Real-estate developer (referenced by Project)        |
| 7 | `ProjectAmenity`         | Per-project amenity (parking, pool, security, …)      |
| 8 | `Lead`                   | Inbound prospect (form submission, with UTM attribution) |
| 9 | `SiteContent`            | CMS key/value store for editable site copy             |
| 10| `NewsletterSubscription`| Email subscriber with subscribe/unsubscribe lifecycle |
| 11| `AdminUser`              | Admin CMS user (bcrypt-hashed password, role, active) |
| 12| `AdminSession`           | DB-backed auth session (multi-instance safe)           |
| 13| `Video`                  | Project or apartment video (external URL or storage path) |
| 14| `LeadNote`               | Follow-up note on a lead                               |
| 15| `AuditLog`               | 24-action mutation log with before/after diff          |

Field-level detail is in the schema files. Status enums are enforced at the app
layer (Prisma `String` columns with Zod validation server-side) — not via Postgres
enums, intentionally: the migration from SQLite (which has no enums) to Postgres
is non-destructive and the existing app code stays unchanged.

---

## 2. JSON columns

In SQLite these are stored as JSON-encoded `String`. In Postgres they are native
`Json` columns (valid JSON, queryable via Prisma's path filters):

| Model        | Column             | Shape                                                   |
| ------------ | ------------------ | ------------------------------------------------------- |
| `Project`    | `apartmentTypes`   | `["F2","F3","F4"]`                                       |
| `Apartment`  | `rooms`            | `[{name:"Salon", nameAr:"صالون", surface:25}]`           |
| `Apartment`  | `features`         | `["Climatisation","Double vitrage"]`                     |
| `Apartment`  | `featuresAr`       | `["تكييف","زجاج مزدوج"]`                                  |
| `AuditLog`   | `before` / `after` | mutated entity snapshot (capped at 8KB by `safeStringify`) |

`@db.Text` is applied to long-form copy columns (`description`, `descriptionAr`,
`seoDescription`, `paymentPlan`, `Lead.message`, `LeadNote.body`, `SiteContent.value`)
in the Postgres schema so they live in TOAST instead of the main tuple.

---

## 3. `AdminSession` table — DB-backed sessions

```prisma
model AdminSession {
  id          String   @id @default(cuid())
  token       String   @unique              // UUID v4
  userId      String
  user        AdminUser @relation(...)
  email       String                       // denormalized for fast display
  name        String
  role        String
  expiresAt   DateTime                      // pruned opportunistically
  createdAt   DateTime @default(now())
  revokedAt   DateTime?                     // null = active, set on logout

  @@index([userId])
  @@index([expiresAt])
}
```

- Selected by `ADMIN_SESSION_DRIVER` (`db` in prod, `memory` in dev).
- One row per active login. `verifyAdminAuth` queries `findUnique({ where: { token } })`,
  rejects if `revokedAt != null` or `expiresAt <= now`.
- Opportunistic prune: `deleteMany({ where: { expiresAt: { lt: now } } })` on each verify
  (best-effort, errors swallowed).
- See [`SECURITY.md`](SECURITY.md) §1.2 for the auth flow.

---

## 4. Connection pooling

Supabase's PgBouncer pooler exposes two endpoints:

| URL pattern                                        | Port | Use                                    |
| -------------------------------------------------- | ---- | -------------------------------------- |
| `postgresql://postgres.[ref]:[pw]@...pooler...:6543/postgres` | 6543 | Runtime queries (`DATABASE_URL`) — pooled, serverless-safe. |
| `postgresql://postgres.[ref]:[pw]@...supabase.com:5432/postgres` | 5432 | Migrations (`DIRECT_URL`) — direct session, no pooler. |

Prisma needs the direct connection for `migrate deploy` because PgBouncer transaction
mode breaks migration locks. Configure in `schema.postgres.prisma`:

```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")        // pooled
  directUrl         = env("DIRECT_URL")          // direct, for migrate
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // optional, for migrate dev
}
```

---

## 5. Migration strategy

### 5.1 Dev (SQLite)
- `bun run db:push` — `prisma db push` (schema sync, no migration history).
  Acceptable for dev only; never in production.
- `bun run db:seed` — idempotent (uses `upsert`, never `deleteMany`).

### 5.2 Production (PostgreSQL) — committed baselines
- Baseline migration committed under `prisma/migrations/postgres/0001_init/migration.sql`
  (470 lines, all 15 tables + 25 indexes + FKs). The lock file
  `prisma/migrations/postgres/migration_lock.toml` declares `provider = "postgresql"`.
- Apply with:
  ```bash
  DATABASE_URL=postgresql://...pooler:6543/postgres \
  DIRECT_URL=postgresql://...direct:5432/postgres \
  bunx prisma migrate deploy --schema=prisma/schema.postgres.prisma
  ```
- **`prisma migrate deploy` is the ONLY sanctioned production migration command.**
  Never run `prisma db push` against production — it bypasses the migration history
  and can silently drift the schema.
- Adding a new migration: develop it locally against the shadow DB (`prisma migrate dev
  --schema=prisma/schema.postgres.prisma`), commit the generated SQL under
  `prisma/migrations/postgres/NNNN_*/`, run `migrate deploy` against staging, then prod.

### 5.3 Data migration SQLite → PostgreSQL
- `scripts/migrate-to-postgres.ts` — reads every row from the local SQLite DB via a
  dedicated `PrismaClient` and inserts into the prod Postgres URL.
- Idempotent: per-table, if the target table is non-empty, that model is SKIPPED
  (re-running does not duplicate rows).
- Preserves IDs (cuid strings), slugs, relationships (FKs by ID), and timestamps.
- Converts SQLite string-encoded JSON columns to native Postgres `Json`.
- Per-table transactions: on any error, that table's inserts roll back and the script
  exits 1. Reports row counts per table before and after; aborts on count mismatch.
- **Safety:** never calls `deleteMany`. Only INSERTs (and the skip-if-non-empty check).

---

## 6. Prisma client singleton (`src/lib/db.ts`)

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn','error'] : ['error'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

- Exactly one `new PrismaClient()` per server bundle in production (no leak).
- Dev `globalForPrisma` cache prevents HMR from spawning new clients.
- Vercel serverless: each cold start evaluates this module once, then the singleton
  is reused across invocations on the same instance.

---

## 7. Indexes (25 across 11 tables)

Counted from `prisma/migrations/postgres/0001_init/migration.sql`:

| Table                    | Index                                          |
| ------------------------ | ---------------------------------------------- |
| `Project`                | `published`, `archived`, `developerId`         |
| `Building`               | `projectId`                                    |
| `Apartment`              | `projectId`, `buildingId`, `status`, `published` |
| `ProjectImage`           | `projectId`, `type`                            |
| `ApartmentImage`         | `apartmentId`, `type`                          |
| `ProjectAmenity`         | `projectId`                                    |
| `Lead`                   | `status`, `createdAt`                          |
| `NewsletterSubscription` | `status`, `createdAt`                          |
| `AdminSession`           | `userId`, `expiresAt`                          |
| `Video`                  | `projectId`, `apartmentId`                     |
| `LeadNote`               | `leadId`, `createdAt`                          |
| `AuditLog`               | `actorEmail`, `action`, `(entityType, entityId)` **composite**, `createdAt` |

Unique constraints (separate from indexes): `Project.slug`, `Building.slug`,
`Apartment.slug`, `Developer.slug`, `AdminUser.email`, `SiteContent.key`,
`NewsletterSubscription.email`, `AdminSession.token`.

The composite index on `AuditLog(entityType, entityId)` is the workhorse for
"who touched entity X" queries. The `createdAt` indexes on `Lead`, `AuditLog`,
`NewsletterSubscription`, and `LeadNote` support time-bounded list queries
(recent leads, recent audit entries).

---

## 8. Cascade rules

| Relation                          | Rule            | Rationale                                  |
| --------------------------------- | --------------- | ------------------------------------------ |
| `Project → Building`               | `Cascade`       | Delete a project → delete its buildings     |
| `Project → Apartment`              | `Cascade`       | Delete a project → delete its apartments    |
| `Building → Apartment`             | `SetNull`       | Delete a building → apartments keep existing with `buildingId=null` |
| `Project → ProjectImage`           | `Cascade`       |                                            |
| `Project → ProjectAmenity`         | `Cascade`       |                                            |
| `Apartment → ApartmentImage`       | `Cascade`       |                                            |
| `Project → Video`                  | `Cascade`       |                                            |
| `Apartment → Video`                | `Cascade`       |                                            |
| `Lead → LeadNote`                  | `Cascade`       |                                            |
| `AdminUser → AdminSession`         | `Cascade`       | Delete a user → revoke all their sessions  |

`Apartment.building → Building` is `SetNull` (not Cascade) so a building can be deleted
without orphaning its apartments — they remain on the project, just unassigned to a
building.

---

## 9. Seed

`prisma/seed.ts` — idempotent. Creates 1 developer, 4 projects, 6 buildings, 28 apartments,
19 amenities, plus 1 admin user. Uses `upsert` everywhere; never `deleteMany`.

- Reads `ADMIN_BOOTSTRAP_PASSWORD` once. If unset → generates a 24-char random password,
  prints it once to stdout, never persists plaintext.
- Respects `SEED_REFUSE_NON_EMPTY=true`: aborts if `project.count() > 0`.
- See [`ENVIRONMENT.md`](ENVIRONMENT.md) §AUTH + §DEPLOYMENT.

---

## 10. Operational queries

```ts
// Recent leads
db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

// All apartments in project X by status
db.apartment.findMany({
  where: { projectId: '...', status: 'AVAILABLE' },
  orderBy: { order: 'asc' },
});

// Audit history for an apartment
db.auditLog.findMany({
  where: { entityType: 'Apartment', entityId: '<cuid>' },
  orderBy: { createdAt: 'desc' },
});

// Active sessions for a user (for force-logout)
db.adminSession.findMany({
  where: { userId: '...', revokedAt: null, expiresAt: { gt: new Date() } },
});
```
