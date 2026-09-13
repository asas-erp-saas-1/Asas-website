# ASAS Repository AI Engineering Instructions

## Mission
Build ASAS as a production-grade real-estate operational platform. Optimize for correctness, safety, recoverability, maintainability, accessibility, performance, and operational efficiency — not cosmetic complexity.

## Before changing code
1. Inspect the repository instructions and the relevant architecture/docs.
2. Identify the authoritative source of truth for the behavior: PostgreSQL schema, API contract, domain transition graph, route model, or existing UI contract.
3. Trace the complete path: UI → route/state → API → validation → authorization → persistence → audit → cache/invalidation → feedback.
4. Search for existing implementations before introducing a new abstraction.
5. State the root cause and acceptance criteria internally before editing.

## Implementation rules
- Make the smallest coherent change that closes the identified contract gap.
- Preserve existing architecture unless evidence requires convergence/refactoring.
- Never fabricate backend capabilities, business states, relationships, or persistence fields.
- Server authorization and validation are authoritative; UI visibility is not security.
- Use Zod/request-boundary validation where the API accepts structured input.
- Use the canonical domain transition graphs instead of duplicating lifecycle rules in UI/API code.
- Important mutations require deterministic pending state, duplicate-submit protection, recoverable errors, retry where safe, cache invalidation, permission checks, and auditability.
- High-risk mutations such as publish/unpublish, archive, price, availability/status changes must not use unsafe optimistic updates.
- Preserve dirty form state after recoverable failure.
- Keep URL state authoritative for meaningful navigation context and make deep links/refresh/back/forward deterministic.
- Prefer native semantic HTML over decorative ARIA.
- Design explicitly for Arabic/French/English, RTL/LTR, DZD currency, localized dates/numbers, long text, and touch interaction.
- Do not add state-management libraries, virtualization, microservices, queues, or schema changes without evidence.

## ASAS domain model
Site Operations: Project → Building → Apartment/Unit → Media/Video → Publication.
Customer Operations: Lead → Qualification → Assignment → Follow-up/Activity → Property Interest → Negotiation → Reservation/Conversion.
System Operations: users, roles/permissions, auditability, configuration.

Only expose Reservation/Contract/Payment behavior when the backend actually supports it. Unknown remains unknown.

## Verification protocol
For every material change:
Observe → inspect evidence → model → root cause → contract → implement → typecheck → lint → build → inspect diff → CI → deployment when applicable → runtime verification → document limitations.

Never claim browser/runtime/deployment verification without evidence. If browser access is unavailable, record: `VISUAL VALIDATION BLOCKED — [specific reason]`.

## Git discipline
- Work only on the current feature branch unless explicitly instructed otherwise.
- Never reset, force-push, rewrite history, delete valid commits, merge to main, or perform destructive production DB operations.
- Prefer small coherent commits.
- Update the authoritative execution log for every material architectural or behavioral change.
- Commit messages should describe the actual contract change.

## Agent completion standard
A task is not done because the UI renders. Done means the domain contract is correct, state ownership is clear, permissions are enforced, failure/recovery is explicit, navigation is deterministic, responsive/accessibility constraints are considered, large-data behavior is bounded, verification evidence is recorded, and limitations are documented.

## Prompt discipline
Use explicit goals, relevant files/evidence, constraints, acceptance criteria, verification commands, and a clear stopping condition. Break large work into independently verifiable slices. Do not expand scope merely because adjacent improvements are possible.
