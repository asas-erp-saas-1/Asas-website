# ASAS ADMIN — STAGE PROMPTS

> Persistent execution prompts for the long-running Admin engineering track.
> Branch: `feat/admin-ux-ui-foundation`
> Rule: When the user says **Continue**, read this file and execute the first stage whose status is not COMPLETE. Do not skip gates. Update the master execution log and this file after every completed stage.

## Global execution contract

For every stage:
1. Read the master execution plan and relevant source files before editing.
2. Observe → Isolate → Model → implement the smallest coherent change.
3. Never fabricate backend capabilities, business state, readiness, availability, reservations, totals, or permissions.
4. Preserve existing functionality; no reset/force-push/history rewrite/main merge/destructive DB changes.
5. Run Typecheck, Lint and Build after each coherent implementation cluster.
6. Inspect the diff and GitHub Actions before declaring success.
7. Record exact SHA, CI evidence, runtime/browser evidence or blocker.
8. If a gate fails: stop, isolate root cause, fix, re-run; do not stack unrelated work.
9. Keep server state owned by the existing React Query architecture.
10. Do not add Redux/Zustand/virtualization/new schema/backend architecture without evidence.

---

## STAGE 0 — CI gate for current HEAD
**Status:** ACTIVE

### Prompt
> Inspect the current branch HEAD and its GitHub Actions run. Verify Typecheck, Lint and Build. If failed, isolate the exact root cause and make the smallest corrective commit. Re-run CI and inspect the result. Do not claim success while queued/in-progress. Only after green CI proceed to the next stage.

### Exit criteria
- Exact HEAD recorded
- CI green
- Typecheck green
- Lint green
- Build green

---

## STAGE 1 — Close Apartment lifecycle
**Status:** PENDING

### Prompt
> Inspect the actual Apartment API/schema and current transition registry. Complete only lifecycle actions genuinely supported by the backend: status-change, price-change, publish/unpublish, archive or other existing supported actions. Ensure every action has precondition, permission, validation, shared mutation lifecycle, deterministic retry, server result, cache invalidation and useful recovery. Do not invent archive/unpublish endpoints. If unsupported, explicitly mark it unsupported and leave the UI non-executable.

### Exit criteria
- Supported lifecycle actions mapped
- Unsupported actions explicitly bounded
- No UI-only business state
- CI green

---

## STAGE 2 — Apartment contextual navigation
**Status:** PENDING

### Prompt
> Audit Apartment Detail navigation and URL state. Implement Project → Apartment, Building → Apartment, Apartment → Project, Apartment → Building and supported Leads/Interest/Reservation links only where backend relationships exist. Preserve meaningful search/filter/entity context. Eliminate duplicated route authority. Verify static/runtime behavior available to the environment.

### Exit criteria
- Canonical URL context
- Parent/child navigation coherent
- No duplicated route parser introduced
- CI green

---

## STAGE 3 — Project vertical slice completion
**Status:** PENDING

### Prompt
> Complete Project as the parent site-operations context. Inspect schema/API first. Implement completeness, Buildings, Apartments, inventory, pricing, media and publication only from authoritative capabilities. Aggregates must not come from paginated lists. Child actions inherit explicit project context. Publication readiness must remain unknown when evidence is insufficient.

### Exit criteria
- Project detail operational context
- Building/apartment navigation
- Server-backed inventory boundaries
- Pricing/media/publication contracts
- CI green

---

## STAGE 4 — Building vertical slice completion
**Status:** PENDING

### Prompt
> Implement Building as a contextual child of Project. Verify Project association, structure, apartment inventory and supported lifecycle. Orphan relationships are integrity problems, not generic empty states. Preserve parent URL context.

### Exit criteria
- Project context
- Structure
- Apartments
- Inventory status
- Supported lifecycle only
- CI green

---

## STAGE 5 — Lead customer vertical slice
**Status:** PENDING

### Prompt
> Inspect Lead schema/API and current workspace. Implement qualification, assignment, property interest, follow-up, negotiation and conversion/loss only where backend-supported. Connect interest to Project/Apartment relationships when persisted. Reservation UI must never imply confirmation without server support.

### Exit criteria
- Lead operational context
- Qualification/assignment
- Interest
- Follow-up
- Negotiation
- Supported conversion/loss
- CI green

---

## STAGE 6 — Reservation capability boundary
**Status:** PENDING

### Prompt
> Inspect the actual schema and APIs for Reservation. If no Reservation model/capability exists, document that fact and prevent fake reservation confirmation UX. If supported, implement server-confirmed availability precondition, conflict handling, duplicate-submit protection, cancellation/expiry semantics and auditability.

