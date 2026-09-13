# ASAS Admin — Operational Units Contract

## Purpose

The Admin is an operational system. Each workspace must expose the work users need to complete, not merely database CRUD.

## Site Operations

### Project
Create → complete information → add buildings → add apartments → manage inventory → manage pricing → manage media → manage publication → monitor completeness.

### Building
Create → associate project → define structure → manage apartments → monitor inventory.

### Apartment
Create → assign project → assign building → define physical specs → define commercial data → define availability → upload plans/media → publish → track lifecycle.

## Customer Operations

### Lead
Intake → qualification → assignment → follow-up → activity/notes → property interest → negotiation → reservation → conversion/loss.

## Canonical Relationship

Project → Building → Apartment → Availability → Lead Interest → Follow-up → Reservation.

## Operational Contract

Every operation must define:

1. Context — which entity and parent entities are active.
2. Preconditions — what must exist or be valid before the operation.
3. State — not-started, incomplete, ready, in-progress, blocked, completed or failed where applicable.
4. Action — the smallest user action that advances the workflow.
5. Feedback — deterministic success/loading/error state.
6. Recovery — retry, correction or safe cancellation path.
7. Permissions — who may perform the operation.
8. Auditability — which consequential actions require an audit trail.
9. Relationships — upstream/downstream entities that must remain navigable.
10. Next action — the most useful next operation after completion.

## Real-estate rule

An apartment is never treated as an isolated row. Its operational context is Project + Building + physical specification + commercial data + availability + media + publication + lifecycle. Customer operations may enter from Project or Apartment context through Property Interest and continue through Follow-up and Reservation.

## Engineering rule

Components render operational state; they should not independently redefine domain readiness, relationships or workflow semantics. Shared deterministic rules belong in domain/lib modules. New screens must map to an operational unit before implementation.
