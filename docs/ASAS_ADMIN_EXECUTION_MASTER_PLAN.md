# ASAS ADMIN — EXECUTION MASTER PLAN & ENGINEERING LOG

> **Status:** ACTIVE — authoritative execution tracker
> **Branch:** `feat/admin-ux-ui-foundation`
> **PR:** #7
> **Repository:** `asas-erp-saas-1/Asas-website`
> **Last reviewed implementation checkpoint:** `f15b4252199a0d377afa8f0a6051df665a5ed70c`
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

**Prompt:**
> Inspect the current branch HEAD and PR #7. Inspect GitHub Actions for that exact commit. Inspect typecheck, lint, production build and any deployment/runtime evidence. Do not infer success from source inspection. If a gate fails, isolate and fix only the root cause, commit, and repeat the gate.

**Exit evidence:** exact SHA + CI run + individual gate status.

## STEP 1 — Operational vocabulary convergence
**Goal:** one canonical action vocabulary shared by operational units, transitions, journeys and workspaces.

**Prompt:**
> Read the operational unit definitions and all transition definitions. Compare every action ID against the canonical vocabulary. Detect aliases, spelling drift, duplicate outcomes, invalid syntax, and actions that imply unsupported backend capabilities. Correct only the smallest coherent set. Do not invent capabilities.

**Status:** Implemented; subsequent commits require fresh CI evidence.

## STEP 2 — Project operational vertical slice
**Goal:** make Project the parent operational context rather than an isolated CRUD editor.

**Prompt:**
> Inspect Project list/detail/editor, PostgreSQL Prisma Project/Building/Apartment models, API routes, route model, React Query ownership and workspace navigation. Implement Project list → detail/editor → authoritative completeness → Buildings → Apartments → inventory context. Do not derive totals from paginated slices. Do not invent publication readiness. Child creation must inherit explicit project context and preserve URL context.

**Status:** In progress.

## STEP 3 — Building operational vertical slice
**Goal:** Building is a child operational entity with explicit Project context.

**Prompt:**
> Inspect Building schema, API capabilities and current workspace. Implement Building list/detail/context only where supported. Enforce Project association as an operational precondition. Expose structural data, apartments and inventory status from authoritative server data. Treat an orphan Building as an integrity problem, not an empty state. Preserve parent URL context.

## STEP 4 — Apartment operational vertical slice
**Goal:** complete the first high-value real-estate operational entity.

**Prompt:**
> Inspect Apartment schema, API routes, editor, media capabilities, Project/Building relationships and availability representation. Implement List → Detail → Project/Building context → Physical Specs → Commercial Data → Availability → Media → Completeness → Publication → Lifecycle. Every section must distinguish persisted data from unknown data. Reservation state must never be inferred from UI state.

## STEP 5 — Customer / Lead vertical slice
**Goal:** connect customer operations to real inventory without fabricating reservation state.

**Prompt:**
> Inspect Lead schema, APIs, current workspace, property-interest representation and reservation support. Implement Lead → Qualification → Assignment → Property Interest → Follow-up → Negotiation → Reservation → Conversion/Loss only for capabilities supported by the backend.

## STEP 6 — Reservation boundary
**Goal:** make reservation a server-confirmed business event where supported.

**Prompt:**
> Inspect the actual Reservation model/API. If no executable reservation capability exists, document it as unsupported/future and do not build fake confirmation UI.

## STEP 7 — Navigation and URL state certification
**Goal:** URL is the authoritative recoverable navigation state.

**Prompt:**
> Audit every Admin workspace for duplicated route parsing, local activeTab authority, hash/path conflicts, manual history mutation and state leakage. Define one AdminRouteModel and ensure workspace/entity/id/search/filter/sort/pagination/subview are URL-addressable where meaningful.

## STEP 8 — Server-state and request lifecycle
**Goal:** one clear owner for server state and controlled network behavior.

**Prompt:**
> Audit React Query usage and all Admin fetch/search effects. Implement AbortController where appropriate, deliberate search debounce, stale-response protection, duplicate-request prevention, pagination, bounded payloads, cache invalidation and retry semantics. Do not introduce another state library.

## STEP 9 — Error/loading/empty-state taxonomy
**Goal:** operationally meaningful feedback.

**Prompt:**
> Audit all major Admin operations and map failures to validation/authentication/authorization/network/API/server/conflict/timeout/unknown. Map loading and empty states to explicit operational categories.

