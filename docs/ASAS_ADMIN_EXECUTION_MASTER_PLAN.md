# ASAS ADMIN — EXECUTION MASTER PLAN & ENGINEERING LOG

> **Status:** ACTIVE — authoritative execution tracker
> **Branch:** `feat/admin-ux-ui-foundation`
> **PR:** #7
> **Repository:** `asas-erp-saas-1/Asas-website`
> **Last reviewed implementation checkpoint:** `eff19fcc1e300bb466e3559c154a57fa6675928e`
> **Rule:** This file records the execution contract, prompt for each step, evidence, decisions, and blockers. It is updated as part of the engineering work so the long-running execution does not depend on conversation memory.

## Non-negotiable execution rules

1. Never reset, force-push, rewrite history, merge to main, delete valid commits, or perform destructive production DB changes.
2. Never claim tested/deployed/verified without evidence.
3. Treat the production PostgreSQL Prisma schema and existing API capabilities as the source of truth for data support.
4. No fabrication: unavailable data remains `unknown`; UI state never implies a server-confirmed business state.
5. Preserve the established execution order:
   **Build integrity → Architecture convergence → Data correctness → Navigation/state → Responsive UX → Mutation/error/loading → Accessibility → Performance → Visual polish → Browser certification.**
6. Every implementation wave follows:
   **Observe → Isolate → Model → Smallest coherent change → Typecheck → Lint → Build → Diff inspection → CI → Deploy → Runtime verify.**
7. Do not introduce Redux/Zustand/virtualization/new backend architecture/new schema unless evidence proves necessity.
8. Every material implementation change gets a commit and an entry in this file.

## Current domain source-of-truth

The runtime Admin database contract is PostgreSQL via `prisma/schema.postgres.prisma` and `src/lib/db.ts`. The legacy SQLite Prisma schema is not the production Admin persistence contract.

Canonical operational relationship:

`Project → Building → Apartment → Availability → Lead Interest → Follow-up → Reservation → Contract → Payment`

Only relationships/capabilities actually represented by the current application/backend may be exposed as executable actions.

---

# Execution waves

## STEP 0 — Baseline / CI authority
**Goal:** establish the exact HEAD, CI state, and build gates before each risky wave.

## STEP 1 — Operational vocabulary convergence
**Goal:** one canonical action vocabulary shared by operational units, transitions, journeys and workspaces.
**Status:** Implemented; subsequent commits require fresh CI evidence.

## STEP 2 — Project operational vertical slice
**Goal:** make Project the parent operational context rather than an isolated CRUD editor.
**Status:** In progress — API/data-contract convergence and downstream Lead contract alignment.

## STEP 3 — Building operational vertical slice
**Goal:** Building is a child operational entity with explicit Project context.

## STEP 4 — Apartment operational vertical slice
**Goal:** complete the first high-value real-estate operational entity.

## STEP 5 — Customer / Lead vertical slice
**Goal:** connect customer operations to real inventory without fabricating reservation state.
**Status:** In progress — backend transition integrity and workspace contract alignment implemented; fresh CI remains required.

## STEP 6 — Reservation boundary
**Goal:** make reservation a server-confirmed business event where supported.

## STEP 7 — Navigation and URL state certification
**Goal:** URL is the authoritative recoverable navigation state.

## STEP 8 — Server-state and request lifecycle
**Goal:** one clear owner for server state and controlled network behavior.

## STEP 9 — Error/loading/empty-state taxonomy
**Goal:** operationally meaningful feedback.

## STEP 10 — Responsive behavior contracts
**Goal:** behavior-first responsive implementation, not desktop shrinkage.

## STEP 11 — Accessibility WCAG 2.2 AA
**Goal:** keyboard and assistive technology correctness.

## STEP 12 — Performance / scale
**Goal:** conceptual correctness at 10–100,000 records.

## STEP 13 — Observability / deployment / runtime
**Goal:** production evidence.

## STEP 14 — Browser certification
**Goal:** certify the required browser × viewport matrix.

## STEP 15 — Final operational acceptance
**Goal:** prove the Admin is an operational workspace, not a collection of CRUD screens.

---

# Engineering log

### 2026-09-10 — Legacy entity-dialog removal
Commit `8c2862834e51f83be0d039119a1e10efb8e48e43` removed obsolete Project/Apartment shell dialogs. Dashboard create actions now route to canonical workspaces with create context.

