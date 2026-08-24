# Phase 2 — Prisma Baseline Candidate

**Status:** CANDIDATE ONLY — NOT APPLIED
**Verified:** 2026-08-24

## Purpose

This document is the controlled baseline artifact definition for the first truthful Prisma Migrate history over the already-populated production database.

Prisma's official baseline workflow is:

```text
prisma migrate diff --from-empty --to-schema prisma/schema.postgres.prisma --script
```

followed by manual review, then `prisma migrate resolve --applied <baseline>` only after the migration is proven to represent the existing database state. Prisma explicitly describes baselining as the method for existing production databases that cannot be reset.

## Why the candidate is not being placed under the active migration directory yet

The repository still contains historical PostgreSQL migration SQL that does not represent the current production database. Placing an unverified baseline under `prisma/migrations` could cause a future `migrate deploy` to act on it unexpectedly.

Therefore this phase keeps the candidate as a reviewed artifact outside the active migration path until the migration-directory ownership is normalized.

## Baseline scope

The Prisma baseline is intended to represent the current Prisma-owned application tables:

- projects
- buildings
- apartments
- project_images
- apartment_images
- developers
- project_amenities
- leads
- site_content
- newsletter_subscriptions
- admin_users
- admin_sessions
- videos
- lead_notes
- audit_logs
- login_rate_limits

The following live support/external tables are deliberately outside Prisma ownership for now:

- media
- seo
- analytics_events
- admin_profiles

## Intentional baseline/live differences

The baseline must be reviewed for the following case before being accepted:

`projects.developer_id -> developers.id` is modeled in Prisma but the live database currently lacks the FK. Because a Prisma-generated baseline would include that FK, the candidate requires manual review and intentional treatment of this known live difference. The preferred approach is to omit the FK from the baseline and add it later as a hardening migration after verification, or explicitly establish another documented ownership strategy.

## Candidate generation rule

The exact SQL candidate must be generated in an environment with the checked-in Prisma schema and Prisma CLI version used by the repository. Do not hand-author a substitute and call it generated.

Recommended command:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema prisma/schema.postgres.prisma \
  --script > docs/PHASE2_BASELINE_CANDIDATE.sql
```

Then inspect the SQL for:

- UUID defaults
- NUMERIC/Decimal columns
- project-scoped apartment unique constraints
- relation foreign keys
- indexes
- nullable/default semantics
- unsupported/external objects

## Candidate acceptance checks

Before any baseline is recorded as applied:

1. Compare candidate table/column set to live PostgreSQL.
2. Compare candidate constraints to live PostgreSQL.
3. Compare candidate indexes to live PostgreSQL.
4. Explicitly account for deferred hardening items.
5. Confirm support-table ownership remains outside the Prisma baseline.
6. Validate the candidate against a disposable PostgreSQL database.
7. Run Prisma `migrate status` against a safe non-production target if credentials/environment allow.
8. Only then consider `migrate resolve --applied` on production.

## Production rule

**No baseline has been applied to production in Phase 2 so far.**

## References

- https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining
- https://docs.prisma.io/docs/cli/migrate/diff
- https://docs.prisma.io/docs/cli/migrate/resolve
