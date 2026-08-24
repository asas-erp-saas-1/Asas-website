# Phase 2 — PostgreSQL Table Ownership Matrix

## Purpose

The live Supabase database contains more tables than the current Prisma application model. A migration baseline must not silently take ownership of tables that are maintained by another subsystem.

## Classification

| Live table | Classification | Reason / contract |
|---|---|---|
| `projects` | Prisma-managed | Core real-estate project catalog |
| `buildings` | Prisma-managed | Project building inventory |
| `apartments` | Prisma-managed | Unit inventory; project-scoped slug identity |
| `project_images` | Prisma-managed | Project media relation |
| `apartment_images` | Prisma-managed | Apartment media relation |
| `developers` | Prisma-managed | Developer/project relationship |
| `project_amenities` | Prisma-managed | Project amenities |
| `leads` | Prisma-managed | Sales lead capture and attribution |
| `lead_notes` | Prisma-managed | CRM lead activity |
| `site_content` | Prisma-managed | Website content contract |
| `newsletter_subscriptions` | Prisma-managed | Marketing subscription workflow |
| `admin_users` | Prisma-managed | Current application admin identity store |
| `admin_sessions` | Prisma-managed | Current application session store |
| `videos` | Prisma-managed | Project/apartment video catalog |
| `audit_logs` | Prisma-managed | Application audit trail |
| `login_rate_limits` | Prisma-managed | Application login protection |
| `admin_profiles` | External/support | Separate profile structure; not represented by current Prisma model |
| `analytics_events` | External/support | Analytics event ingestion; uses bigint IDs and JSONB metadata |
| `media` | External/support | Generic media registry; separate from image relation tables |
| `seo` | External/support | Generic entity SEO registry; current application also has inline SEO fields |

## Ownership rules

1. Prisma must not delete or recreate external/support tables during baseline work.
2. External/support tables must not be added to Prisma merely to make the inventory look complete.
3. If an external table becomes part of the application transaction boundary, it receives an explicit model and migration ownership decision first.
4. Generic `media` and dedicated `project_images` / `apartment_images` are not interchangeable without an explicit data-model decision.
5. The inline SEO fields on projects/apartments and the generic `seo` table represent two different storage contracts until proven otherwise; no consolidation is permitted during Phase 2 stabilization.

## Baseline consequence

The Prisma baseline covers the Prisma-managed contract only. The production database remains the source of truth for external/support tables until their ownership is deliberately migrated.

## Next audit

Before the first baseline migration is marked applied:

- verify every Prisma-managed table column against live PostgreSQL;
- verify every Prisma-managed constraint and index;
- verify external/support foreign keys into the catalog;
- verify RLS policy ownership for every external/support table;
- verify no application route depends on a table that is accidentally excluded from the Prisma contract.
