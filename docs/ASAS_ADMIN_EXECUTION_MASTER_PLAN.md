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

**Execution rule:** When the user says `Continue`, first read this master plan and `docs/ASAS_ADMIN_STAGE_EXECUTION_PROMPTS.md`, execute only the first unclosed stage, run its gates, update both trackers, and stop at the next gate. Do not rely on conversation memory.

**Continuation checkpoint (2026-09-07):** Apartment completeness and publication-readiness evaluators are now explicit, evidence-based domain contracts. Media upload lifecycle has validating/submitting/success/recoverable-error with cancel/retry. Apartment server status/price invariants and deterministic retry are already hardened. Do not rebuild these foundations; continue by closing the remaining Apartment lifecycle actions and contextual navigation, then move to Project.

**Latest implementation HEAD:** `f15b4252199a0d377afa8f0a6051df665a5ed70c`
**CI checkpoint:** Run #618 was the implementation gate at the previous checkpoint; this documentation continuation is separate. Current continuation gate is tracked in `docs/ASAS_ADMIN_STAGE_PROMPTS.md` Stage 0.

**Latest execution:** Project → Buildings → Apartments contextual navigation is server-backed, and Apartment entity routes now open a detail view from the canonical `entityId`. The detail view surfaces project/building context, physical/commercial/publication data, media and FR/AR editorial content without inventing reservation data.

**Gate result:** Current baseline commit `861843c...` is CI-verified. Runtime and browser validation remain unverified.

**Latest execution:** Project completeness contract is now server-data-backed. The list endpoint exposes `buildingCount`; the workspace evaluates identity, structure, inventory, commercial, media and publication separately. Publication remains `unknown` because the list payload does not prove readiness.

**Current HEAD:** `bb5e2238195c81a621d8c8731d2bfef04b6fef06`
**Immediate gate:** GitHub Actions for current HEAD.

**Media lifecycle hardening:** the existing Admin media upload surface now uses the shared mutation vocabulary for validating/submitting/success/recoverable-error, retains the selected file on failure, exposes cancellation through the active XHR, and offers retry without discarding the failed upload input.

**Availability truth boundary:** Prisma production schema has no `Reservation` model. Therefore Apartment availability is currently represented only by the persisted `Apartment.status`. The Admin must not create or imply a real reservation from `RESERVED`. Server mutation paths now reject new transitions into `RESERVED`; legacy `RESERVED` records remain readable and can transition only through the existing supported status path. UI status choices are aligned with this capability boundary.

**Apartment server invariant hardening:** the canonical apartment PUT now enforces the same status transition rules as the dedicated status endpoint and rejects invalid numeric commercial/area values. `priceOnRequest` cannot be combined with an explicit price. This closes a server-side consistency gap where the generic PUT could previously bypass the operational transition model.

**Retry hardening:** Apartment mutation retry now reuses the exact failed patch rather than reconstructing a potentially stale publication operation. This keeps recovery deterministic for price, status, and publication mutations.

**CI incident:** Run #574 failed at Typecheck on the Apartment Detail JSX after the commercial/status mutation change. The failure was isolated to malformed closing JSX tags introduced in that change; no lint/build stage ran. Commit `8b74193e` repairs the JSX structure without changing the domain behavior. CI must re-run before further implementation.

**Apartment commercial/status slice:** price and status controls now validate client-side semantics, enforce the existing VIEWER restriction, use the shared mutation lifecycle, and persist through the existing audited PUT endpoint.

**Verified gate:** Run #566 for `564729c3` completed successfully with Prisma generation, baseline generation, Typecheck, Lint, and Build all successful.

**Apartment mutation slice:** publication now uses the shared mutation lifecycle and existing audited PUT endpoint. It updates detail state from the server response, invalidates the apartment list via the existing data-change event, and exposes retry on recoverable failure.

**CI failure investigated:** Run #550 failed at Typecheck only. Root cause was a missing `Home` import introduced by the Building → Apartments contextual action. Lint and Build were skipped because Typecheck is a fail-fast gate.

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

| 2026-09-07 | `0517049...` | Added evidence-based Apartment publication-readiness contract | CI pending |
| 2026-09-07 | `f15b425...` | Surfaced publication-readiness blockers in Apartment workspace | CI Run #618 in progress |