## STEP 10 — Responsive behavior contracts
**Goal:** behavior-first responsive implementation, not desktop shrinkage.

**Prompt:**
> For Projects, Buildings, Apartments and Leads define Desktop/Tablet/Mobile behavior before changing broad CSS. Use 360×800 as hard mobile constraint and the established tablet/desktop matrix.

## STEP 11 — Accessibility WCAG 2.2 AA
**Goal:** keyboard and assistive technology correctness.

**Prompt:**
> Audit navigation, tables, forms, dialogs, drawers, focus entry/restoration, visible focus, labels, errors, status announcements, semantic tables, current navigation state and operational target sizes. Fix P0/P1 defects before visual polish.

## STEP 12 — Performance / scale
**Goal:** conceptual correctness at 10–100,000 records.

**Prompt:**
> Audit list endpoints, selectors, aggregates, search, pagination and payload sizes. Ensure totals come from server aggregates, not paginated lists. Define indexed search requirements based on the actual schema. Do not add virtualization without profiling evidence.

## STEP 13 — Observability / deployment / runtime
**Goal:** production evidence.

**Prompt:**
> Inspect GitHub Actions, Vercel deployment state, runtime logs/errors, hydration errors and available browser/preview evidence. If SSO blocks visual testing, record exactly: VISUAL VALIDATION BLOCKED — VERCEL SSO.

## STEP 14 — Browser certification
**Goal:** certify the required browser × viewport matrix.

**Prompt:**
> Use real browser/preview tooling where available. Test the required browser and viewport matrix. Record pass/fail/block evidence per workspace. Never summarize a blocked test as passed.

## STEP 15 — Final operational acceptance
**Goal:** prove the Admin is an operational workspace, not a collection of CRUD screens.

**Prompt:**
> Execute representative end-to-end journeys across Site Operations and Customer Operations. Verify context, preconditions, permissions, state, action, validation, mutation, feedback, recovery, invalidation, auditability and next action.

---

# Engineering log

### 2026-09-10 — Legacy entity-dialog removal
Commit `8c2862834e51f83be0d039119a1e10efb8e48e43` removed obsolete Project/Apartment shell dialogs. Dashboard create actions now route to canonical workspaces with create context.

### 2026-09-10 — CI RCA / shell preview isolation
Commit `d98065e89853c41ebad8d4b9783580678ccee5` restored only the bounded preview queries still required by Dashboard/Media after legacy workspace state removal. Canonical operational workspaces remain data owners.

### 2026-09-11 — Production DB alignment audit
Commit `111d94f3f797e3516399a86f3fb20d782bd35ed3` added `docs/ASAS_ADMIN_DATABASE_ALIGNMENT_AUDIT.md` after direct inspection of the live Supabase PostgreSQL schema.

Verified production facts: projects=6, buildings=3, apartments=8, leads=4, project_images=4, apartment_images=19, project_amenities=19, developers=1, audit_logs=68, media=0, videos=0 at inspection time. The production hierarchy and FK relationships are present.

Supabase reported RLS enabled without policies on several server-owned tables as INFO, plus `vector` in `public` and leaked-password protection disabled as WARN findings. No RLS redesign was applied blindly.

### 2026-09-11 — Status default alignment
Production data uses uppercase status values: Project `AVAILABLE/COMING_SOON/DRAFT`, Apartment `AVAILABLE`, Lead `NEW/VISIT`. The live PostgreSQL defaults were aligned safely with the Admin vocabulary:

- `projects.status` → `DRAFT`
- `apartments.status` → `AVAILABLE`
- `leads.status` → `NEW`

Migration applied successfully: `align_admin_status_defaults`. No existing rows were modified and no new status CHECK constraints were added; the complete supported transition matrix must be finalized first.

Commit `072c3f79cce2b056816c4422b9c5d9aea71ab62e` aligns the PostgreSQL Prisma schema defaults with the live database defaults.

### Current DB decision

The live PostgreSQL schema and `prisma/schema.postgres.prisma` are the Admin persistence contract. `src/lib/db.ts` already uses the generated PostgreSQL client. Future Admin data work must reconcile against these sources before UI assumptions or migrations are introduced.

## Current execution state

**Active wave:** STEP 2 — Project operational vertical slice / data-contract convergence

**Immediate gates:**
1. CI for the latest code/documentation HEAD.
2. Admin API ↔ PostgreSQL contract audit.
3. Status semantics audit.
4. Contextual entity navigation.

**Browser/runtime certification:** not verified in this execution context.