### 2026-09-10 — CI RCA / shell preview isolation
Commit `d98065e89853c41ebad8d4b9783580678ccee5` restored only the bounded preview queries still required by Dashboard/Media after legacy workspace state removal. Canonical operational workspaces remain data owners.

### 2026-09-11 — Production DB alignment audit
Commit `111d94f3f797e3516399a86f3fb20d782bd35ed3` added `docs/ASAS_ADMIN_DATABASE_ALIGNMENT_AUDIT.md` after direct inspection of the live Supabase PostgreSQL schema.

Verified production facts at inspection time: projects=6, buildings=3, apartments=8, leads=4, project_images=4, apartment_images=19, project_amenities=19, developers=1, audit_logs=68, media=0, videos=0. The production hierarchy and FK relationships are present.

### 2026-09-11 — Status default alignment
Production data uses uppercase status values: Project `AVAILABLE/COMING_SOON/DRAFT`, Apartment `AVAILABLE`, Lead `NEW/VISIT`. Live PostgreSQL defaults were aligned safely:
- `projects.status` → `DRAFT`
- `apartments.status` → `AVAILABLE`
- `leads.status` → `NEW`

Migration applied successfully: `align_admin_status_defaults`. Existing rows were not modified.

Commit `072c3f79cce2b056816c4422b9c5d9aea71ab62e` aligns the PostgreSQL Prisma schema defaults with the live database defaults.

### 2026-09-12 — Publication default contract correction
Live PostgreSQL inspection exposed a remaining contract mismatch: `projects.published` and `apartments.published` still defaulted to `true`, while Admin create behavior requires new inventory to start unpublished. Existing rows were not changed.

Migration applied successfully: `align_publication_defaults`:
- `projects.published` → `false`
- `apartments.published` → `false`

Verified immediately after migration through `information_schema.columns`; both live defaults report `false`.

Commit `8fcbb089760df2bff2678111bd2187673e340d74` aligns `prisma/schema.postgres.prisma` with the live publication defaults.

### 2026-09-12 — Project mutation authorization hardening
Commit `f1f1c102c0928dc4b69953d2181b7b977c61a4b7` adds the missing `ADMIN/EDITOR` role gate to `PUT /api/admin/projects/[slug]`. The route already used the existing audit logger; no new capability or schema was introduced.

### 2026-09-12 — Building API contract hardening
Commit `860a1a316e3dc69cf5059dab1d37853932841a4e` hardened `/api/admin/buildings` without changing the database model:
- Zod query validation and bounded pagination.
- `floors` must be a positive integer; corrected the prior falsy check that rejected `0` ambiguously.
- Creation now verifies the referenced Project exists before inserting.
- Existing `ADMIN/EDITOR` mutation gate and audit logging retained.
- GET remains server-authoritative with count and explicit Project relation.

### 2026-09-12 — Apartment API contract hardening
Commit `7f914a99109f404758f050e6be500c2a18f1d115` hardened `/api/admin/apartments`:
- Added Zod validation for create payloads and retained bounded query pagination.
- Enforced referenced Project existence.
- Enforced Building existence and, critically, `building.projectId === apartment.projectId` before creation, preventing cross-project inventory association.
- Normalized and bounded supported status values.
- Preserved `published=false` for new apartments unless explicitly provided.
- Preserved the existing no-price-plus-price-on-request invariant.

The existing detail PUT route already enforces `ADMIN/EDITOR`, status transition validation, numeric validation, publication preconditions and audit logging. No Reservation capability was added.

### 2026-09-12 — Lead mutation contract hardening
Commit `e7e4aa6dae5cf3963068e4e7977d8af5951ad608` tightened `PATCH /api/admin/leads/[id]/status` at the request boundary:
- `followUpDate` now requires a valid offset-aware ISO datetime when provided, preventing `Invalid Date` from reaching Prisma.
- `assignedTo` now rejects blank strings while preserving explicit `null` for unassignment.
- Existing authentication, ADMIN/EDITOR mutation gate, lead existence check, status allowlist, audit logging and server-authoritative persistence remain unchanged.

### 2026-09-12 — Canonical Lead pipeline enforcement
Commit `502ed38cb64a3c1216807a03ae683d47e0b88318` aligned the Lead status mutation route with the documented operational pipeline:
`NEW → CONTACTED → QUALIFIED → VISIT → NEGOTIATION → SOLD`, with `LOST` reachable from every active stage. `SOLD` and `LOST` are terminal because the current backend has no reopen/reservation lifecycle capability. Invalid jumps now return HTTP 409 instead of silently mutating the lead to an unsupported stage.

