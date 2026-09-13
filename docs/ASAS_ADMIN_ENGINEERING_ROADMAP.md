# ASAS ADMIN ENGINEERING ROADMAP

**Starting point:** forensic audit 2026-09-04  
**Branch:** `feat/admin-ux-ui-foundation`  
**Rule:** audit first, then coherent vertical slices. No reset, force push, feature deletion, or main merge.

## 0. Roadmap Strategy

Execution order:

**Build integrity → architecture convergence → data correctness → navigation/state → responsive UX → mutation/error/loading → accessibility → performance → visual polish → browser certification**

Do not start a visual polish wave while P0 issues remain.

## Wave 0 — Build & Runtime Integrity

### Objectives

- restore build;
- establish repeatable verification;
- separate historical QA evidence from current evidence.

### Work

1. Fix `setDebouncedSearch` build failure.
2. Run typecheck.
3. Run lint.
4. Run production build.
5. Inspect Vercel deployment.
6. Inspect runtime errors.
7. Confirm current branch head is actually deployable.

### Gate

- Typecheck PASS
- Lint PASS
- Build PASS
- Vercel READY
- no new runtime errors

### Exit condition

P0-001 closed.

## Wave 1 — Admin Architecture Convergence

### Objectives

Replace the transitional dual architecture with explicit ownership.

### Work

1. Define `AdminRouteModel`.
2. Define `AdminWorkspace` contract.
3. Move route parsing into one helper.
4. Make AdminExperience the shell, not a second state owner.
5. Reduce AdminPage to composition during migration.
6. Define React Query ownership for server state.
7. Remove duplicate parent fetches when a workspace owns the same resource.
8. Define shared query keys.

### Gate

- one route source;
- one server-state source;
- no duplicate resource ownership;
- navigation/back/forward behavior documented.

### Exit condition

P0-002 closed.

## Wave 2 — Data Correctness & KPI Architecture

### Objectives

Ensure operational numbers are correct.

### Work

1. Create server aggregate contracts for dashboard KPIs.
2. Stop deriving totals from paginated list slices.
3. Define dashboard query boundaries.
4. Define pagination contract for every large collection.
5. Define project selector strategy:
   - bounded selector endpoint, or
   - paginated search selector.
6. Define indexed search requirements.

### Gate

Validate KPI results against known database totals at:
- 10;
- 100;
- 1,000 records.

### Exit condition

P0-003 closed.

## Wave 3 — Navigation & URL State

### Objectives

Make the workspace recoverable and shareable.

### Work

1. Canonical route parser.
2. URL state model.
3. Search in URL.
4. Filters in URL.
5. Sort in URL.
6. Pagination/cursor in URL.
7. Entity context in URL.
8. Correct back/forward.
9. Refresh preservation.
10. Deep-link behavior.
11. Remove manual `HashChangeEvent` dispatch once canonical routing is in place.

### Gate

Test:

Login → Projects → filter → open → back → filter remains.

Refresh preserves context.

Forward restores next state.

## Wave 4 — Workspace Foundation

### Objectives

Standardize workspace composition.

### Work

Create:

- AdminShell;
- WorkspaceHeader;
- FilterBar;
- ResultSummary;
- AsyncState;
- EmptyState;
- ErrorState;
- MutationFeedback;
- EntityTable;
- EntityCard.

Do not over-generalize. Components must remain domain-appropriate.

### Gate

Projects, Apartments and Leads use the same structural contract without losing domain-specific behavior.

## Wave 5 — Responsive Device Contract

### Objectives

Implement intentional device behavior.

### Required viewports

360×800  
375×812  
390×844  
414×896  
430×932  
768×1024  
820×1180  
834×1194  
1024×1366  
1280×720  
1366×768  
1440×900  
1536×864  
1920×1080  
2560×1440

### Work

Mobile:
- drawer;
- card lists;
- full-screen editors;
- compact contextual actions;
- no accidental page overflow.

Tablet:
- hybrid navigation;
- selective tables;
- touch-safe controls.

Desktop:
- bounded workspace;
- dense tables;
- efficient scan paths.

### Gate

No horizontal page overflow at 360px.

All primary workflows are touch-completable.

## Wave 6 — Tables & Search

### Work

For each collection:

- primary/secondary/hidden columns;
- search;
- filter;
- sort;
- pagination;
- row actions;
- selection policy;
- empty/error/loading;
- mobile representation.

Search must be server-side for large datasets.

Debounce only where it reduces meaningful request churn.

## Wave 7 — Forms & Entity Editing

### Work

