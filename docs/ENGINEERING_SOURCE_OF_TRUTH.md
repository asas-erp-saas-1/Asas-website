# ASAS Engineering Source of Truth

**Last verified:** 2026-08-24 02:xx UTC
**Repository:** `asas-erp-saas-1/Asas-website`
**Production DB:** Supabase PostgreSQL
**Deployment:** Vercel

> This document is the current engineering control plane. Historical audits, phase reports and migration plans are evidence, not instructions, when they conflict with this document or the live systems.

## 1. Product scope

The verified current product is a premium real-estate public website plus Admin CMS for managing:

- projects
- buildings
- apartments/inventory
- media and videos
- leads and lead notes
- SEO/content
- admin users and audit logs

The codebase is being engineered to **ERP-grade standards** for integrity, security, traceability and extensibility. It is not yet a full ERP/accounting/construction platform. Future ERP modules must not be described as implemented until they exist in code, database schema and verified runtime behavior.

## 2. Source-of-truth hierarchy

1. Live Supabase PostgreSQL schema and production data.
2. Current `main` source code.
3. `prisma/schema.postgres.prisma` as the ORM contract under reconciliation.
4. This document and the current Phase 2 engineering documents.
5. Historical documents and old phase reports.

If two sources disagree, stop and reconcile. Do not silently choose the more convenient source.

## 3. Current production facts

The live public schema currently contains 20 observed tables. The current application-managed graph includes projects, buildings, apartments, project/apartment images, developers, amenities, leads, lead notes, admin users/sessions, audit logs, site content, newsletter subscriptions and videos. Additional support tables such as analytics/media/SEO/rate-limit structures require explicit ownership classification before becoming part of the Prisma migration contract.

Current live inventory checks:

- Projects: 5
- Projects published and not archived: 5
- Apartments: 8
- Apartments published and not archived: 8
- Apartment status currently observed: `AVAILABLE` for all 8 rows
- Project districts currently have no null or empty values
- Apartment numbers are non-null in production

RLS is enabled on the inspected public tables. Existing policies must be treated as the current security baseline until the policy matrix is fully reconciled.

## 4. Current Prisma contract decisions

- PostgreSQL is the production provider.
- UUID database IDs are the stable identity boundary.
- `Apartment.slug` is project-scoped, not globally unique.
- `@@unique([projectId, apartmentNumber])` is part of the apartment inventory identity contract.
- `@@unique([projectId, slug])` is the public routing uniqueness contract.
- PostgreSQL `numeric` values used for apartment/project commercial measurements are represented as Prisma `Decimal` where the live database requires it.
- Public DTOs must normalize Decimal values at the API boundary; UI components should not receive Prisma Decimal objects.
- Relation names in application code must match the current Prisma relation graph; legacy relation names are not compatibility requirements.

## 5. Migration state

**Critical:** production currently has no `_prisma_migrations` table.

The historical `prisma/migrations/postgres/0001_init` migration does not represent the current live database and must not be applied blindly. It was created against an older schema shape.

The correct target is:

```text
Live PostgreSQL
   ↓
full schema reconciliation
   ↓
truthful baseline migration
   ↓
mark baseline as already applied
   ↓
future migrations only
```

No destructive migration or `db push` is permitted as part of this work.

Prisma's official baselining workflow supports exactly this pattern for an existing production database that cannot be reset.

## 6. Phase 2 gates

### Gate A — build/type contract

- Prisma generation passes.
- TypeScript passes.
- Next.js production build passes.
- Vercel deployment is READY.

### Gate B — schema contract

- Every live table classified.
- Every Prisma-managed table reconciled.
- Every column reconciled by name/type/nullability/default.
- PK/FK/UNIQUE/CHECK/CASCADE semantics reconciled.
- Current indexes captured.
- Future indexes justified by real query/RLS patterns.

### Gate C — migration baseline

- Baseline generated from the verified contract.
- Baseline reviewed manually.
- Baseline tested on an isolated non-production database.
- Production baseline recorded as applied without re-running creation SQL.

### Gate D — RLS/security

- Public/admin role matrix documented.
- Every RLS-enabled table classified as intentionally public, admin-only, or support-only.
- Policies are tested for both authorization correctness and query performance.
- Policy columns are indexed where appropriate.

### Gate E — runtime

- Public project list/detail works.
- Public apartment detail works with project-scoped slug.
- AI search returns only published, non-archived inventory.
- Admin CRUD works with stable IDs.
- Admin RBAC works.
- No production runtime errors.

## 7. Known historical drift that must not return

The following patterns are considered obsolete:

- treating the production DB as SQLite
- globally unique apartment slugs
- using `findUnique({ slug })` when the live uniqueness is project-scoped
- applying the old `0001_init` migration to production
- using `db push` as a production migration mechanism
- assuming a successful TypeScript build proves database readiness
- claiming a phase is complete based only on documentation
- using old audit scores as current production-readiness scores

## 8. Current deployment hygiene

Vercel has recently exposed a sequence of failed deployments caused by application/schema contract drift. Each failure is being fixed at the correct layer rather than weakening the database contract.

The current build pipeline generates Prisma Client 6.19.2 successfully. The Prisma 7 upgrade notice is informational and is deliberately out of scope until the current production contract is stable.

## 9. Engineering principles

- Production data is valuable and must be preserved.
- The database contract is stronger than convenience code.
- A URL slug is not a database identity.
- Security policy is part of the schema contract.
- Migration history must be reproducible.
- Every claim of completion must be backed by a build, database inspection or runtime verification.
- Historical documentation is never allowed to silently override live evidence.
- Optimize only after correctness and observability are established.

## 10. Immediate next sequence

1. Finish current Vercel build verification.
2. Re-run repository-wide searches for obsolete Prisma/SQLite/migration assumptions.
3. Reconcile remaining Prisma models against live PostgreSQL columns.
4. Generate a reviewed baseline candidate without applying it.
5. Validate baseline against an isolated database before any production migration-history operation.
6. Establish controlled migration deployment in CI/CD.
7. Reconcile and implement the RLS matrix.
8. Run end-to-end production smoke tests.
9. Only then close Phase 2.

**Do not mark Phase 2 complete until all gates above are green.**