| Date | Commit | Change | Verification |
|---|---|---|---|
| 2026-09-07 | `2579c13...` | Align transition IDs with canonical action vocabulary | CI pending for later HEAD |
| 2026-09-07 | `8ed157f...` | Correct Lead transition registry syntax/outcome | CI pending for this HEAD |
| 2026-09-07 | `5c06bfc...` | Created execution master plan + persistent engineering log | File committed; current CI must be re-run |
| 2026-09-07 | `e39ccad...` | Added evidence-based Project completeness domain contract | CI pending |
| 2026-09-07 | `af1131e...` | Exposed Project building count from server and wired completeness into workspace | CI pending |
| 2026-09-07 | `5190abed...` | Integrated Project operational completeness into list readiness | CI pending |
| 2026-09-07 | `aad5d1ac...` | Exposed building context beside project apartment inventory | CI pending |
| 2026-09-07 | `14e8e168...` | Added server-backed `buildingId` filter to apartment inventory | CI pending |
| 2026-09-07 | `c8fa12b1...` | Persisted building context in Apartment workspace URL state | CI pending |
| 2026-09-07 | `283b2dab...` | Added Building → scoped Apartments navigation | CI pending |
| 2026-09-07 | `9d298381...` | Added Project → scoped Buildings navigation | CI pending |
| 2026-09-07 | `01425394...` | Fixed missing `Home` icon import caught by CI Typecheck | CI pending |
| 2026-09-07 | `3fc195e4...` | Added route-driven Apartment operational detail view | CI pending |
| 2026-09-07 | `9bb46b72...` | Corrected detail view to use existing ID-backed Apartment API route | CI pending |
| 2026-09-07 | `acd1f5c1...` | Added recoverable publication mutation to Apartment Detail using shared lifecycle | CI success — Run #566 |
| 2026-09-07 | `a4b3a205...` | Surfaced publication mutation errors and disabled publish action for VIEWER | CI pending |

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


## Persistent execution control

The stage-by-stage prompts are maintained in `docs/ASAS_ADMIN_STAGE_PROMPTS.md`. That file is the execution queue. `Continue` means execute the first non-COMPLETE stage, not a new plan. Every stage must update its status and this master log with exact commit/CI/runtime evidence before the next stage becomes ACTIVE.

**Documentation checkpoint:** `fec2321e771b6d34c00e302cf0aea09e817f59f2` added the persistent stage prompt queue. The attempt to update this master file in the same sequence initially used an invalid ref and returned GitHub 404; no false success is recorded. This update is being written against the actual branch ref and file SHA.


## 2026-09-08 execution checkpoint

Repository branch confirmed to exist: `feat/admin-ux-ui-foundation`. The last implementation commit `f15b4252199a0d377afa8f0a6051df665a5ed70c` has GitHub Actions CI Run #618 completed with conclusion `success`. This closes the implementation CI gate for that checkpoint. Documentation continuity was repaired by creating the authoritative queue `docs/ASAS_ADMIN_STAGE_EXECUTION_PROMPTS.md` at commit `8f999dfa65054cae60671ce1c041a77750226faf`. The prior `ASAS_ADMIN_STAGE_PROMPTS.md` path could not be reliably retrieved from the branch, so it is no longer treated as authoritative.

**Current execution stage:** STAGE 1 — Apartment lifecycle.


## 2026-09-08 Stage 1 checkpoint

`STAGE 0` implementation gate: commit `f15b4252199a0d377afa8f0a6051df665a5ed70c` has CI Run #618 = `success`.

`STAGE 1` Apartment lifecycle implementation is now complete at code level but **verification is pending**. Commits: `2ef639b857f9fb647d83852bf61c93769749405d` (publication readiness + status transition contract), `9ceffd2ec8061a7e97688a92a1dcfd4972c3f87d` (UI lifecycle guards), `cf9e4c1e0141103c126eb1a85ac0b45798c797f7` (server publication preconditions), `7229e2b53916504225d3b222046846d376b79bc8` (explicit publish/unpublish audit actions). Current PR #7 head at this checkpoint: `7229e2b53916504225d3b222046846d376b79bc8` before the documentation checkpoint. GitHub combined status currently reports Vercel `pending`; no green CI evidence exists yet for the Stage 1 implementation commits. Do not mark Stage 1 COMPLETE until the implementation head has green static/CI evidence.


