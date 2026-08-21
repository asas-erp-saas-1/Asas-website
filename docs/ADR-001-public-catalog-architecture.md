# ADR-001 — Public Catalog Architecture

## Status
Accepted — August 2026

## Decision

ASAS uses a server-first public catalog architecture with explicit DTO boundaries.

### Canonical flow

Browser → Next.js route → public catalog query/API → Prisma → Supabase PostgreSQL

Interactive client features may use React Query, but they must consume an explicit API contract rather than Prisma-shaped objects.

## Rules

1. `Project` and `Apartment` database models are internal persistence models, not public API contracts.
2. Public listing surfaces use lean DTOs such as `PublicProjectCard`.
3. Project detail and apartment detail may use richer DTOs, but only the fields required by the page should cross the API boundary.
4. Published content is defined by `published = true AND archived = false`.
5. The public website never writes directly to PostgreSQL.
6. Admin mutations go through authenticated server-side application code and are audited.
7. The existing `/api/projects` contract remains temporarily compatible while the catalog is migrated atomically; new consumers should use `/api/catalog/projects` for list cards.
8. The custom legacy router is transitional. Canonical public URLs are Next.js App Router URLs under `/projects/...`.
9. SEO metadata must derive from canonical catalog data and must never generate hash-router URLs.
10. CRM is a future domain boundary only; it must not leak CRM assumptions into the public catalog model.

## Why

This prevents the common failure mode where frontend types, Prisma models, API payloads and URLs drift apart. It also keeps the platform ready for a future multi-tenant/CRM layer without forcing another public-site rewrite.
