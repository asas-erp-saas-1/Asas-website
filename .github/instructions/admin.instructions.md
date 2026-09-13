---
applyTo: "src/app/api/admin/**,src/components/admin/**,src/components/pages/Admin*.tsx,src/lib/admin-*.ts,docs/ASAS_ADMIN_*.md"
---

# ASAS Admin Deep Engineering Contract

Treat Admin as an operational workspace, not a collection of CRUD screens.

## Required audit dimensions
Before material changes inspect: domain purpose, lifecycle/state graph, entity relationships, permissions, URL/deep-link/history, server state, workspace/UI/form/mutation state, fetch/cache/invalidation/cancellation, search/filter/sort/pagination, table/detail strategy, loading/error/empty/recovery states, auditability, responsive behavior, keyboard/touch/focus, RTL/LTR, localization, large-data behavior, and runtime evidence.

## Cross-domain relationships
Preserve contextual navigation across Project → Building → Apartment and Lead → Project/Apartment. Never fabricate IDs, slugs, reservation state, contracts, payments, or availability facts.

## Mutation contract
Important mutations follow: idle → validating → submitting → success | recoverable-error. Require server validation, authorization, duplicate-submit protection, deterministic pending state, recoverable feedback, safe retry, cache invalidation, and audit logging where appropriate.

## API contract
Validate structured requests at the boundary. Verify foreign-key ownership relationships before writes. Preserve database invariants server-side. Return explicit conflict responses for invalid lifecycle transitions. Keep PostgreSQL Prisma schema authoritative.

## UI contract
The UI must not present actions that the server will reject when visibility can be determined, but server enforcement remains mandatory. Preserve dirty state on failure. Meaningful context must survive refresh/deep-link/back/forward.

## Responsive and accessibility contract
Responsive behavior is behavioral, not just CSS. Design for 360–430px mobile, tablet, and bounded desktop layouts. Operational touch targets should be ≥44×44px. Test keyboard focus, dialogs/drawers, semantic controls, errors/status announcements, Arabic/French/English, RTL/LTR, DZD numbers/currency, long content, and overflow.

## Evidence standard
Never call static inspection runtime verification. Never claim Vercel/browser readiness without evidence. Record blockers explicitly and continue with verifiable static/API/CI work.
