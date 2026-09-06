# ASAS ADMIN TARGET EXPERIENCE

**Target state derived from:** ASAS Admin forensic audit, current repository architecture, existing ASAS UX specification, and verified platform/accessibility guidance.

## 1. Target Product Definition

ASAS Admin is an **operational real-estate workspace**, not a dashboard collection.

Its primary job is to let an administrator or sales/operations staff member answer:

- What needs attention?
- What property am I working on?
- What is its current commercial state?
- What can I safely do now?
- What happened after I acted?
- If something failed, how do I recover without losing context?

## 2. Target Shell

### Desktop ≥1024

- persistent sidebar;
- bounded main workspace;
- compact top context bar;
- workspace title + entity context;
- contextual primary action;
- non-blocking background activity indicator;
- keyboard-accessible navigation.

### Tablet 768–1023

- hybrid sidebar/drawer;
- compact filters;
- two-column layouts only when content remains usable;
- touch-safe controls;
- contextual action placement.

### Mobile <768

- top context header;
- drawer navigation;
- priority-first content;
- cards for operational lists;
- full-screen editors for substantial forms;
- bottom-sheet patterns only for short contextual actions;
- no hover-dependent information;
- 44px operational hit areas.

## 3. Navigation Contract

One source of truth:

`URL → validated route model → workspace`

Example:

`/admin/apartments?search=F3&status=AVAILABLE&page=2`

or the project's chosen hash-compatible equivalent during migration.

The route model must define:

- workspace;
- entity;
- search;
- filters;
- sort;
- pagination;
- subview.

No component should independently reinterpret the URL.

Back/forward must restore the previous operational context.

Refresh must preserve meaningful list state.

Deep links must open the correct workspace/entity.

## 4. Workspace Contract

Every workspace has:

1. identity/context;
2. primary action;
3. search/filter layer;
4. result summary;
5. data view;
6. loading state;
7. empty state;
8. filtered-empty state;
9. error state;
10. retry;
11. mutation feedback;
12. responsive representation.

## 5. Target Workspaces

### Dashboard

Purpose: triage and decision support.

Sections:

1. inventory KPI;
2. availability/reservation/sales movement;
3. new leads;
4. attention queue;
5. recent activity;
6. quick actions.

KPI data must come from aggregate server contracts, not paginated list responses.

### Projects

Desktop:
- dense table;
- search/status filters;
- publication/status;
- apartment count;
- primary actions.

Mobile:
- project cards;
- project name/location/status/count;
- action menu;
- detail/edit entry.

### Apartments

Desktop:
- table with Unit, Project, Type, Surface, Price, Status, Publication, Actions.

Mobile:
- Unit + Type + Surface + Price + Status;
- secondary fields in detail;
- contextual publish/archive/edit actions.

Apartment is the highest-frequency catalogue object and receives the strongest mobile optimization.

### Buildings

Desktop:
- table with Building, Project, Code, Floors, Elevator, Units.

Mobile:
- cards.

Target lifecycle:
- list;
- create;
- open;
- edit;
- relationship navigation to project/apartments.

### Leads

Desktop:
- dense pipeline table;
- status;
- intent;
- source;
- project/lot;
- owner;
- follow-up.

Mobile:
- triage cards;
- click-to-call;
- email;
- status;
- next action;
- notes.

### Media

Target:
- entity context;
- media type;
- thumbnail;
- metadata;
- upload state;
- retry;
- ordering;
- accessibility metadata.

Upload is a state machine, not a single spinner.

### Users

ADMIN-only operational surface:
- account identity;
- role;
- active state;
- last relevant activity;
- explicit confirmation for activation/deactivation.

### Audit

Read-only:
- actor;
- action;
- entity;
- time;
- before/after summary;
- filters.

### Settings

Account/security/preferences only; no unrelated catalogue controls.

## 6. Entity Context Model

The navigation graph is:

`Project → Building → Apartment`

and the commercial graph is:

`Apartment → Availability → Reservation → Contract → Payment`

