# Phase 2 — Constraint Reconciliation

**Status:** ACTIVE — production DDL intentionally deferred.

## Verified live constraints

The live PostgreSQL database currently has the following core relationship constraints:

- `projects.slug` UNIQUE
- `buildings.slug` UNIQUE
- `developers.slug` UNIQUE
- `apartments(project_id, apartment_number)` UNIQUE
- `apartments(project_id, slug)` UNIQUE
- `site_content.key` UNIQUE
- `newsletter_subscriptions.email` UNIQUE
- `admin_users.email` UNIQUE
- `admin_sessions.token` UNIQUE
- `login_rate_limits.key` UNIQUE

Foreign keys currently verified:

- `buildings.project_id → projects.id` ON DELETE CASCADE
- `apartments.project_id → projects.id` ON DELETE CASCADE
- `apartments.building_id → buildings.id` ON DELETE SET NULL
- `project_images.project_id → projects.id` ON DELETE CASCADE
- `apartment_images.apartment_id → apartments.id` ON DELETE CASCADE
- `project_amenities.project_id → projects.id` ON DELETE CASCADE
- `leads.project_id → projects.id` ON DELETE SET NULL
- `leads.apartment_id → apartments.id` ON DELETE SET NULL
- `lead_notes.lead_id → leads.id` ON DELETE CASCADE
- `videos.project_id → projects.id` ON DELETE CASCADE
- `videos.apartment_id → apartments.id` ON DELETE CASCADE
- `admin_sessions.user_id → admin_users.id` ON DELETE CASCADE

## Important mismatch: `projects.developer_id`

The current Prisma contract declares:

```text
Project.developer → Developer
```

with a relation from `projects.developer_id` to `developers.id`.

The live database currently has **no foreign-key constraint** for `projects.developer_id`.

Data integrity check:

- 5 projects have a non-null developer reference.
- 0 orphan developer references were found.

### Decision

Do **not** add the foreign key directly to production during stabilization.

The intended ERP-grade invariant is that a project cannot reference a nonexistent developer. Therefore the preferred future migration is to add the FK after the baseline has been established and after staging verification confirms that all existing and future writes satisfy the invariant.

The baseline must represent the live database, while the post-baseline migration may strengthen the constraint.

## `projects.hero_media_id`

The live column exists, but no current FK relationship is defined and no rows currently reference it. The current Prisma contract deliberately does not model a relation for this field. No change is required during Phase 2 stabilization.

## Rule

A constraint that exists in Prisma but not in production is **not** considered applied merely because the application can query the relationship. It must be represented accurately in the migration plan.

Conversely, production constraints must not be removed merely to make the Prisma schema easier to model.
