# ASAS ADMIN — EXECUTION MASTER PLAN & ENGINEERING LOG

> **Status:** ACTIVE — authoritative execution tracker
> **Branch:** `feat/admin-ux-ui-foundation`
> **PR:** #7
> **Repository:** `asas-erp-saas-1/Asas-website`
> **Last reviewed HEAD:** `8ed157f051204454fcd694922f6c9220cdeefebb`
> **Rule:** This file records the execution contract, prompt for each step, evidence, decisions, and blockers. It is updated as part of the engineering work so the long-running execution does not depend on conversation memory.

## Non-negotiable execution rules

1. Never reset, force-push, rewrite history, merge to main, delete valid commits, or perform destructive production DB changes.
2. Never claim tested/deployed/verified without evidence.
3. Treat `prisma/schema.prisma` and existing API capabilities as the source of truth for data support.
4. No fabrication: unavailable data remains `unknown`; UI state never implies a server-confirmed business state.
5. Preserve the established execution order:
   **Build integrity → Architecture convergence → Data correctness → Navigation/state → Responsive UX → Mutation/error/loading → Accessibility → Performance → Visual polish → Browser certification.**
6. Every implementation wave follows:
   **Observe → Isolate → Model → Smallest coherent change → Typecheck → Lint → Build → Diff inspection → CI → Deploy → Runtime verify.**
7. Do not introduce Redux/Zustand/virtualization/new backend architecture/new schema unless evidence proves necessity.
8. Every material implementation change gets a commit and an entry in this file.

## Current domain source-of-truth

The current Prisma schema is SQLite and contains Project, Building and Apartment persistence with explicit fields for publication, status, commercial data, media relationships and hierarchy. The application currently uses React Query for server-state ownership and shared Admin mutation semantics.

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

**Status:** CI evidence exists for `6cb7d2a...`; subsequent commits require fresh CI evidence.

---

## STEP 1 — Operational vocabulary convergence
**Goal:** one canonical action vocabulary shared by operational units, transitions, journeys and workspaces.

**Prompt:**
> Read `src/lib/admin-operational-units.ts`, operational workflow docs, and all transition definitions. Compare every action ID against the canonical operational unit vocabulary. Detect aliases, spelling drift, duplicate outcomes, invalid syntax, and actions that imply unsupported backend capabilities. Correct only the smallest coherent set. Do not invent capabilities. Add/update tests or deterministic validation where practical.

**Implementation:** canonical action registry documented; transition IDs aligned; Lead transition syntax/outcome corrected.

**Commits:** `2579c13...`, `8ed157f...`

**Status:** Implemented; latest commit awaiting fresh CI.

---

## STEP 2 — Project operational vertical slice
**Goal:** make Project the parent operational context rather than an isolated CRUD editor.

**Prompt:**
> Inspect Project list/detail/editor, Prisma Project/Building/Apartment models, API routes, route model, React Query ownership and current workspace navigation. Implement the smallest coherent Project vertical slice: Project list → Project detail/editor → completeness contract → Buildings → Apartments → inventory context. Preserve existing features. Do not derive totals from paginated slices. Do not invent publication readiness. Child creation must inherit explicit project context and preserve URL context.

### Substeps
- 2.1 Project detail/context contract
- 2.2 Project completeness based on authoritative available sections
- 2.3 Project → Buildings contextual navigation
- 2.4 Project → Apartments contextual navigation
- 2.5 Inventory aggregate/data boundary
- 2.6 Project pricing contract
- 2.7 Project media contract
- 2.8 Project publication contract

**Gate:** CI after each coherent mutation cluster; no visual polish until P0/P1 correctness remains clean.

**Status:** In progress.

**Gate result:** Current baseline commit `861843c...` is CI-verified. Runtime and browser validation remain unverified.

**Latest execution:** Project completeness contract is now server-data-backed. The list endpoint exposes `buildingCount`; the workspace evaluates identity, structure, inventory, commercial, media and publication separately. Publication remains `unknown` because the list payload does not prove readiness.

**Current HEAD:** `5190abedbf021bab286b6b6f922b3e233f07855b`
**Immediate gate:** GitHub Actions for current HEAD.

**CI evidence:** Run #525 (`34070619360`) completed successfully. Job `Lint + Typecheck + Build` passed: dependency install, Prisma client generation, Prisma baseline generation/verification, Typecheck, Lint and Build.

---

## STEP 3 — Building operational vertical slice
**Goal:** Building is a child operational entity with explicit Project context.

**Prompt:**
> Inspect Building schema, API capabilities and current workspace. Implement Building list/detail/context only where supported. Enforce Project association as an operational precondition. Expose structural data, apartments and inventory status from authoritative server data. Treat an orphan Building as an integrity problem, not an empty state. Preserve parent URL context.

### Substeps
- 3.1 Building route/context
- 3.2 Project breadcrumb/context
- 3.3 Building → Apartments
- 3.4 Building structure contract
- 3.5 inventory status contract
- 3.6 archive only if server-supported

---

## STEP 4 — Apartment operational vertical slice
**Goal:** complete the first high-value real-estate operational entity.

**Prompt:**
> Inspect Apartment schema, API routes, editor, media capabilities, Project/Building relationships and availability representation. Implement incrementally: List → Detail → Project/Building context → Physical Specs → Commercial Data → Availability → Media → Completeness → Publication → Lifecycle. Every section must distinguish persisted data from unknown data. Reservation state must never be inferred from UI state.

### Substeps
- 4.1 canonical Apartment context
- 4.2 physical-spec contract
- 4.3 commercial contract
- 4.4 availability/status contract
- 4.5 media lifecycle
- 4.6 completeness
- 4.7 publication
- 4.8 lifecycle/status/price mutations

---