### 2026-09-12 — CI failure RCA on current branch HEAD
The first CI run associated with documentation HEAD `178fb376cc5a68f1519bd698a1a642d33230a80a` completed as run `#863` and failed at **Typecheck**. Prisma generation, baseline generation, baseline artifact upload and dependency installation succeeded; Lint and Build were skipped because Typecheck failed.

Exact TypeScript errors were all in `src/app/api/admin/apartments/route.ts`, at lines 83–84, caused by assigning raw nullable `unknown` values to Prisma PostgreSQL JSON inputs.

### 2026-09-12 — Prisma JSON null contract fix
Commit `b96a53f71d5a42dd57b71d3c05b09385dfc80f5c` corrected the Apartment create route's PostgreSQL JSON handling without changing the schema or business semantics:
- imported Prisma types from the generated PostgreSQL client;
- mapped explicit JSON `null` values to `Prisma.JsonNull`;
- typed non-null JSON payloads as `Prisma.InputJsonValue` for `rooms`, `features`, and `featuresAr`.

A new CI run for this exact commit was not observable before the subsequent changes.

### 2026-09-12 — Canonical Lead transition graph centralized
Commit `6860501a58cffeffe55358656584da76567f7da1` centralized the Lead status graph inside `src/lib/admin-operational-units.ts` as `LEAD_STATUS_TRANSITIONS` plus `getAllowedLeadStatusTransitions()`. This establishes one domain-level vocabulary for the customer lifecycle instead of allowing the UI and API to maintain divergent graphs.

### 2026-09-12 — Lead status API consumes shared transition graph
Commit `60c5cea830308fc482d79541eafcd684ba5a1247` removed the duplicate transition graph from `PATCH /api/admin/leads/[id]/status` and switched the route to the shared domain helper. Authentication, role enforcement, validation, audit logging and HTTP 409 behavior remain unchanged.

### 2026-09-12 — Lead workspace contract correction
Commit `229bedf43aef5ba8b285a8b34e224464b9b83850` aligned the Lead workspace with the shared lifecycle and existing relational data:
- status selectors now derive their options from `getAllowedLeadStatusTransitions(currentStatus)`, eliminating UI actions that the server would reject;
- the status dialog uses the same domain helper;
- Lead type now explicitly carries persisted `projectId` and `apartmentId`;
- Project and Apartment names become contextual navigation actions only when the corresponding persisted ID exists; no IDs/slugs are fabricated.

This closes the confirmed Lead UI/API transition mismatch and activates the existing Lead→inventory relationship at the navigation layer.

### 2026-09-12 — Project detail mutation contract hardening
Commit `eff19fcc1e300bb466e3559c154a57fa6675928e` hardened `PUT /api/admin/projects/[slug]` at the server boundary:
- added strict Zod validation for supported project fields and primitive ranges;
- rejected unknown fields instead of silently accepting them;
- blocked publishing an archived project;
- enforced `minSurface <= maxSurface` when the relevant values are present;
- preserved the existing price / price-on-request invariant when either pricing field changes;
- differentiated audit actions for price changes and publish/unpublish transitions while preserving the existing audit payload pattern.

CI run `#885` for this exact commit is currently **queued**; no green result is claimed yet.

## Current API contract conclusion
Project, Building, Apartment and the currently supported Lead mutation surface are explicitly treated as related operational entities. The Lead transition graph is now shared by domain/API/UI, and Lead→Project/Apartment contextual navigation uses real persisted foreign keys. Project detail mutation now has a typed server contract and explicit publication/archive guardrails. No Reservation capability has been invented.

Remaining STEP 2/5 work: CI completion, Project editor mutation/UI regression review, final Building/Apartment vertical-slice closure, then broader navigation/state and lifecycle work.

## Current execution state

**Active wave:** STEP 2 — Project operational vertical slice / data-contract convergence

**Immediate gates:**
1. Await and inspect CI run `#885` for exact HEAD `eff19fcc1e300bb466e3559c154a57fa6675928e`.
2. Project detail/editor mutation semantics and UI payload alignment.
3. Final Building/Apartment vertical-slice closure.
4. Lead UI regression/contract review after shared transition centralization.
5. Status/publication semantics audit.
6. Navigation and URL state certification after the operational slices are stable.

**Browser/runtime certification:** not verified in this execution context.
