# ASAS ADMIN — EXECUTION MASTER PLAN & ENGINEERING LOG

> **Status:** ACTIVE — authoritative execution tracker
> **Branch:** `feat/admin-ux-ui-foundation`
> **PR:** #7
> **Repository:** `asas-erp-saas-1/Asas-website`
> **Latest execution HEAD:** `00d1a071eaf08b976c6f8fdcf55f58e4df0f46b9`
> **Rule:** This file records the execution contract, prompt system, evidence, decisions, and blockers so the long-running execution does not depend on conversation memory.

## Non-negotiable execution rules

1. Never reset, force-push, rewrite history, merge to main, delete valid commits, or perform destructive production DB changes.
2. Never claim tested/deployed/verified without evidence.
3. Treat the production PostgreSQL Prisma schema and existing API capabilities as the source of truth for data support.
4. No fabrication: unavailable data remains `unknown`; UI state never implies a server-confirmed business state.
5. Preserve the execution order: **Build integrity → Architecture convergence → Data correctness → Navigation/state → Responsive UX → Mutation/error/loading → Accessibility → Performance → Visual polish → Browser certification.**
6. Every implementation wave follows: **Observe → Inspect evidence → Model → Root cause → Contract → Smallest coherent change → Typecheck → Lint → Build → Diff inspection → CI → Deploy when applicable → Runtime verify → Record limitations.**
7. Do not introduce Redux/Zustand/virtualization/new backend architecture/new schema unless evidence proves necessity.
8. Every material implementation change gets a commit and an entry in this file.

## Professional AI-engineering workflow adopted

External engineering research confirms that high-quality coding-agent workflows improve when prompts contain: a clear task, relevant repository/file context, explicit acceptance criteria, a stopping condition, and iterative validation. GitHub specifically recommends repository-wide instructions, path-specific instructions, and `AGENTS.md`/agent instructions so agents receive durable architecture and workflow context. It also recommends breaking complex work into smaller verifiable tasks and validating agent output rather than trusting generation blindly.

Sources reviewed:
- GitHub Docs — Prompt engineering for GitHub Copilot: specificity, relevant code context, decomposition, iteration and good coding practices.
- GitHub Docs — Optimize AI usage: clear task definition, relevant context, explicit stopping conditions, lean context and grounded repository instructions.
- GitHub Docs — Copilot code review/custom instructions: `.github/copilot-instructions.md`, path-specific instructions and `AGENTS.md` as complementary instruction layers.
- GitHub Docs — Cloud agent best practices: clear task, acceptance criteria, relevant files, build/test/validation instructions and repository context.

ASAS now applies this as a permanent operating system rather than relying on chat history alone.

### Repository instruction layers
- `AGENTS.md` — broad ASAS Admin engineering standard and operational architecture.
- `.github/copilot-instructions.md` — repository-wide AI engineering rules.
- `.github/instructions/admin.instructions.md` — path-specific Admin rules for APIs, Admin workspaces, Admin domain helpers and execution docs.
- `.github/prompts/asas-admin-execution.prompt.md` — reusable principal-engineering execution prompt with reconnaissance, contract audit, implementation, verification and documentation gates.

These files are intentionally concise and evidence-grounded. They are not a generic mega-prompt; they encode ASAS-specific architecture, known failure modes, verification discipline and definition of done.

## Canonical ASAS execution prompt

For every future material Admin task, use this sequence:

### 1. Reconnaissance
Read repository/agent instructions and the authoritative execution plan. Inspect exact HEAD, relevant changed files, domain helpers, API routes, Prisma PostgreSQL schema, route model, workspace components and tests. Search before creating abstractions.

### 2. Contract audit
Trace **UI → URL/state → API → auth → validation → domain transition → relational integrity → persistence → audit → cache/invalidation → feedback/recovery**. Identify root cause, unsupported assumptions, lifecycle mismatch, permission gap, race condition and data-contract gap.

### 3. Model
Define the expected operational contract and acceptance criteria before changing code. Reuse canonical action IDs, transition graphs, route models and mutation lifecycle helpers.

### 4. Implement
Make the smallest coherent production-quality change. Never fabricate persistence or unsupported Reservation/Contract/Payment behavior.

### 5. Verify
Obtain evidence for typecheck, lint, build, relevant tests, diff inspection and CI on the exact resulting HEAD. Obtain deployment/browser/runtime evidence only when actually available.

### 6. Document
Update this plan with commit SHA, observed problem, root cause, implementation, evidence, limitations and next gate.

### 7. Stop condition
Stop at the end of the coherent slice. Do not expand into unrelated refactors merely because adjacent improvements are visible.

## Current domain source-of-truth

