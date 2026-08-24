# Phase 2 — RLS Access Matrix

**Status:** IN PROGRESS — policy hardening not yet applied
**Verified:** 2026-08-24

## Policy design principle

RLS is a database security boundary, not a frontend feature. Supabase documents that grants and policies are separate checks; granting a role access while relying only on a policy can still leave an operation available if the policy is too broad. Policies also need indexes on columns used in predicates as data grows.

## Current production evidence

RLS is enabled on the inspected public tables.

Existing explicit policies:

| Table | Current policy | Operation | Current predicate | Assessment |
|---|---|---|---|---|
| admin_profiles | admin_profiles_self_read | SELECT | `auth.uid() = id` | Narrow/read-safe, but role is currently public; validate intended anon behavior |
| analytics_events | analytics_public_insert | INSERT | `WITH CHECK (true)` | Intended public telemetry path; input/schema validation must remain in application |
| apartments | apartments_public_read | SELECT | `true` | **Too broad for a publication boundary**; does not encode published/archived state |
| leads | leads_public_insert | INSERT | `WITH CHECK (true)` | Intended public lead capture; application validation/rate limiting required |
| media | media_public_read | SELECT | `true` | **Too broad until parent publication semantics are enforced** |
| newsletter_subscriptions | newsletter_public_insert | INSERT | `WITH CHECK (true)` | Public opt-in path; validate email and rate limiting in application |
| newsletter_subscriptions | newsletter_public_update | UPDATE | `true` | **High risk**; public UPDATE is broader than necessary and must be narrowed or removed |
| projects | projects_public_read | SELECT | `true` | **Too broad for published/archived publication contract** |

Many RLS-enabled tables currently have no explicit policies. They should remain inaccessible through the relevant client roles until an intentional admin/service access path is defined; do not add permissive `USING (true)` policies merely to silence the advisor.

## Target access matrix

| Table | Public website | Authenticated ERP | Admin privileged | Service role |
|---|---|---|---|---|
| projects | SELECT published + not archived | SELECT/operational | CRUD | full |
| apartments | SELECT published + not archived | SELECT/operational | CRUD/status | full |
| buildings | SELECT only when project is published | SELECT/operational | CRUD | full |
| project_images | SELECT when project published | SELECT | CRUD | full |
| apartment_images | SELECT when apartment published | SELECT | CRUD | full |
| project_amenities | SELECT with published project | SELECT | CRUD | full |
| videos | SELECT only when parent entity is published | SELECT | CRUD | full |
| media | SELECT only for published parent | SELECT | CRUD | full |
| developers | SELECT if associated with published catalog | SELECT | CRUD | full |
| leads | INSERT only | SELECT/UPDATE according to role | full CRM operations | full |
| lead_notes | none | SELECT/INSERT for authorized CRM staff | full | full |
| newsletter_subscriptions | INSERT; no unrestricted public UPDATE | operational | full | full |
| analytics_events | INSERT only | operational read if needed | full | full |
| site_content | no direct public mutation | SELECT for ERP | CRUD/publish | full |
| seo | public read only through server/public projection | operational | CRUD | full |
| admin_profiles | no public access | authenticated self-read | role administration | full |
| admin_users | none | controlled authenticated access | CRUD | full |
| admin_sessions | none | none from browser | server-side only | full |
| audit_logs | none | limited audit read | full | full |
| login_rate_limits | none | none from browser | operational only | full |

## Critical implementation notes

1. The public catalog policy must enforce publication state at the database boundary. Application-level `published=true` filters alone are not sufficient if the public Supabase roles retain direct table grants.
2. `media` publication must be derived from its parent project/apartment because the live `media` table has no publication column.
3. `newsletter_subscriptions` must not expose unrestricted public UPDATE. The public flow should use insert-only or a tightly scoped tokenized unsubscribe mechanism.
4. Administrative tables should not receive public policies. Service-role operations must remain server-side.
5. Policy predicates must have supporting indexes when they filter on non-key columns.

## Security advisor interpretation

The advisor reports RLS-enabled tables without policies. These are not automatically defects: for a table that has no intended public/authenticated access, RLS without a policy is a secure default. The high-value work is correcting over-broad existing policies and defining the authenticated ERP access model.

## Status

**Policy changes are intentionally NOT applied in this document.** They require route/access verification and should be implemented in a dedicated Supabase migration after the baseline architecture is settled.
