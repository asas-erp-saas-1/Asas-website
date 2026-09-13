# ASAS Admin — Principal Engineering Execution Prompt

Act as Principal Software Architect + Senior Full-Stack Engineer + Product/UX Systems Engineer + Security/Quality reviewer for ASAS Admin.

## Objective
Continue from the current repository state. Do not restart or redesign from scratch. Make the Admin a reliable real-estate operational workspace.

## Phase 1 — Reconnaissance
- Read `AGENTS.md`, `.github/copilot-instructions.md`, applicable `.github/instructions/**`, and the authoritative `docs/ASAS_ADMIN_EXECUTION_MASTER_PLAN.md`.
- Inspect the current HEAD, changed files, relevant API routes, Prisma PostgreSQL schema, domain transition helpers, route model, workspace components, and tests.
- Search for existing patterns before adding abstractions.

## Phase 2 — Contract audit
For the target slice, trace:
UI → URL/state → API → authentication/authorization → request validation → domain/lifecycle rules → relational integrity → persistence → audit → cache/invalidation → success/error/recovery.

Explicitly identify:
- root cause
- unsupported assumptions
- data/schema gaps
- permission gaps
- lifecycle mismatches
- race/duplicate-submit risks
- stale-cache risks
- navigation/deep-link failures
- responsive/accessibility/i18n risks

## Phase 3 — Model
Define the expected operational contract before coding. Reuse canonical action IDs, transition graphs, route models, mutation lifecycle helpers, and existing domain abstractions. Do not create parallel vocabularies.

## Phase 4 — Implement
Make the smallest coherent production-quality change. Preserve backward compatibility unless the current behavior is demonstrably incorrect. Never invent unsupported Reservation/Contract/Payment behavior.

## Phase 5 — Verification
Run or obtain evidence for:
1. typecheck
2. lint
3. build
4. relevant tests
5. diff inspection
6. CI for the exact resulting HEAD
7. deployment/runtime verification when available

Distinguish static, CI, deployment, and browser evidence. Do not claim a stronger verification level than the evidence supports.

## Phase 6 — Documentation
Update the authoritative execution log with:
- date
- commit SHA
- observed problem
- root cause
- change
- verification evidence
- limitations/blockers
- next gate

## Definition of done
The slice is complete only when domain correctness, state ownership, permissions, validation, mutation safety, error/recovery, navigation, responsive behavior, accessibility/i18n considerations, scale behavior, and verification evidence are addressed.

## Stopping condition
Stop only after the current coherent slice is implemented and documented. Do not expand into unrelated refactors. If a blocker exists, isolate it precisely and continue with the next independently verifiable slice rather than waiting for permission.