Runtime Admin persistence is PostgreSQL through `prisma/schema.postgres.prisma` and `src/lib/db.ts`. Legacy SQLite Prisma schema is not the production Admin persistence contract.

Canonical operational relationship:
`Project → Building → Apartment → Availability → Lead Interest → Follow-up → Reservation → Contract → Payment`

Only relationships/capabilities actually represented by the current application/backend may be executable.

## Execution waves

### STEP 0 — Baseline / CI authority
Establish exact HEAD, CI state and build gates before risky waves.

### STEP 1 — Operational vocabulary convergence
One canonical action vocabulary shared by operational units, transitions, journeys and workspaces. **Implemented.**

### STEP 2 — Project operational vertical slice
Project as parent operational context rather than isolated CRUD. **In progress.**

### STEP 3 — Building operational vertical slice
Building as child operational entity with explicit Project context.

### STEP 4 — Apartment operational vertical slice
Complete the first high-value real-estate operational entity.

### STEP 5 — Customer / Lead vertical slice
Connect customer operations to real inventory without fabricating reservation state. **In progress.**

### STEP 6 — Reservation boundary
Only implement server-confirmed reservation behavior when backend support exists.

### STEP 7 — Navigation and URL state certification
URL as authoritative recoverable navigation state.

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

### 2026-09-12 — Project mutation authorization hardening
`f1f1c102c0928dc4b69953d2181b7b977c61a4b7` added ADMIN/EDITOR authorization to `PUT /api/admin/projects/[slug]`.

### 2026-09-12 — Building API contract hardening
`860a1a316e3dc69cf5059dab1d37853932841a4e` added Zod query validation, bounded pagination, Project existence validation, positive floors validation, authorization and audit preservation.

### 2026-09-12 — Apartment API contract hardening
`7f914a99109f404758f050e6be500c2a18f1d115` added create validation, Project/Building integrity checks, bounded statuses, unpublished-by-default creation and pricing invariant protection.

### 2026-09-12 — Lead mutation and lifecycle hardening
`e7e4aa6dae5cf3963068e4e7977d8af5951ad608`, `502ed38cb64a3c1216807a03ae683d47e0b88318`, `6860501a58cffeffe55358656584da76567f7da1`, and `60c5cea830308fc482d79541eafcd684ba5a1247` hardened validation and centralized the Lead lifecycle graph for API/domain/UI reuse.

### 2026-09-12 — Prisma JSON contract fix
`b96a53f71d5a42dd57b71d3c05b09385dfc80f5c` corrected PostgreSQL JSON create typing using Prisma JSON-null/value types after CI Typecheck failure #863.

### 2026-09-12 — Lead workspace contract correction
`229bedf43aef5ba8b285a8b34e224464b9b83850` made Lead status selectors consume the shared transition graph and added contextual Project/Apartment navigation only when persisted IDs exist.

### 2026-09-12 — Project detail mutation contract hardening
`eff19fcc1e300bb466e3559c154a57fa6675928e` added strict update validation, unknown-field rejection, archive/publication guardrails, surface-range and pricing invariants, and distinct publication/price audit actions.

### 2026-09-12 — Project creation contract hardening
`025d3bab200450346866bb3f6c03367c2411ac10` added strict creation validation, slug/identity/location checks, numeric/range validation, pricing invariants, safe defaults and audit-preserving persistence.

### 2026-09-12 — Professional AI operating system added
`fb51a57a37ce1e56b5f65705a621cd2410795d22` added repository-wide `.github/copilot-instructions.md`.
`4f4a41d11b6b5ebb93cd095f1004bf2059a02154` added path-specific Admin instructions.
`00d1a071eaf08b976c6f8fdcf55f58e4df0f46b9` added the reusable `.github/prompts/asas-admin-execution.prompt.md`.

## CI evidence

The CI run observed for project creation commit `025d3bab...` was run `#889` but was cancelled before setup completed because the branch advanced. Therefore it is **not green evidence** for the current state. The next exact-HEAD CI result is the authoritative gate.

## Current execution state

**Latest HEAD:** `00d1a071eaf08b976c6f8fdcf55f58e4df0f46b9`

**Active wave:** STEP 2 — Project operational vertical slice / data-contract convergence

**Immediate gates:**
1. Fresh CI for the latest HEAD after instruction/documentation commits.
2. Project editor UI payload alignment against the hardened API contract.
3. Final Building/Apartment vertical-slice closure.
4. Lead UI regression/contract review.
5. Status/publication semantics audit.
6. Navigation and URL state certification after operational slices stabilize.

**Browser/runtime certification:** `VISUAL VALIDATION BLOCKED — browser automation is not available in this execution context.`
