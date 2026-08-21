# ADR-002 — Public Catalog Migration

## Status
In progress

## Decision
The public website must not consume Prisma/domain `Project` or `Apartment` models directly.

The public catalog boundary is:

```text
Supabase PostgreSQL
  -> Prisma server queries
  -> Public mapper
  -> Public DTO contract
  -> Server route / Server Component
  -> Client interaction components
```

## Scope of this migration

1. `PublicProjectCard` is the only contract for project-list cards.
2. `PublicProjectDetail` is the only contract for public project detail.
3. `PublicApartmentDetail` is the only contract for public apartment detail.
4. Search/filtering at apartment level uses the canonical apartment search endpoint.
5. The old `/api/projects` endpoint is retired only after all consumers are migrated.
6. Compatibility adapters are temporary and must not be imported by new public components.

## Non-goals

- CRM implementation.
- SaaS billing or multi-tenancy implementation.
- UI redesign during architecture migration.
- Database reseeding.

## Migration gates

### Gate A — Data correctness
- Published projects and apartments come from Supabase.
- Archived records never appear publicly.
- Availability is derived from apartment status.

### Gate B — Type boundary
- Public components import `catalog-contracts.ts`, not `types.ts` for catalog data.
- No `as unknown as` casts in public catalog mappers.
- No Prisma types cross the public boundary.

### Gate C — Consumer migration
- Projects page uses `PublicProjectCard`.
- Home page uses `PublicProjectCard`.
- Recommendation UI uses canonical apartment search/detail data.
- Map consumes a dedicated projection, not full project objects.

### Gate D — Legacy removal
Only after Gates A-C pass:
- remove `useProjects` legacy API hook;
- remove `catalog-legacy-adapter.ts`;
- remove obsolete `/api/projects` endpoint;
- remove unused legacy fields from public-facing contracts.

### Gate E — Runtime verification
- Typecheck passes.
- Lint passes.
- Production build passes.
- Public project list renders all currently published projects.
- Project detail and apartment detail resolve by canonical URLs.
- Admin changes continue to flow to the public catalog.

## Rationale
Next.js recommends keeping database access on the server when possible, which avoids exposing database credentials and reduces unnecessary client/server network hops. React Server Components can query data directly on the server, while client components remain for interaction. TanStack Query hydration can preserve client interactivity without a second initial fetch. Supabase RLS remains the defense-in-depth boundary for any direct Data API access.