### Exit criteria
- Reservation capability explicitly classified
- No fabricated reservation state
- Server confirmation if supported
- CI green

---

## STAGE 7 — URL/state architecture certification
**Status:** PENDING

### Prompt
> Audit all Admin workspaces for URL/local-state conflicts, hash parsing, pushState/manual history, activeTab authority, stale cross-workspace context and duplicated route parsing. Establish one validated AdminRouteModel as navigation authority. Separate Server State, URL State, Workspace State, UI State, Form State, Mutation State and Session State.

### Exit criteria
- One route authority
- No cross-workspace leakage
- Refresh/back/forward/deep-link contracts
- CI green

---

## STAGE 8 — Request lifecycle and scale
**Status:** PENDING

### Prompt
> Audit all Admin fetch/search effects. Implement deliberate debounce, AbortController where appropriate, stale-response prevention, duplicate-request prevention, bounded payloads, server pagination/filtering and React Query invalidation/retry. Evaluate 10/100/1k/10k/100k record behavior conceptually against actual API/schema. Do not add virtualization without profiling.

### Exit criteria
- Controlled search requests
- Pagination/filtering correctness
- Aggregate boundaries
- CI green

---

## STAGE 9 — Error/loading/empty taxonomy
**Status:** PENDING

### Prompt
> Audit major Admin operations and replace ambiguous generic feedback where needed. Distinguish validation, auth, authorization, network, API, server, conflict, timeout and unknown failures. Distinguish initial/background/mutation/pagination/search/upload loading. Distinguish no-data/search/filter/permission/not-configured/loading/failed empty states.

### Exit criteria
- Taxonomy mapped
- High-impact ambiguous states fixed
- CI green

---

## STAGE 10 — Responsive behavior contracts
**Status:** PENDING

### Prompt
> Define behavior contracts before broad CSS changes for Project, Building, Apartment and Lead at 360/390/414/768/1024/1280+. Specify navigation, toolbar, filters, table/card strategy, detail/editor, dialogs/drawers, sticky areas and overflow. Implement the smallest coherent responsive changes. Do not claim browser verification without browser evidence.

### Exit criteria
- Device matrix updated
- Mobile operational subset
- Tablet adaptive behavior
- Desktop bounded density
- CI green

---

## STAGE 11 — Accessibility WCAG 2.2 AA
**Status:** PENDING

### Prompt
> Audit keyboard navigation, focus visibility/entry/restoration, dialogs/drawers, labels/errors/status announcements, semantic tables, current navigation state and 44×44 targets. Fix P0/P1 accessibility defects first.

### Exit criteria
- Critical accessibility paths corrected
- CI green
- Browser evidence or explicit block recorded

---

## STAGE 12 — Performance
**Status:** PENDING

### Prompt
> Audit render frequency, query duplication, payload sizes, list endpoints, aggregate contracts and expensive selectors. Optimize only evidence-backed bottlenecks. Keep business totals server-derived and pagination bounded.

### Exit criteria
- Evidence-backed performance fixes
- No speculative virtualization
- CI green

---

## STAGE 13 — Deployment/runtime observability
**Status:** PENDING

### Prompt
> Inspect Vercel deployment, runtime logs/errors, hydration errors and console errors for the current verified build. If Vercel SSO blocks visual access, record exactly: `VISUAL VALIDATION BLOCKED — VERCEL SSO`. Never substitute source inspection for runtime evidence.

### Exit criteria
- Deployment state recorded
- Runtime evidence recorded
- Blockers explicit

---

## STAGE 14 — Browser certification
**Status:** PENDING

### Prompt
> Use real browser tooling where available. Test Chrome/Chromium, Safari/WebKit, Edge and Firefox across the required viewport matrix. Record workspace-level pass/fail/block evidence. Do not call untested browsers compatible.

### Exit criteria
- Browser × viewport evidence
- Failures fixed or explicitly blocked

---

## STAGE 15 — Final operational acceptance
**Status:** PENDING

### Prompt
> Execute representative Site Operations and Customer Operations journeys. Verify context → preconditions → permission → state → action → validation → mutation → server result → feedback → recovery → invalidation → auditability → next action. Confirm Project → Building → Apartment and Lead → Interest → Reservation are coherent and server-backed.

### Exit criteria
- End-to-end operational acceptance
- All known P0/P1 issues closed or explicitly blocked
- Evidence recorded in master log