## 2026-09-08 verification + logic review checkpoint

CI Run #654 for `57d0c09f05aca6f67acfc24d86bf5a33dd8cea9f` completed `success`; Typecheck, Lint and Build all completed successfully. During the Stage 1 logic review, duplicate Apartment status-transition/readiness rules were found between the API route and `admin-operational-units.ts`. Commit `cbc66fe85e436e380abe555f929cbf5d176a6ce5` converges the API onto the shared transition/readiness contract and adds the project prerequisite to publication blockers. This is a correctness/convergence fix, not visual polish. Current verification for the new commit remains pending until GitHub Actions runs and succeeds.


## 2026-09-08 Stage 2 logic review checkpoint

Stage 1 is verified by CI Run #660 = success on `247612bbe71a4d402e19340b87bfb6bd8fa1ffa8`. During Stage 2 review, a duplicate route mutation implementation was found in `AdminPage`: it constructed the canonical href itself and manually called `history.pushState` + synthetic `hashchange`, while `admin-route.ts` already owned navigation. Commit `496a6a24b4a6ea368737ed5f1109e158d825738a` hardened the canonical navigator against redundant route mutations. Commit `6245c8343ca3c17bf744a150f69e1b5a320578de` migrated `AdminPage` to `navigateAdminRoute`, removing that duplicate navigation authority. Verification of these new commits is pending CI.


## 2026-09-08 Stage 2 route correctness checkpoint

CI Run #668 for `1f2f1d849861bf37afd44a8862b91a45e9008a05` was still `in_progress` when reviewed. Static route review identified two correctness issues: path-based admin query parameters were not read from `window.location.search`, and no-op navigation compared a full URL representation against a hash-based canonical href, so equivalent routes could still trigger history mutations. Commit `eb020284846618e3975e163379d578191beda6cc` adds explicit `search` parsing and canonical hash/path no-op comparison. New commit verification is pending CI.


## 2026-09-10 execution checkpoint

`0f0db7d1b014d3f37580aa7ded393a737c4c0210` CI Run #672 completed successfully. Combined commit status reports Vercel = success. Stage 2 route fixes are therefore CI-verified. Next engineering focus remains contextual navigation and route/state convergence, followed by the Apartment operational vertical slice.

Verification boundary: Vercel deployment status is green, but no browser-session evidence is available in this execution context; visual/browser certification remains unclaimed.


## 2026-09-10 Stage 2 domain/UI consistency checkpoint

CI Run #672 for `0f0db7d1b014d3f37580aa7ded393a737c4c0210` completed successfully and Vercel status was success. Logic review then found another operational-model violation: `AdminPage` computed Apartment completeness locally from ad-hoc fields and included `published` in the percentage, while the authoritative contract requires components to consume shared deterministic readiness/completeness and publication is a separate operational state. Commit `0285f07b49e729796968c4c46ba29288b4e49a0d` strengthens shared identity completeness with Project context; commit `60221c3fd417643928761a7856cedbbafd75def8` replaces the local list score with `evaluateApartmentOperationalCompleteness()` and excludes publication from the completeness score. New checkpoint verification is pending CI.


## 2026-09-10 Apartment workspace consistency checkpoint

The shared completeness contract was already used by the API and AdminPage list, but `AdminApartmentsWorkspace` still computed a separate readiness signal set from apartment fields and publication state. Commit `a1f811cab59d9a44e1c0130066298fcff8a6bdcb` converges the workspace onto `evaluateApartmentOperationalCompleteness()`, keeping publication separate from completeness and eliminating another UI-level domain definition. Verification pending CI.


## 2026-09-10 CI failure + search request-storm fix

CI Run #699 for `6145948ad795976539680215868ab702fef379a9` failed at Typecheck before Lint/Build. The workspace review also identified a request-storm risk: Apartment search updated the URL on every keystroke while the API fetch is driven by debounced search. Commit `f2eb5de91bf13c5b7763771747c79ef2bcf15d9f` changes URL synchronization to the same 300ms debounce boundary and uses replace navigation, while retaining the existing AbortController for stale request cancellation. The failing CI root cause remains to be isolated from the Typecheck log before further stacking changes.