while:

`Project/Apartment → Lead → Follow-up → Reservation`

Entity views should expose related entities without forcing the user back through the sidebar.

## 7. State Model

### Server state

React Query should be the default owner for remote collections/entities.

### URL state

Owns shareable/recoverable query state:

- search;
- filters;
- sort;
- page/cursor;
- workspace/entity.

### UI state

Owns:

- open/closed;
- temporary panel;
- drawer;
- confirmation dialog.

### Form state

Owns draft values and dirty status.

### Mutation state

Standard:

`idle → validating → submitting → success | recoverable-error`

### Session state

Central boundary handles:

- authenticated;
- expired;
- unauthorized;
- forbidden.

## 8. Query Contract

Query keys must map to domain resources, for example:

- `['admin','projects',params]`
- `['admin','apartments',params]`
- `['admin','buildings',params]`
- `['admin','leads',params]`
- `['admin','media',params]`

Mutation invalidation must explicitly target affected resources.

Dashboard uses independent aggregate queries.

## 9. Data Scale Contract

- 10: ordinary rendering;
- 100: server pagination;
- 1,000: indexed search/filter + pagination;
- 10,000: indexed queries + cursor pagination where needed;
- 100,000: cursor/index strategy, bounded payloads, no client aggregation.

Virtualization is optional and evidence-driven.

## 10. Responsive Data Contract

### 360

Show only operational essentials.

Hide:
- secondary metadata;
- long descriptions;
- low-frequency controls.

Transform:
- sidebar → drawer;
- table → card;
- long editor → full-screen;
- filter collection → collapsible/sheet.

### 390

Same model; increase spacing only where useful.

### 414

Same mobile model; allow slightly richer card metadata.

### 768

Hybrid:
- persistent/semi-persistent navigation;
- table/card choice by task;
- two-column form sections.

### 1024

Desktop-like hybrid:
- dense catalogue;
- touch-safe controls;
- wider dialogs/panels.

### 1280+

Full desktop:
- bounded workspace;
- dense information hierarchy;
- no uncontrolled stretching.

## 11. Accessibility Contract

Target WCAG 2.2 AA.

Required:

- visible focus;
- keyboard-complete primary workflows;
- semantic controls;
- labels;
- field errors;
- status announcements;
- focus-safe dialogs;
- closed drawer must be removed from sequential focus;
- no status communicated by color alone;
- 44px ASAS touch targets for operational controls;
- focus must not be obscured by author-created sticky UI.

W3C guidance confirms visible focus, focus-not-obscured and target-size requirements in WCAG 2.2. citeturn0search0turn0search1

## 12. Error Contract

Every error must answer:

1. what happened;
2. whether data changed;
3. what the user can do next.

Examples:

- 401 → session expired → reconnect → preserve route;
- 403 → permission denied → explain required role;
- 409 → record changed → refresh/compare;
- network → retry;
- validation → correct field;
- 500 → server problem → retry;
- upload → exact reason + retry.

## 13. Loading Contract

Never block the entire workspace for a small mutation.

Use:

- skeleton for initial structure;
- inline loading for search;
- local row/button pending for mutation;
- progress for upload;
- background indicator for refresh.

## 14. Empty-State Contract

Differentiate:

- no data;
- no results;
- no filter match;
- no permission;
- not configured;
- failed.

## 15. Mutation Safety

For every mutation:

- role checked server-side;
- button disabled during submission;
- no duplicate submission;
- explicit consequence for destructive actions;
- audit event;
- cache invalidation;
- recovery path;
- no optimistic UI unless rollback is defined.

Archive is preferred to destructive delete where domain-safe.

## 16. Internationalization Contract

Support:

- Arabic;
- French;
- English.

Rules:

- UI locale is explicit;
- document/workspace direction follows locale;
- mixed-language fields retain their own direction;
- DZD formatting is consistent;
- dates are locale-aware;
- phone display is normalized;
- long text must reflow.

## 17. Design System Contract

