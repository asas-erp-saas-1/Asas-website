# Phase 2 — Constraint Contract

**Status:** IN PROGRESS — hardening migrations not applied
**Verified:** 2026-08-24

## Existing production invariants

### Projects
- primary key `projects.id`
- unique `projects.slug`

### Buildings
- primary key `buildings.id`
- unique `buildings.slug`
- FK `buildings.project_id -> projects.id` with cascade delete

### Apartments
- primary key `apartments.id`
- FK `apartments.project_id -> projects.id` with cascade delete
- FK `apartments.building_id -> buildings.id` with set-null delete
- unique `(project_id, apartment_number)`
- unique `(project_id, slug)`

### Media / catalog assets
- project_images -> projects cascade
- apartment_images -> apartments cascade
- videos -> projects/apartments cascade
- project_amenities -> projects cascade

### CRM
- leads -> projects set-null
- leads -> apartments set-null
- lead_notes -> leads cascade

### Administration
- admin_sessions -> admin_users cascade
- admin_profiles -> auth.users

## Confirmed integrity gap

`projects.developer_id` is nullable and populated in current data, but the live database does not currently have the Prisma-modeled FK to `developers.id`.

Current orphan scan: 0 orphan references among 5 projects.

Decision: do not modify production during baseline. Add the FK only as a later controlled hardening migration after a fresh orphan scan and validation.

## Application invariants that are not yet database constraints

These need explicit product/business decisions before adding CHECK constraints:

- apartment status vocabulary
- lead status vocabulary
- price non-negative semantics
- surface positive semantics
- floor range relative to building floors
- published/archived combinations
- video ownership requiring at least one parent
- media ownership requiring a valid parent for public visibility

Do not invent CHECK constraints from current data alone; define domain rules first.

## ERP safety

Database constraints should protect hard invariants even if the public site, ERP, integration, or future AI worker bypasses the UI. Application validation remains required as a complementary layer.