- project editor;
- apartment editor;
- building editor;
- lead actions;
- media metadata.

Add:

- validation summary;
- field-level errors;
- dirty tracking;
- unsaved changes guard;
- double-submit protection;
- server error preservation;
- numeric/currency semantics;
- Arabic/French text resilience.

## Wave 8 — Mutation Safety & Feedback

### Work

Create common mutation contract:

`idle → validating → submitting → success/error`

Implement:

- local pending;
- duplicate-submit guard;
- confirmation policy;
- conflict handling;
- retry;
- cache invalidation;
- audit logging;
- session-expiry recovery.

### Special cases

- archive;
- publish/unpublish;
- price change;
- status change;
- user activation/deactivation;
- media upload/delete.

## Wave 9 — Media Reliability

### Work

- upload state machine;
- progress-capable upload transport;
- file validation;
- retry;
- cancel;
- failure cleanup;
- deterministic ordering;
- stable media query contract;
- mobile upload UX.

Concurrent ordering must be safe.

## Wave 10 — Accessibility

### Work

Keyboard:

- navigation;
- search;
- filter;
- tables;
- dialogs;
- forms;
- mutations.

Focus:

- visible;
- not obscured;
- dialog entry;
- focus restore;
- drawer trap/restore;
- closed drawer inert.

Semantics:

- labels;
- status;
- errors;
- table headers;
- current navigation item.

Target WCAG 2.2 AA. W3C provides explicit guidance for focus visibility, focus-not-obscured, target size, status messages and modal dialogs. citeturn0search0turn0search1turn0search10

## Wave 11 — Performance & Scale

### Work

- query deduplication;
- bounded payloads;
- indexes;
- pagination/cursor decisions;
- cache policy;
- request cancellation;
- render profiling;
- image/media strategy;
- client/server boundary audit.

### Dataset gates

10 / 100 / 1,000 / 10,000 / 100,000.

Do not add virtualization unless profiling proves it necessary.

## Wave 12 — Domain Context

### Work

Implement contextual relationships:

Project:
- Buildings;
- Apartments;
- Leads;
- Media;
- activity.

Building:
- Project;
- Apartments;
- status/counts.

Apartment:
- Project;
- Building;
- Availability;
- Leads;
- Media;
- future Reservation/Contract/Payment.

Lead:
- Project;
- Apartment;
- owner;
- notes;
- next action;
- future reservation context.

## Wave 13 — Visual System

Only after architecture and behavior are stable.

### Work

- typography hierarchy;
- spacing;
- radius;
- borders;
- shadows;
- status colors;
- table density;
- cards;
- empty states;
- dialogs;
- navigation.

Avoid:
- glassmorphism;
- decorative gradients;
- excessive animation;
- giant KPI cards;
- marketing-style whitespace.

## Wave 14 — Browser Certification

### Browser targets

- Chromium/Chrome;
- Safari/WebKit;
- Edge;
- Firefox.

### Required evidence

For each primary workspace:

- desktop;
- tablet;
- mobile;
- keyboard;
- failure state;
- mutation;
- refresh;
- back/forward;
- deep link.

If a browser cannot be run, explicitly mark the limitation.

## Quality Gates Per Wave

### Gate A — Static

- typecheck;
- lint;
- production build.

### Gate B — Integration

- API authorization;
- representative CRUD;
- mutation errors;
- session expiry;
- retry.

### Gate C — Browser

- target viewports;
- keyboard;
- focus;
- responsive behavior;
- no console/hydration errors.

### Gate D — Deployment

- Vercel READY;
- runtime error inspection;
- deployment logs;
- production smoke.

### Gate E — Regression

- public site unaffected;
- Admin-only CSS remains scoped;
- no API contract regressions;
- no database schema changes unless separately approved.

## Risk Controls

Never:

- reset database;
- force push;
- rewrite Git history;
- merge to main;
- modify production schema blindly;
- weaken auth;
- bypass server authorization;
- claim browser verification without evidence.

## Definition of Done

The Admin modernization is complete only when:

1. current head builds;
2. one route model exists;
3. one server-state model exists;
4. dashboard KPIs are aggregate-correct;
5. list state survives navigation/refresh;
6. mobile core operations are intentional;
7. mutations are recoverable;
8. session expiry is understandable;
9. accessibility gates pass;
10. large datasets remain performant;
11. browser matrix is evidenced;
12. Vercel deployment is READY;
13. no unexplained runtime errors remain.

## Execution Principle

Do not optimize a fragile workflow.

For every change:

**Observe → isolate → model → implement smallest coherent change → verify → inspect diff → deploy → re-verify.**