## STEP 5 — Customer / Lead vertical slice
**Goal:** connect customer operations to real inventory without fabricating reservation state.

**Prompt:**
> Inspect Lead schema, APIs, current workspace, property-interest representation and reservation support. Implement Lead → Qualification → Assignment → Property Interest → Follow-up → Negotiation → Reservation → Conversion/Loss only for capabilities supported by the backend. Reservation requires server-confirmed availability. UI optimistic state must never be treated as reservation confirmation.

---

## STEP 6 — Reservation boundary
**Goal:** make reservation a server-confirmed business event where supported.

**Prompt:**
> Inspect the actual Reservation model/API. If no executable reservation capability exists, document it as unsupported/future and do not build fake confirmation UI. If supported, define preconditions, availability conflict handling, idempotency/duplicate-submit protection, server confirmation, cancellation/expiry semantics and auditability.

---

## STEP 7 — Navigation and URL state certification
**Goal:** URL is the authoritative recoverable navigation state.

**Prompt:**
> Audit every Admin workspace for duplicated route parsing, local activeTab authority, hash/path conflicts, manual history mutation and state leakage. Define one AdminRouteModel and ensure workspace/entity/id/search/filter/sort/pagination/subview are URL-addressable where meaningful. Verify refresh/back/forward/deep-link behavior statically and with available runtime tooling.

---

## STEP 8 — Server-state and request lifecycle
**Goal:** one clear owner for server state and controlled network behavior.

**Prompt:**
> Audit React Query usage and all Admin fetch/search effects. Implement AbortController where appropriate, deliberate search debounce, stale-response protection, duplicate-request prevention, pagination, bounded payloads, cache invalidation and retry semantics. Do not introduce another state library.

---

## STEP 9 — Error/loading/empty-state taxonomy
**Goal:** operationally meaningful feedback.

**Prompt:**
> Audit all major Admin operations and map failures to validation/authentication/authorization/network/API/server/conflict/timeout/unknown. Map loading states to initial/background/mutation/pagination/search/upload. Map empty states to no-data/no-search/no-filter/no-permission/not-configured/loading/failed. Replace generic feedback only where evidence shows ambiguity.

---

## STEP 10 — Responsive behavior contracts
**Goal:** behavior-first responsive implementation, not desktop shrinkage.

**Prompt:**
> For Projects, Buildings, Apartments and Leads define Desktop/Tablet/Mobile behavior before changing broad CSS. Explicitly specify navigation, toolbar, filters, table/card strategy, detail view, editor, dialogs/drawers, sticky regions and overflow. Use 360×800 as hard mobile constraint and the established tablet/desktop matrix. Implement only after contracts are recorded.

---

## STEP 11 — Accessibility WCAG 2.2 AA
**Goal:** keyboard and assistive technology correctness.

**Prompt:**
> Audit navigation, tables, forms, dialogs, drawers, focus entry/restoration, visible focus, labels, errors, status announcements, semantic tables, current navigation state and 44×44 operational targets. Fix P0/P1 accessibility defects before visual polish.

---

## STEP 12 — Performance / scale
**Goal:** conceptual correctness at 10–100,000 records.

**Prompt:**
> Audit list endpoints, selectors, aggregates, search, pagination and payload sizes. Ensure totals come from server aggregates, not paginated lists. Define indexed search requirements based on the actual schema. Do not add virtualization without profiling evidence.

---

## STEP 13 — Observability / deployment / runtime
**Goal:** production evidence.

**Prompt:**
> For each implementation wave inspect GitHub Actions, Vercel deployment state, runtime logs/errors, hydration errors and available browser/preview evidence. If SSO blocks visual testing, record exactly: VISUAL VALIDATION BLOCKED — VERCEL SSO. Never claim browser validation without evidence.

---

## STEP 14 — Browser certification
**Goal:** certify the required browser × viewport matrix.

**Prompt:**
> Use real browser/preview tooling where available. Test Chrome/Chromium, Safari/WebKit, Edge and Firefox across the required viewport matrix. Record pass/fail/block evidence per workspace. Do not summarize a blocked test as passed.

---

## STEP 15 — Final operational acceptance
**Goal:** prove the Admin is an operational workspace, not a collection of CRUD screens.

**Prompt:**
> Execute representative end-to-end journeys across Site Operations and Customer Operations. Verify context, preconditions, permissions, state, action, validation, mutation, feedback, recovery, invalidation, auditability and next action. Confirm Project→Building→Apartment and Lead→Interest→Reservation relationships are coherent and server-backed.

---

# Change log

| Date | Commit | Change | Verification |
|---|---|---|---|
| 2026-09-07 | `2579c13...` | Align transition IDs with canonical action vocabulary | CI pending for later HEAD |
| 2026-09-07 | `8ed157f...` | Correct Lead transition registry syntax/outcome | CI pending for this HEAD |
| 2026-09-07 | `5c06bfc...` | Created execution master plan + persistent engineering log | File committed; current CI must be re-run |
| 2026-09-07 | `e39ccad...` | Added evidence-based Project completeness domain contract | CI pending |
| 2026-09-07 | `af1131e...` | Exposed Project building count from server and wired completeness into workspace | CI pending |
| 2026-09-07 | `5190abed...` | Integrated Project operational completeness into list readiness | CI pending |

# Evidence discipline

For every future entry record:
- exact commit SHA
- exact files changed
- reason
- implementation result
- CI run URL/ID when available
- Typecheck/Lint/Build result
- Vercel status if inspected
- runtime/browser status
- blocker if any
- next action

# Current execution state

**Active wave:** STEP 2 — Project operational vertical slice  
**Immediate gate:** CI for `8ed157f...`  
**Do not proceed to broad responsive/visual work until operational/data correctness gates are satisfied.**