### Existing primitives to preserve

- Button;
- Badge;
- Card;
- Input;
- Select;
- Table;
- Dialog;
- Textarea;
- Switch;
- Separator.

### Admin primitives to create/unify

- AdminShell;
- AdminSidebar;
- MobileAdminHeader;
- WorkspaceHeader;
- FilterBar;
- ResultSummary;
- AsyncState;
- MutationFeedback;
- EmptyState;
- ErrorState;
- ConfirmAction;
- EntityCard;
- EntityTable;
- StatusBadge;
- ValidationSummary;
- UnsavedChangesGuard;
- UploadState;
- EntityBreadcrumbs.

## 18. Density Contract

Admin is:

**high information density + low cognitive friction.**

Density must adapt by viewport:

- mobile: priority density;
- tablet: balanced density;
- desktop: operational density;
- ultra-wide: bounded density.

## 19. Target Success Criteria

The target Admin is successful when:

- a user can deep-link to a workspace;
- back/forward restores context;
- filters survive refresh;
- KPIs are accurate independently of list pagination;
- a failed save preserves the draft;
- a failed upload can retry;
- an expired session does not destroy work context;
- mobile users can complete core operations without horizontal page scrolling;
- keyboard users can complete primary workflows;
- large datasets remain bounded and searchable;
- no workspace has a second competing state/data architecture.

## 20. Non-Goals

Do not use this target architecture to justify:

- public website redesign;
- database rewrite;
- premature microservices;
- speculative state libraries;
- virtualization without evidence;
- decorative dashboard effects;
- rewriting everything at once.


## 21. Operational User Journey Contract

The primary unit of UX quality is the **complete user journey**, not an isolated screen.

### Journey A — Publish a property correctly

`Projects → Project → Buildings → Building → Apartments → Apartment → Complete data → Media → Availability → Publish`

At every transition the workspace must preserve:
- current entity context;
- parent relationship;
- unsaved/draft state;
- permission boundary;
- mutation status;
- recoverable error state.

The user must never need to manually reconstruct where the apartment belongs.

### Journey B — Find and qualify a customer

`Leads → Search → Filter → Lead → Interested Project/Apartment → Qualification → Assignment → Follow-up → Next action`

The lead view must expose the property context directly and make the next operational action explicit.

### Journey C — Convert interest into reservation

`Lead → Interested Apartment → Availability → Reservation`

The system must surface availability from the authoritative inventory state. Reservation actions must not depend on stale list state and must handle conflicts explicitly.

### Journey D — Recover from failure

`Action → Pending → Failure → Explain → Preserve context/draft → Retry → Success`

A recoverable failure must not silently return the user to a list or erase entered data.

### Journey E — Continue after navigation interruption

`List → Filter/Search → Entity → Edit → Back/Forward/Refresh`

The route model must restore the meaningful operational context. Local UI state may be disposable; business context must not be.

### Journey F — Mobile field operation

`Login → Drawer → Workspace → Search/Filter → Entity → Contextual action → Result`

Mobile is an operational subset, not a shrunken desktop. The highest-frequency task must remain executable with touch alone and without accidental page-level horizontal scrolling.

### Journey Quality Gate

For every primary journey evaluate:

| Dimension | Required question |
|---|---|
| Orientation | Does the user know where they are and what entity they are operating on? |
| Context | Are parent/child relationships visible when needed? |
| Intent | Is the next action obvious? |
| Feedback | Does the system clearly report what happened? |
| Prevention | Does the UI prevent predictable mistakes? |
| Recovery | Can the user retry without losing work? |
| Reversibility | Can unsafe/destructive actions be cancelled or recovered? |
| Continuity | Does navigation preserve the operational context? |
| Trust | Is the system state believable and auditable? |
| Efficiency | Is the shortest safe path used? |
| Cognitive load | Does the workflow avoid unnecessary decisions and screen changes? |

**Rule:** A screen is not considered production-ready merely because it renders correctly. Its surrounding journey must also satisfy the contract.
