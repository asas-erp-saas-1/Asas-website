# ASAS Admin — Apartment Vertical Slice Audit

> Branch: `feat/admin-ux-ui-foundation`
> PR: #7
> Audit HEAD: `636c191c0893118318954cd769532c05a6714309`
> Date: 2026-09-12

## Scope

This audit closes the reconnaissance/contract-audit gate for the Apartment operational vertical slice before further mutation work.

Canonical journey:

`Project → Building → Apartment → Availability → Lead Interest → Follow-up`

Reservation, Contract and Payment remain unsupported capabilities unless a real backend model/API exists.

## Verified implementation

### Detail identity and routing

- Apartment detail is URL-addressable through `entity=apartment&entityId=...`.
- The detail workspace resolves the entity by persisted UUID through `/api/admin/apartments/[slug]?id=<UUID>`.
- The API accepts UUID identity explicitly and falls back to slug lookup only for legacy callers.

### Authorization

- Apartment GET requires an authenticated admin session.
- Apartment PUT requires `ADMIN` or `EDITOR`.
- Apartment archive DELETE requires `ADMIN`.

### Status contract

- The UI derives allowed status targets from the shared `APARTMENT_STATUS_TRANSITIONS` graph.
- The API validates requested statuses and rejects invalid transitions with `409`.
- `RESERVED` remains readable for existing data but is not introduced as a new UI transition because no Reservation backend contract exists.

### Publication contract

Publication is treated as an outcome, not as a prerequisite for readiness.

The UI and API both block a publish transition when required operational completeness is missing. The server remains authoritative.

### Pricing contract

- Numeric commercial fields are validated as finite non-negative values.
- `priceOnRequest=true` cannot be combined with a concrete price in the same mutation.
- Price changes use a dedicated audit action.

### Archive contract

Archive is an ADMIN-only mutation and forces `published=false`. It is audited separately from ordinary updates.

### Media

Detail retrieval includes the persisted `imagesRelation`. Publication completeness can use persisted media rather than assuming a media capability that does not exist.

## Known mutation-state defect

`PUT /api/admin/apartments/[slug]` currently returns the directly updated Apartment record. The detail workspace currently assigns that response to `detail` after a successful mutation.

That response does not include the richer nested detail context returned by GET (`project`, `building`, `imagesRelation`). Therefore a successful price/status/publication mutation can replace a fully hydrated detail object with a reduced mutation payload and temporarily lose nested context in the UI.

This is a state-contract defect, not a database integrity defect.

### Required correction

After a successful detail mutation, the workspace must either:

1. refetch the canonical GET detail and replace `detail` with the fully hydrated server representation; or
2. merge only the mutation fields into the existing hydrated detail object without discarding nested relations.

Preferred implementation: **refetch canonical detail after mutation**. This keeps GET as the single source of truth for the detail projection and avoids maintaining a second client-side projection contract.

## Regression gates

Before declaring the Apartment slice complete:

1. Successful price mutation preserves project/building/media context.
2. Successful status mutation preserves project/building/media context.
3. Successful publish/unpublish preserves project/building/media context.
4. Failed mutations leave the last valid hydrated detail intact and expose retry semantics.
5. Building → Apartment navigation resolves the persisted building relationship.
6. Lead → Project and Lead → Apartment navigation resolves only persisted IDs.
7. No UI introduces Reservation/Contract/Payment actions without backend support.
8. Exact-head CI remains green after the correction.

## Verification evidence

CI run `#950` on HEAD `636c191c0893118318954cd769532c05a6714309` completed successfully. Dependency installation, Prisma generation, baseline generation/verification/upload, Typecheck, Lint and Build all passed.

Browser/runtime certification remains blocked because browser automation is not available in this execution context.
