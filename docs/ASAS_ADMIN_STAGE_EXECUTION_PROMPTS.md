# ASAS ADMIN — STAGE EXECUTION PROMPTS (AUTHORITATIVE)

This file is the persistent execution queue for the Admin engineering track on `feat/admin-ux-ui-foundation`.

**Continue protocol:** read this file + `docs/ASAS_ADMIN_EXECUTION_MASTER_PLAN.md`; execute the first non-COMPLETE stage; run gates; record evidence; then update both files. Never rely on chat memory.

## Global gates
- No reset, force push, history rewrite, main merge, destructive DB operation.
- No fabricated backend capability, availability, reservation, readiness, totals or permissions.
- Observe → isolate → model → smallest coherent implementation.
- Typecheck → lint → build → inspect diff → CI.
- Runtime/browser/deployment claims require evidence.
- Existing server-state/query architecture remains the owner; no new state library without evidence.

## STAGE 0 — Repository / CI gate
**Status: COMPLETE at last verified implementation checkpoint**
Prompt: Verify branch existence and the latest implementation commit. For implementation commit `f15b4252199a0d377afa8f0a6051df665a5ed70c`, verify GitHub Actions and record the exact result. Documentation-only commits do not substitute for implementation CI.
Exit: implementation CI green and evidence recorded.

## STAGE 1 — Apartment lifecycle
**Status: VERIFIED — CI GREEN**

Checkpoints: `7229e2b53916504225d3b222046846d376b79bc8` added server-side publication preconditions, UI guards, status transition filtering and explicit publication/unpublication audit actions. `cbc66fe85e436e380abe555f929cbf5d176a6ce5` converges API status/readiness rules onto the shared operational-unit contract, eliminating duplicate transition definitions and aligning publication blockers. CI verification: Run #660 on checkpoint `247612bbe71a4d402e19340b87bfb6bd8fa1ffa8` = success (Typecheck/Lint/Build).
Prompt: Inspect actual Apartment schema/API/routes and current transition registry. Implement only supported status-change, price-change, publish/unpublish/archive actions. Every executable action requires preconditions, permission, validation, shared mutation lifecycle, deterministic retry, server result and cache invalidation. Unsupported capabilities remain non-executable and are documented.
Exit: supported actions mapped; unsupported actions bounded; CI green.

## STAGE 2 — Apartment contextual navigation
**Status: ACTIVE**
Prompt: Audit canonical Project ↔ Building ↔ Apartment navigation and supported Lead/Interest/Reservation relationships. Review the existing route authority before adding navigation. The current AdminPage still has a rendering-local `activeTab` synchronized from the route and a separate local `navigateAdmin` implementation that directly manipulates history; converge these call sites onto `navigateAdminRoute` rather than creating another route contract. Preserve URL context and eliminate duplicated route authority/cross-workspace leakage.
Exit: canonical navigation + URL context; CI green.

## STAGE 3 — Project vertical slice
**Status: PENDING**
Prompt: Make Project the parent site-operations context. Implement evidence-backed completeness, Buildings, Apartments, inventory, pricing, media and publication. Server aggregates only.
Exit: coherent project operational context; CI green.

## STAGE 4 — Building vertical slice
**Status: PENDING**
Prompt: Implement Building context, project association, structure, apartments, inventory and supported lifecycle from actual APIs.
Exit: coherent building context; CI green.

## STAGE 5 — Lead customer vertical slice
**Status: PENDING**
Prompt: Inspect Lead schema/API and implement qualification, assignment, property interest, follow-up, negotiation and supported conversion/loss. Connect real Project/Apartment interest relationships.
Exit: coherent customer workflow; CI green.

## STAGE 6 — Reservation capability boundary
**Status: PENDING**
Prompt: Inspect actual Reservation capability. If unsupported, prevent fake confirmation UX. If supported, require server-confirmed availability and handle conflicts, duplicate submits, cancellation/expiry and auditability.
Exit: reservation capability explicitly classified; CI green.

## STAGE 7 — URL/state architecture
**Status: PENDING**
Prompt: Audit pathname/hash/local-tab/manual-history conflicts and duplicated route parsing. Maintain one validated AdminRouteModel and explicit separation of Server/URL/Workspace/UI/Form/Mutation/Session state.
Exit: one route authority; no leakage; CI green.

## STAGE 8 — Request lifecycle and scale
**Status: PENDING**
Prompt: Audit search/fetch effects. Add deliberate debounce/cancellation/stale-response prevention/duplicate-request prevention/bounded payloads/server pagination/filtering/query invalidation and retry where needed. Assess 10→100k scale.
Exit: controlled request lifecycle; CI green.

## STAGE 9 — Error/loading/empty taxonomy
**Status: PENDING**
Prompt: Distinguish validation/auth/authz/network/API/server/conflict/timeout/unknown errors; initial/background/mutation/pagination/search/upload loading; no-data/search/filter/permission/not-configured/loading/failed empty states.
Exit: ambiguous high-impact states corrected; CI green.

## STAGE 10 — Responsive contracts
**Status: PENDING**
Prompt: Define then implement workspace-specific Desktop/Tablet/Mobile behavior for 360/390/414/768/1024/1280+. Cover navigation, filters, tables/cards, editors, drawers/dialogs, sticky regions and overflow.
Exit: device matrix updated; CI green.

## STAGE 11 — WCAG 2.2 AA
**Status: PENDING**
Prompt: Audit/fix keyboard navigation, focus, dialogs/drawers, labels/errors/status announcements, semantic tables, current navigation and 44×44 targets.
Exit: critical accessibility paths corrected; evidence recorded.

## STAGE 12 — Performance
**Status: PENDING**
Prompt: Optimize only evidence-backed render/query/payload/list/aggregate bottlenecks. No speculative virtualization.
Exit: measured/evidence-backed fixes; CI green.

## STAGE 13 — Deployment/runtime
**Status: PENDING**
Prompt: Verify Vercel deployment, runtime errors/logs, hydration and console errors. If blocked by SSO, record `VISUAL VALIDATION BLOCKED — VERCEL SSO`.
Exit: deployment/runtime evidence or explicit blocker.

## STAGE 14 — Browser certification
**Status: PENDING**
Prompt: Test Chromium, WebKit, Edge and Firefox with the required viewport matrix using real browser tooling where available. Record pass/fail/block evidence.
Exit: browser × viewport evidence.

## STAGE 15 — Final operational acceptance
**Status: PENDING**
Prompt: Execute representative Site and Customer Operations journeys through context → preconditions → permission → state → action → validation → mutation → server result → feedback → recovery → invalidation → auditability → next action.
Exit: P0/P1 closed or explicitly blocked; acceptance evidence recorded.
