# ASAS ADMIN — EXECUTION MASTER PLAN & ENGINEERING LOG

> **Status:** ACTIVE — authoritative execution tracker
> **Branch:** `feat/admin-ux-ui-foundation`
> **PR:** #7
> **Repository:** `asas-erp-saas-1/Asas-website`
> **Latest execution HEAD:** `efaa6a5510e331daff32dba9812bcc7ba7e9bf7c`
> **Rule:** This file records the execution contract, evidence, decisions, and blockers so the long-running execution does not depend on conversation memory.

## Non-negotiable execution rules

1. Never reset, force-push, rewrite history, merge to main, delete valid commits, or perform destructive production DB changes.
2. Never claim tested/deployed/verified without evidence.
3. Treat PostgreSQL Prisma persistence and existing API capabilities as the source of truth.
4. No fabrication: unavailable data remains `unknown`; UI state never implies unsupported server state.
5. Preserve execution order: **Build integrity → Architecture convergence → Data correctness → Navigation/state → Responsive UX → Mutation/error/loading → Accessibility → Performance → Visual polish → Browser certification.**
6. Every implementation wave follows: **Observe → Inspect evidence → Model → Root cause → Contract → Smallest coherent change → Typecheck → Lint → Build → Diff inspection → CI → Deploy when applicable → Runtime verify → Record limitations.**
7. Do not introduce Redux/Zustand/virtualization/new backend architecture/new schema unless evidence proves necessity.
8. Every material implementation change gets a commit and an entry in this file.

## Professional AI-engineering workflow

Repository instructions and scoped Admin instructions are the durable execution contract. Each material task must inspect exact HEAD, relevant files, domain helpers, API routes, Prisma persistence, route model, workspaces and tests before implementation.

Contract tracing remains:
`UI → URL/state → API → auth → validation → domain transition → relational integrity → persistence → audit → cache/invalidation → feedback/recovery`.

## Current domain source-of-truth

Runtime Admin persistence is PostgreSQL through `prisma/schema.postgres.prisma` and `src/lib/db.ts`. Legacy SQLite Prisma schema is not the production Admin persistence contract.

Canonical operational relationship:
`Project → Building → Apartment → Availability → Lead Interest → Follow-up → Reservation → Contract → Payment`

Only relationships/capabilities represented by the current application/backend may be executable.

## Execution waves

### STEP 0 — Baseline / CI authority
Establish exact HEAD, CI state and build gates before risky waves.

### STEP 1 — Operational vocabulary convergence
One canonical action vocabulary shared by operational units, transitions, journeys and workspaces. **Implemented.**

### STEP 2 — Project operational vertical slice
Project as parent operational context. **Implemented; action-level permission presentation added.**

### STEP 3 — Building operational vertical slice
Building as child operational entity with explicit Project context. **Implemented; action-level permission presentation added.**

### STEP 4 — Apartment operational vertical slice
Complete the first high-value real-estate operational entity. **Permission convergence implemented; route-state regression hardening added.**

### STEP 5 — Customer / Lead vertical slice
Connect customer operations to real inventory without fabricating reservation state. **Lead mutation permission presentation implemented; deeper CRM capability coverage remains pending.**

### STEP 6 — Reservation boundary
Only implement server-confirmed reservation behavior when backend support exists.

### STEP 7 — Navigation and URL state certification
URL as authoritative recoverable navigation state. **Hash workspace/query parsing hardening implemented; cross-entity state synchronization audit is active.**

### STEP 8 — Server-state and request lifecycle
One clear owner for server state and controlled network behavior.

### STEP 9 — Error/loading/empty-state taxonomy
Operationally meaningful feedback and recovery.

### STEP 10 — Responsive behavior contracts
Behavior-first responsive implementation.

### STEP 11 — Accessibility WCAG 2.2 AA
Keyboard, focus, semantics and assistive-technology correctness.

### STEP 12 — Performance / scale
Correctness at 10–100,000 records.

### STEP 13 — Observability / deployment / runtime
Production evidence.

### STEP 14 — Browser certification
Required browser × viewport matrix.

### STEP 15 — Final operational acceptance
Prove Admin is an operational workspace, not a collection of CRUD screens.

## Engineering log

### 2026-09-12 — API and lifecycle hardening
Project, Building, Apartment and Lead API contracts were hardened across validation, authorization, persistence invariants, audit preservation and lifecycle transitions. Existing commits remain the source of truth; unsupported Reservation/Contract/Payment behavior was not invented.

### 2026-09-13 — Shared Admin role/capability context
`ea9c6f149c1fe57cfc4bd6f700e1c91e0e6944a8` introduced `AdminRoleProvider`, resolving the role from `/api/admin/me` and exposing `role`, `canMutate` and `canAdminister`. The shell displays a read-only notice while server authorization remains authoritative. `6e74a57c4bfe453a79943bc220a692c62755c599` refined capability-state UX.

