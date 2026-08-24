# Phase 2 — Index Contract

**Status:** IN PROGRESS — no index removals applied
**Verified:** 2026-08-24

## Current production principle

The current database is small (5 projects, 8 apartments, 1 lead), so unused-index advisor findings must not be treated as proof that an index is wrong. Supabase's performance advisor is useful evidence, but index decisions should follow real query paths and expected ERP/public access patterns.

## Current indexes worth preserving

### Inventory
- `apartments (project_id)`
- `apartments (building_id)`
- `apartments (status)`
- `apartments (published)`
- unique `(project_id, apartment_number)`
- unique `(project_id, slug)`

### Catalog hierarchy
- `buildings (project_id)`
- `project_images (project_id)`
- `apartment_images (apartment_id)`
- `project_amenities (project_id)`
- `videos (project_id)`
- `videos (apartment_id)`

### CRM
- `leads (status)`
- `leads (created_at)`
- `leads (project_id)`
- `leads (apartment_id)`
- `lead_notes (lead_id)`
- `lead_notes (created_at)`

### Administration / security
- `admin_sessions (user_id)`
- `admin_sessions (expires_at)`
- unique `admin_sessions.token`
- unique `login_rate_limits.key`

### Audit / analytics
- `audit_logs (actor_email)`
- `audit_logs (action)`
- `audit_logs (entity_type, entity_id)`
- `audit_logs (created_at)`
- `analytics_events (project_id)`
- `analytics_events (apartment_id)`
- `analytics_events (created_at)`

## Advisor findings

Supabase currently reports several unused indexes, including indexes on newsletter status/created_at, admin session user_id, video project/apartment, lead notes created_at, audit log fields, login rate-limit fields, analytics project/apartment/created_at, apartment building/status, and lead status/project/apartment.

No unused index is being removed during Phase 2 solely from this evidence. Several of these indexes are appropriate for the ERP access paths even though the current data volume is too small to exercise them.

## Future composite index candidates

These are candidates, not current migrations:

- `project_images (project_id, sort_order)` for ordered project galleries;
- `apartment_images (apartment_id, sort_order)` for ordered apartment galleries;
- `lead_notes (lead_id, created_at)` for CRM timelines;
- `apartments (project_id, published, archived, status)` if catalog filters demonstrate a need;
- `leads (status, created_at)` if the ERP lead queue becomes the dominant query path.

They should be justified with query plans after representative ERP/public workloads are defined.

## RLS/index relationship

RLS predicates that filter by user/owner/parent must have appropriate supporting indexes. Supabase explicitly recommends indexes for columns referenced by policy predicates.

## Decision

Keep current indexes. Do not remove unused indexes yet. Introduce future composites only through measured, version-controlled migrations.
