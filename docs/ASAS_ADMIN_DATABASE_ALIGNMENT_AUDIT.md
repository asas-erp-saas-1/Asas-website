# ASAS Admin — Database Alignment Audit

Date: 2026-09-11
Branch: `feat/admin-ux-ui-foundation`

## Purpose

Establish the database as an explicit engineering dependency of the Admin rebuild. No Admin workflow may assume a field, relationship, status, or capability that is not supported by the production PostgreSQL schema and the canonical Prisma PostgreSQL schema.

## Verified production facts

Supabase project is active and healthy. PostgreSQL schema contains the operational hierarchy:

`projects → buildings → apartments`

and customer relationships:

`projects → leads`, `apartments → leads`, `leads → lead_notes`.

Production row counts observed on 2026-09-11:

- projects: 6
- buildings: 3
- apartments: 8
- leads: 4
- project_images: 4
- apartment_images: 19
- project_amenities: 19
- developers: 1
- audit_logs: 68
- media: 0
- videos: 0

## ORM alignment

`src/lib/db.ts` uses the generated PostgreSQL Prisma client. `prisma/schema.postgres.prisma` maps the principal Admin entities to the PostgreSQL tables and uses UUIDs, PostgreSQL JSON/JSONB, mapped snake_case columns, and the actual relational hierarchy.

The legacy SQLite schema is **not** the production Admin data contract. New Admin work must use the PostgreSQL schema contract.

## Important schema semantics

### Project

Production supports identity, bilingual content, location, project type, apartment type JSON, surfaces, delivery, amenities flags, commercial fields, developer relation, publication/archive flags, SEO, ordering, timestamps, and related buildings/apartments/media/images/videos/leads.

### Building

Production requires `project_id`, `name`, `code`, and `floors`; supports bilingual name, elevator, ordering, timestamps, and the Project → Building → Apartment relationship.

### Apartment

Production supports both `project_id` and nullable `building_id`, physical/commercial fields, JSONB rooms/features, media references, publication/archive flags, SEO, ordering, and unique `(project_id, apartment_number)` plus `(project_id, slug)` constraints.

### Lead

Production supports project/apartment context, attribution fields, intent/source/status, assignment and follow-up date, plus Lead Notes. Reservation/contract/payment execution is not represented by the current production schema and must not be fabricated in the Admin.

## RLS/security observations

RLS is enabled on the production tables. Existing policies currently cover public read/write paths for selected public-facing tables, while many Admin/server-owned tables have RLS enabled without policies. Supabase reports this as `rls_enabled_no_policy` (INFO), not as proof of a vulnerability. The current application uses server-side Prisma/Admin authentication for Admin routes.

Supabase also reports:

- `vector` extension installed in `public` (WARN)
- leaked-password protection disabled in Supabase Auth (WARN)

These are tracked as release-security work. They are not changed automatically in this Admin UI pass because authorization semantics must be designed before policies are added.

## Required Admin rule

Every future Admin mutation must satisfy:

`UI action → authenticated Admin API → authorization → validated payload → PostgreSQL mutation → audit log → cache invalidation → UI feedback`

Do not create client-side direct writes to privileged tables merely to bypass an API limitation.

## Next database execution gates

1. Reconcile every Admin API route against `prisma/schema.postgres.prisma` and live PostgreSQL columns.
2. Verify status semantics and casing across Project, Building, Apartment, and Lead before adding database constraints.
3. Verify all FK paths used by contextual navigation.
4. Verify audit coverage for every privileged mutation.
5. Design RLS policies only after confirming whether any browser/client path directly accesses Supabase tables.
6. Add migrations only for confirmed domain requirements; never reshape production data to make the UI compile.

## Evidence rule

This document records observed production facts. It must be updated after each DB schema migration or material Admin API/data-contract change.