### 2026-09-14 — Project action-level permission presentation
`176121a7cf8bf6c02c22d0dd13c65dfdc6bca317` applied shared `canMutate` to Project list publish/archive controls.
`9d3ce886e32db5ed6e713ac0a41f440778d85a37` applied it to Project detail price/publication mutations.
`e31e23547b1f043bd3a071398992fe10a5845c0e` applied it to Project creation.

### 2026-09-14 — Building action-level permission presentation
`a53ad50cdd00f8a3f5f51d6df3aa799374e363d3` applied shared `AdminRoleProvider.canMutate` to Building list/create and detail/edit. Read-only users retain operational navigation and context; mutation controls/fields are disabled and handlers re-check capability.

### 2026-09-14 — Apartment permission-state audit
Inspection confirmed that Apartment already had action-level presentation: publication restricted to ADMIN/EDITOR, archive to ADMIN, and detail price/status/publication controls disabled for VIEWER. Existing publication-readiness checks and mutation lifecycle were preserved.

### 2026-09-14 — Apartment capability convergence
`ef93b4c14f0b76d240de0318d1eb8d9683876079` made `AdminApartmentsWorkspace` consume the shared role context. `canMutate` and `canAdminister` drive presentation and are re-checked at mutation-handler level. Existing API endpoints, publication readiness, lifecycle transitions and server authorization were preserved.

### 2026-09-14 — Lead action-level permission presentation
`ef93b4c14f0b76d240de0318d1eb8d9683876079` made `AdminLeadsPremiumWorkspace` consume the shared role context. Lead status changes and internal note creation are treated as mutations and are disabled for `VIEWER`, with handler-level capability checks as defense in depth. Lead project/apartment navigation, contact links, filtering and operational context remain available read-only. `assignedTo` and `followUpDate` are currently displayed fields, not writable capabilities in this workspace; no unsupported assignment/follow-up API was invented.

### 2026-09-14 — Admin URL parser contract hardening
`1e833a68bccf7155ff106615ae152d103c6ee79c` fixed a concrete hash-route parsing defect. For URLs shaped like `#/admin/<workspace>?…`, the workspace parser previously captured the query string as part of the workspace token, causing valid filtered/deep-linked workspace URLs to normalize to `dashboard`. The parser now separates the hash path from its query before workspace normalization. No navigation format or server API contract was changed.

### 2026-09-14 — Execution state synchronization
`11e604c3875e53365a5ad42c1b716423de0808db` synchronized the durable UX and execution logs with the actual branch state and recorded the navigation hardening evidence.

### 2026-09-14 — Exact-head verification and UX-state synchronization
`fced3b9f981f988548ed9527e2765e6aebf955bf` is the exact application HEAD inspected for the current gate. Vercel reports **success** for that exact commit. The current UX state document was then synchronized in `efaa6a5510e331daff32dba9812bcc7ba7e9bf7c` so the durable log no longer points at stale implementation commits.

### 2026-09-14 — Cross-entity route-state audit
The route model was inspected together with Project and Building workspace navigation. `navigateAdminRoute` clears previous workspace filters/pagination/cursor/subview/entity context when changing workspaces and preserves same-workspace state unless explicitly replaced. Project → Building navigation uses a building workspace `projectId` filter; entity detail routes use explicit `entity`/`entityId`. No new navigation architecture was introduced. A deeper workspace-local synchronization audit remains required before STEP 7 can be closed.

## CI / deployment evidence

- Current application HEAD before documentation synchronization: `fced3b9f981f988548ed9527e2765e6aebf955bf` — Vercel **success**.
- No GitHub Actions CI pass is claimed for the current application HEAD because the available combined status reported only the Vercel check.
- Documentation synchronization commit: `efaa6a5510e331daff32dba9812bcc7ba7e9bf7c`.
- No browser visual certification is claimed.

## Current execution state

**Latest documented HEAD:** `efaa6a5510e331daff32dba9812bcc7ba7e9bf7c`

**Active wave:** STEP 7 — Navigation/state certification, with workspace-local synchronization and then mutation/error/loading consistency next.

**Completed in this gate:** Project, Building and Apartment action-level permission presentation/convergence; Lead status and internal-note mutation presentation/convergence; concrete hash workspace/query parsing hardening; exact-head Vercel verification; durable UX-state synchronization.

**Important capability boundary:** Lead `assignedTo` and `followUpDate` are currently read-only fields in the inspected workspace. There is no verified writable assignment/follow-up capability in the current implementation, so it remains out of mutation scope until server support is evidenced.

**Immediate next gate:** Continue exact source inspection of Building/Apartments/Leads route synchronization, then audit mutation/error/loading consistency including retry/abort behavior. Only implement a code change when a concrete defect is established.

**Browser/runtime certification:** `VISUAL VALIDATION BLOCKED — browser automation is not available in this execution context.`