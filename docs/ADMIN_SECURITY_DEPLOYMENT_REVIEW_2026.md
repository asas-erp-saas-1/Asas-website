# ASAS Admin — Security & Deployment Review

**Review date:** 2026-09-02  
**Scope:** Admin UX/UI foundation, GitHub Actions, Vercel preview, Supabase production schema  
**Repository:** `asas-erp-saas-1/Asas-website`

## 1. Review objective

Verify that the Admin UX/UI foundation does not weaken the existing authentication, authorization, database isolation, or deployment controls, and identify risks that should be addressed before expanding the admin workspace.

## 2. GitHub / CI review

The Prisma baseline step was previously failing because the workflow passed `--to-schema`, which is not the supported Prisma `migrate diff` schema-datamodel option. The workflow was corrected to use `--to-schema-datamodel prisma/schema.postgres.prisma`.

The admin foundation itself is intentionally UI-scoped: it does not change API contracts, authentication, authorization, Prisma models, or database access.

The mobile CSS foundation was also corrected to avoid a global wide-table constraint. A global `min-width` combined with `overflow-x: hidden` could trap table content on small screens; responsive scrolling must be owned by the actual table container.

## 3. Supabase live schema review

The production Supabase project was inspected directly without changing data or schema.

### Authentication/session contract

`public.admin_sessions` currently contains:

- `id` UUID primary key
- `token` text, unique
- `user_id` UUID
- `email`, `name`, `role`
- `expires_at`
- `created_at`
- `revokedAt` nullable timestamp with time zone

`public.login_rate_limits` currently contains:

- `id` UUID primary key
- `key` text, unique
- `count`
- `window_start`
- `lockedUntil` nullable timestamp with time zone
- `updated_at`

This confirms the live database currently matches the Prisma camel-case contract used by the recent authentication fixes. The associated indexes for `revokedAt`/`lockedUntil` must not be assumed to exist unless explicitly created; the current live inspection confirmed the `lockedUntil` index exists.

### RLS status

RLS is enabled on the reviewed operational tables:

- `admin_sessions`
- `login_rate_limits`
- `projects`
- `apartments`
- `buildings`
- `leads`
- `audit_logs`

RLS is not forced on these tables.

### Current public policies

The live policies inspected were:

- `projects_public_read`: anonymous/authenticated SELECT only when `published = true AND archived = false`.
- `apartments_public_read`: anonymous/authenticated SELECT only when `published = true AND archived = false`.
- `leads_public_insert`: public INSERT with a `true` check.

No public SELECT/INSERT/UPDATE/DELETE policy was present for `admin_sessions`, `login_rate_limits`, `buildings`, or `audit_logs` in this reviewed subset. With RLS enabled, that is a deny-by-default posture for clients using the corresponding database roles; the server-side admin application must continue using its intended privileged server connection rather than exposing these tables directly to the browser.

## 4. Security risks to address in the next admin vertical slices

### P0 — preserve server-only admin data access

Do not move admin-session, audit, user-management, or rate-limit database operations into browser-side Supabase clients merely to simplify UI work.

### P1 — public lead intake hardening

`leads_public_insert` currently permits public inserts. This may be intentional for lead capture, but it makes anti-abuse controls critical. The application should retain server-side validation, rate limiting, spam/bot controls, field-size limits, and auditability around this endpoint.

### P1 — admin list scalability

The current AdminPage implementation has list fetches capped at a finite page size. The next catalogue/sales vertical slice should introduce server-side pagination/filtering rather than increasing arbitrary limits.

### P1 — migration contract discipline

Every schema change affecting Prisma must have a durable migration and must be validated against the actual production schema. Avoid ad-hoc dashboard edits for persistent fixes.

### P2 — RLS policy regression tests

Add an automated database-security check that verifies intended public policies remain present and that privileged admin tables remain inaccessible to untrusted roles. This should be implemented as a dedicated CI/security gate rather than as part of visual UI tests.

## 5. Decision

The current Admin UX/UI foundation can proceed without a database migration. The next implementation wave should focus on real admin task flows while preserving the existing server-side security boundary.

No live Supabase schema was modified during this review.
