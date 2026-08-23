# ADR-003 — Core Domain and Transport Boundaries

## Status
Accepted — August 2026

## Context
ASAS is a public real-estate catalog today, with an operational admin surface and a planned CRM/ERP and integration layer. The platform must support high traffic, advertising attribution, future AI agents, and continued catalog growth without coupling public UI contracts to Prisma persistence models.

## Decision
1. Prisma models are persistence/domain infrastructure types. They are not public transport contracts.
2. Public catalog payloads live in `src/lib/catalog-contracts.ts` and are created by `src/lib/catalog-mappers.ts` on the server.
3. Public list/search endpoints return lean DTOs (`PublicProjectCard`, `PublicApartmentCard`). Detail endpoints return richer DTOs (`PublicProjectDetail`, `PublicApartmentDetail`).
4. Client-side React Query code imports public DTOs only for catalog reads. It must not import `Project` or `Apartment` from `src/lib/types.ts` for public API responses.
5. Admin/domain consumers may continue using domain types until their own boundary migration is completed.
6. Building apartment rows are not embedded in public building objects; the public contract exposes `apartmentCount` and the project detail has its explicit apartment collection.
7. Public API routes perform the database query and mapping server-side. No browser code writes directly to PostgreSQL.
8. Future CRM/ERP and AI integrations must consume application/domain services or versioned integration contracts, never Prisma records directly.

## Consequences
- Database schema changes do not automatically change the public API.
- Payload size is reduced for listing/search traffic.
- TypeScript catches boundary violations during CI/build instead of at runtime.
- AI, advertising and future mobile clients can consume stable versioned contracts.
- Some legacy admin components still use domain types and will be migrated in later phases; they are intentionally not mixed into the public catalog boundary.

## Verification checklist
- Public catalog API returns only explicit DTOs.
- Public client hooks use `Public*` contracts.
- Public apartment card does not expose image arrays or internal persistence fields.
- Public building does not expose apartment rows.
- Build/typecheck passes after every boundary migration.
