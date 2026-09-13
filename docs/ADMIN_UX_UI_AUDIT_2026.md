# ASAS Admin UX/UI Audit — 2026-09-02

## Scope

This audit evaluates the existing admin workspace before deeper refactoring. It is grounded in the repository's current admin UX specification, information architecture, workflow documentation, testing record, and the current `AdminPage.tsx` implementation.

## Executive assessment

The admin is functionally mature enough to support core catalogue/media/lead operations, but the implementation is concentrated in a large page component. The repository itself already identifies `StatusBadge`, `IntentLabel`, `AdminLoginGate`, project/apartment editors, media components, users, audit log and dashboard as extraction candidates.

The existing UX specification is strong and should be treated as the contract rather than replaced. The highest-value next step is to make the contract real in the component architecture and mutation feedback model, then refine visual hierarchy.

## Priority matrix

| Priority | Area | Finding | Direction |
|---|---|---|---|
| P0 | Auth/runtime | Login and session flows recently exposed Prisma/PostgreSQL drift | Keep auth error states actionable and monitor runtime after every auth change |
| P0 | Interaction safety | Admin mutations need deterministic pending/success/error behavior | Centralize mutation feedback and disable duplicate submits |
| P0 | Component architecture | `AdminPage.tsx` contains many responsibilities | Extract shell, navigation, feedback, table primitives and editors incrementally |
| P1 | Information architecture | Existing groups are correct but navigation needs stronger current-context feedback | Preserve Dashboard/Catalogue/Media/Sales/System grouping |
| P1 | Lists | The legacy apartments/leads fetches are capped at 50 and discard pagination metadata; filters are sent server-side; projects are fetched with an explicit pagination contract | Preserve server pagination/filtering for apartments, make the legacy leads view consume its existing pagination contract, and keep project selectors paginated or explicitly aggregate all pages |
| P1 | Forms | Existing multi-tab editors are useful but can become cognitively heavy | Group by task, show readiness, preserve drafts on errors |
| P1 | Mobile | Specification requires cards/full-screen dialogs but this must be continuously verified | Treat 360px as a hard constraint |
| P1 | Accessibility | Specification lists focus/error-announcement work as future | Implement dialog focus, `aria-live`, keyboard coverage and contrast checks |
| P2 | Visual system | Current brand tokens are good; admin needs more operational hierarchy | Reduce decorative effects; strengthen density, scan lines and state clarity |
| P2 | Dashboard | Completeness/attention logic already exists | Convert it into prioritized actions rather than passive metrics |
| P2 | Search | A global search component is specified as future | Add after list pagination/filter foundations are stable |

## Engineering direction

Do not rewrite the admin page in one operation. Use vertical slices:

1. **Admin shell** — route-scoped styling, navigation, responsive shell, focus model.
2. **Feedback infrastructure** — toast/banner/error/success contract and mutation guard.
3. **Catalogue lists** — search/filter/pagination + mobile cards.
4. **Editors** — project/apartment progressive disclosure, validation summary, unsaved changes.
5. **Media** — upload progress, retry and failure recovery.
6. **Sales** — lead triage and quick actions.
7. **System** — users/audit/settings with stricter permission affordances.

## Current implementation facts

The current admin page imports React Query, shadcn/Radix UI primitives and Lucide icons and defines admin entities for projects, apartments, leads and buildings. The sidebar already groups the workspace into Dashboard, Catalogue, Media, Sales and System. These existing structures should be preserved while responsibility is extracted.

The repository's own testing record reports verified admin login/session persistence/logout, dashboard, projects, apartments, media/videos, leads and settings flows, as well as unauthenticated API checks. The same record explicitly identifies accessibility, visual regression, performance and automated admin E2E coverage as gaps.

## First implementation wave

This wave deliberately avoids changing business logic or API contracts. It introduces a route-scoped admin UX layer so visual/interaction improvements cannot leak into the public website.

Implemented:

- `AdminRouteMarker` detects the existing `#/admin` route and adds an `admin-mode` scope to the document.
- `admin-ux.css` provides operational interaction primitives: consistent focus, form states, table scanning, card/dialog depth, mobile touch targets, horizontal tab behavior and reduced-motion support.
- The apartments and projects catalogues now have dedicated workspaces; the apartments workspace is server-paginated with search and filters, while the existing monolithic page remains the source of truth for the remaining admin sections.
- The execution prompt is stored as a durable engineering contract for subsequent waves.

## Verification requirement for the next wave

The next implementation must be verified visually and functionally in a real browser. If browser automation is unavailable in the execution environment, do not claim visual verification; use repository/build/runtime evidence and explicitly record the missing browser evidence.
