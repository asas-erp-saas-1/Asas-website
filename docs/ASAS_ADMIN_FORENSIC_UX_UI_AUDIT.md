# ASAS ADMIN FORENSIC UX/UI AUDIT

**Audit date:** 2026-09-04  
**Repository:** `asas-erp-saas-1/Asas-website`  
**Branch audited:** `feat/admin-ux-ui-foundation`  
**PR:** #7  
**Head audited:** `5e4d0df355ea57a065d854a6e49efb0ab7a972e2`  
**Method:** repository/code forensic inspection, PR review history, Vercel deployment/build inspection, existing QA documentation, and official web-platform/accessibility guidance.  
**Important:** no application code or database schema was changed as part of this audit.

## A. Executive Assessment

ASAS Admin is not a single coherent workspace yet. It is a transitional architecture in which a large legacy `AdminPage.tsx` remains the application shell and still owns authentication state, React Query data, dashboard aggregation, dialogs and several legacy tabs, while newer Projects, Apartments, Buildings and Leads workspaces are mounted beside it.

The current branch therefore contains a useful UX foundation but is **not yet a reliable target architecture**.

The most important finding is operational rather than cosmetic: the current branch head does not build. Vercel deployment `dpl_Fzrg2h433KxiY5BSii3Ua3wN8i5B` is ERROR because `AdminLeadsPremiumWorkspace.tsx:102` references `setDebouncedSearch` without defining it. GitHub reports the Vercel status as failure. This blocks trustworthy runtime/visual validation of the audited head.

A second high-impact issue is data correctness: the legacy AdminPage still owns global queries and derives dashboard totals from the currently returned collections. Projects now have a default server limit of 20 and apartments/leads have finite page limits, so dashboard totals and project-dependent legacy workflows can become page-scoped rather than dataset-scoped.

The correct next step is **not a visual rewrite**. It is to converge the Admin into a route-driven, workspace-oriented architecture with a single state/data ownership model, then establish responsive behavior and interaction contracts on top.

## B. Evidence Base

Primary repository evidence inspected:

- `src/components/pages/AdminPage.tsx`
- `src/components/admin/AdminExperience.tsx`
- `src/components/admin/AdminApartmentsWorkspace.tsx`
- `src/components/admin/AdminProjectsWorkspace.tsx`
- `src/components/admin/AdminBuildingsWorkspace.tsx`
- `src/components/admin/AdminLeadsPremiumWorkspace.tsx`
- `src/components/admin/AdminLeadsWorkspace.tsx`
- `src/components/admin/AdminErrorBoundary.tsx`
- `src/components/admin/AdminOperationStatus.tsx`
- `src/components/admin/AdminWorkspaceAssist.tsx`
- `src/components/shared/AdminRouteMarker.tsx`
- `src/app/admin-ux.css`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/api/admin/*`
- `src/lib/admin-auth.ts`
- `src/lib/db.ts`
- `prisma/schema.prisma`
- `docs/ADMIN_UX_SPECIFICATION.md`
- `docs/ADMIN_INFORMATION_ARCHITECTURE.md`
- `docs/ADMIN_WORKFLOW.md`
- `docs/ADMIN_GUIDE.md`
- `docs/TESTING.md`

PR review evidence: 48 review threads, 12 unresolved at audit time. Several unresolved comments concern current-head behavior and are incorporated below; resolved comments were treated as historical evidence, not automatically as current truth.

## C. Current Admin Architecture Map

### Runtime composition

`AdminExperience` wraps the admin area and currently provides:

1. section parsing from hash/path;
2. `AdminWorkspaceAssist`;
3. global operation status;
4. skip link;
5. `AdminErrorBoundary`;
6. `AdminPage`.

`AdminPage` then provides:

1. authentication gate;
2. React Query cache;
3. legacy dashboard;
4. navigation/sidebar;
5. mobile drawer;
6. global project/apartment/building/lead queries;
7. legacy media/users/audit/settings;
8. create/edit dialogs;
9. newly mounted Projects/Apartments/Buildings/Leads workspaces.

This is a **strangler/transitional architecture**, not yet a clean workspace architecture.

### Navigation

Current navigation is primarily hash-driven:

- `#/admin`
- `#/admin/projects`
- `#/admin/apartments`
- `#/admin/buildings`
- `#/admin/media`
- `#/admin/leads`
- etc.

The code also parses pathname `/admin/*`, listens to both `hashchange` and `popstate`, calls `history.pushState`, and manually dispatches `HashChangeEvent`.

This creates multiple route authorities.

### Data ownership

There are two competing patterns:

- React Query in `AdminPage`;
- local `useState/useEffect/fetch` state in the new workspaces.

This is the central architectural seam to resolve.

### API surface

Admin endpoints are server-protected with `verifyAdminAuth`. Major catalogue endpoints expose pagination metadata:

- Projects: `page/limit/total/totalPages`
- Apartments: `page/limit/total/totalPages`
- Buildings: `page/limit/total/totalPages`
- Leads: `page/limit/total/totalPages`

The frontend does not consume these contracts uniformly.

## D. Workspace Inventory

| Workspace | Current implementation | Current status |
|---|---|---|
| Dashboard | Legacy inline `DashboardTab` in AdminPage | Functional but data aggregation is page-scoped |
| Projects | Dedicated workspace | Transitional; local state/fetch lifecycle |
| Apartments | Dedicated workspace | Transitional; local state/fetch lifecycle |
| Buildings | Dedicated workspace | Transitional; create/list, limited editing |
| Leads | Premium dedicated workspace | Current head has a TypeScript build blocker |
| Media | Legacy inline | Still coupled to AdminPage data |
| Users | Legacy inline | AdminPage monolith |
| Audit | Legacy inline | AdminPage monolith |
| Settings | Legacy inline | AdminPage monolith |

## E. Device Matrix

The matrix below is an engineering contract derived from the current implementation, existing ASAS UX blueprint, and the required operating model. It is **not a claim of completed browser verification**.

| Viewport | Expected target | Current forensic assessment |
|---|---|---|
| 360×800 | Single-column operational UI; drawer; compact toolbar; no accidental overflow; priority data only | At risk: tables mostly rely on horizontal scrolling; drawer has focusability concern |
| 375×812 | Same as 360 with slightly more breathing room | Same |
| 390×844 | Full operational mobile; touch-first controls | Partially supported by CSS/workspaces, not verified on current head |
| 414×896 | Mobile operational subset/hybrid | Partially supported |
| 430×932 | Mobile hybrid | Partially supported |
| 768×1024 | Tablet hybrid; touch-friendly; selective desktop density | Sidebar switches at md, but architecture does not provide a true tablet information model |
| 820×1180 | Tablet hybrid | Same |
| 834×1194 | Tablet hybrid | Same |
| 1024×1366 | Desktop-like hybrid | Full desktop shell begins, but no explicit tablet-to-desktop contract |
| 1280×720 | Compact desktop | Requires density/vertical-space tuning |
| 1366×768 | Compact desktop | Main working range; legacy content can become vertically dense |
| 1440×900 | Full desktop | Target range; max-width exists in some workspaces, not globally |
| 1536×864 | Large desktop | Risk of excess whitespace in some views and inconsistent max widths |
| 1920×1080 | Large desktop | Requires bounded workspace width and stronger information hierarchy |
| 2560×1440 | Very large desktop | Must not stretch tables/cards indefinitely |

## F. Responsive UX Assessment

### Principle

Responsive behavior must change the **interaction model**, not merely CSS dimensions.

### Desktop target

- persistent sidebar;
- dense table/list views;
- multi-column filters;
- contextual row actions;
- detail/editor panels;
- bounded workspace width;
- keyboard-first efficiency.

### Tablet target

Decision: **Hybrid adaptive workspace**.

Reason: tablets have enough width for catalogue tables and split views in landscape, but touch input makes desktop-density controls unsafe. Tablet should retain persistent or semi-persistent navigation while progressively collapsing filters and secondary columns.

### Mobile target

Decision: **Hybrid operational subset**, not literal desktop parity.

Core mobile workflows should be:

- dashboard triage;
- search/filter;
- open entity;
- inspect/edit priority fields;
- status/publication changes;
- lead triage and notes;
- media upload/retry;
- navigation/back.

Advanced SEO, bulk operations, audit exploration and dense relationship management should progressively disclose or defer to larger screens where appropriate.

## G. Navigation Assessment

### Current model

**Hybrid, hash-led and state-led.**

Evidence:

- `AdminPage.activeTab` is local state;
- URL hash/path is parsed separately;
- `navigateTab` calls `setActiveTab` plus `history.pushState`;
- a manual `hashchange` event is dispatched;
- `AdminExperience` independently parses the route;
- `AdminWorkspaceAssist` independently parses the route.

### Problem

There is more than one source of truth for the same concept: current admin section.

### Target

Use one route model:

`route → workspace → URL state → server query`

For this application, URL state should own:

- workspace;
- entity identifier where applicable;
- search;
- filters;
- sort;
- page/cursor;
- selected subview.

Ephemeral UI state should own:

- open menu;
- dialog open/closed;
- temporary draft;
- local hover/focus.

This follows the general Next.js App Router pattern of keeping search/pagination state in the URL rather than hiding it only in component state. citeturn0search4

## H. State Architecture

### Current

**Server state**
- React Query in AdminPage;
- local fetch state in new workspaces.

**URL state**
- hash/path.

**Workspace state**
- `activeTab`.

**UI state**
- drawers/dialogs/sidebar.

**Form state**
- local `useState`.

**Mutation state**
- local booleans/pending objects in each workspace.

**Session state**
- AdminPage `isAuthenticated` plus server cookie/session.

### Findings

1. duplicated server state;
2. duplicated loading/error state;
3. duplicated mutation semantics;
4. cache invalidation is not consistently shared;
5. hidden workspaces can still have parent-level queries active;
6. dashboard aggregation is coupled to list query shape.

React explicitly warns that ad-hoc effect-based fetching requires care around race conditions and recommends framework data mechanisms or a client cache for deduplication/caching. citeturn0search5

## I. Data Fetching

### Strengths

- server pagination exists;
- deterministic ordering has been improved;
- search debouncing exists in dedicated workspaces;
- AbortController is used in several fetch lifecycles;
- API authorization is server-side.

### Weaknesses

- inconsistent consumption of pagination;
- legacy and new fetches overlap;
- `cache: no-store` is used broadly in local fetch helpers;
- no unified query-key/invalidation contract;
- dashboard statistics are derived from list payloads rather than dedicated aggregate data;
- media endpoint returns an unpaginated collection;
- project option loading can fetch every project page sequentially.

### Search race model

AbortController is directionally correct, but each workspace must ensure an aborted request cannot change loading/error state for the current request. React's documented pattern similarly requires cleanup/ignore logic so out-of-order responses do not overwrite current state. citeturn0search5

## J. Tables

Current tables generally use:

`overflow-x-auto`

This is acceptable for truly tabular data but does not satisfy the broader mobile strategy by itself.

### Target classification

**Projects**
- mobile: entity cards;
- desktop: table.

**Apartments**
- mobile: entity cards with Unit/Type/Surface/Price/Status as primary;
- detail/edit view exposes secondary fields.

**Buildings**
- mobile: cards;
- desktop: table.

**Leads**
- mobile: lead cards with name/contact/status/project/next action;
- desktop: dense table.

**Audit**
- mobile: horizontally scrollable audit table is acceptable because it is inherently tabular, but primary identity/action/date should remain immediately discoverable.

### Required table contract

Every data grid must define:

- primary columns;
- secondary columns;
- hidden mobile columns;
- detail entry;
- loading state;
- empty state;
- filtered-empty state;
- error state;
- selection/bulk policy;
- pagination;
- sorting;
- row action policy.

## K. Forms

Current forms contain useful validation and inline errors, but the architecture remains local and dialog-centric.

Required target behavior:

- task-based field grouping;
- required indicators;
- field-level validation;
- server validation;
- preserved input after failure;
- deterministic submit state;
- double-submit prevention;
- meaningful cancel;
- unsaved-change protection for long editors;
- explicit numeric/currency semantics;
- locale-aware phone/email/date input;
- Arabic direction at field level;
- long French strings without layout breakage.

## L. Dialog / Drawer Assessment

Radix Dialog is a sound primitive and provides the right basis for modal behavior.

Current risks:

- not all dialogs have been visually/assistively verified;
- mobile dialogs are not consistently converted into full-screen/bottom-sheet patterns;
- the mobile sidebar uses transform-based hiding;
- current CSS leaves the closed drawer's controls potentially focusable;
- some dialogs contain long content without a unified mobile layout contract.

WAI-ARIA's modal dialog guidance requires focus to move into the dialog and recommends appropriate initial focus for long semantic content. citeturn0search10

## M. Accessibility

The current foundation includes:

- skip link;
- visible focus styling;
- semantic landmarks;
- `aria-live` status areas;
- labels in several forms;
- reduced-motion CSS;
- role/status/alert usage.

But this is not yet a verified WCAG 2.2 AA implementation.

Key gaps:

- no automated accessibility evidence;
- no real screen-reader validation;
- touch-target contract is inconsistent;
- mobile drawer focus/inert behavior is incomplete;
- table semantics are not fully audited;
- status/error announcement behavior is inconsistent across workspaces;
- focus-obscured behavior around fixed/sticky UI is not verified.

WCAG 2.2 adds Target Size (Minimum) and Focus Not Obscured (Minimum), and W3C guidance explicitly treats visible focus as required for keyboard-operable interfaces. citeturn0search0turn0search1

Note: WCAG 2.2 AA's formal minimum target-size criterion is 24×24 CSS px with exceptions; the ASAS product contract is stricter at 44×44 for operational touch targets. citeturn0search0turn0search2

## N. Performance

### Current architecture risks

- AdminPage runs global projects/apartments/buildings/leads queries even when a dedicated workspace is rendered;
- list payloads are reused as dashboard aggregate data;
- project selector aggregation can load multiple pages;
- media is unpaginated;
- many client components increase browser work;
- large monolithic AdminPage increases render/update coupling.

### Dataset policy

| Dataset | 10 | 100 | 1,000 | 10,000 | 100,000 |
|---|---|---|---|---|---|
| Projects | normal | server pagination | server pagination | indexed server search + pagination | cursor/index strategy |
| Apartments | normal | server pagination | server pagination | indexed search/filter | cursor/index strategy |
| Buildings | normal | server pagination | server pagination | indexed search/filter | cursor/index strategy |
| Leads | normal | server pagination | server pagination | indexed search/filter | cursor/index strategy |
| Media | normal | pagination recommended | mandatory pagination | indexed/paginated | cursor/object-storage strategy |

Virtualization should be introduced only after evidence shows rendering cost is material; server-side filtering/pagination is the first control.

## O. Error Taxonomy

Target mapping:

| Error | UX response |
|---|---|
| User error | Inline correction |
| Validation | Field-level + summary when multi-field |
| 401 | Preserve context, trigger re-auth/session-expired state |
| 403 | Explain permission; do not silently fail |
| 404 | Entity not found + return path |
| Conflict/409 | Explain stale/conflicting data and offer refresh |
| Network | Retry without losing draft |
| Timeout | Retry + preserve context |
| 5xx | Actionable server error + retry |
| Unknown | Safe generic message + technical logging |

Current code has multiple local implementations rather than one shared contract.

## P. Loading Taxonomy

Target:

- initial workspace: skeleton or structured loading;
- background refresh: non-blocking indicator;
- search: inline status;
- pagination: local table loading;
- mutation: action-level pending state;
- upload: progress;
- long editor load: section skeleton;
- retry: preserve current content where safe.

A single global spinner is insufficient for an operational ERP.

## Q. Empty-State Taxonomy

Must distinguish:

1. no records;
2. no search results;
3. no filter results;
4. no permission;
5. not configured;
6. loading;
7. failed to load;
8. stale/temporarily unavailable.

Current dedicated workspaces have several useful distinctions, but the taxonomy is not standardized.

## R. Mutation Safety

Positive patterns:

- archive instead of hard delete in several endpoints;
- explicit confirmation for destructive actions;
- role checks;
- audit logging;
- pending-state guards in dedicated workspaces.

Risks:

- inconsistent cache invalidation;
- stale parent data after child-workspace mutations;
- no unified idempotency strategy;
- some mutations depend on local state only;
- status/publication changes need a common mutation contract.

## S. Security UX

The server remains the authority for authentication and authorization.

Observed strengths:

- `verifyAdminAuth` protects admin API routes;
- role checks exist on mutation endpoints;
- admin session data remains server-side;
- upload validation includes MIME, size, magic-byte and image parsing checks;
- audit logging is used for major mutations.

The live schema/RLS work from the preceding engineering track remains a separate security boundary and must not be weakened during UX work.

## T. Internationalization / RTL

The current system supports Arabic fields using `dir="rtl"` in places and has locale synchronization in the root layout.

However, Admin has no single internationalization contract.

Required:

- UI language source of truth;
- RTL at workspace/document level when Arabic UI is selected;
- per-field direction when content language differs;
- locale-aware number formatting;
- DZD currency formatting;
- dates using locale/time-zone policy;
- phone normalization/display;
- resilient French text wrapping;
- Arabic mixed-direction strings;
- no layout assumptions based on English-only lengths.

## U. Real-Estate Domain UX

The Admin should evolve from CRUD screens into an operational graph:

`Project → Building → Apartment → Availability → Lead → Reservation → Contract → Payment`

Current UI strongly represents the first four entities and Leads, but contextual relationship navigation is weak.

Target entity pages should expose:

- entity identity;
- current business status;
- parent/child relationships;
- next best action;
- recent activity;
- ownership;
- audit/history;
- contextual navigation to related entities.

The user should not have to manually remember which project/building/apartment they were working on.

## V. Browser Validation

### Current result

**VISUAL VALIDATION BLOCKED — CURRENT VERCEL HEAD BUILD FAILURE**

The current head deployment returns Vercel's `Deployment has failed` page.

Build log evidence:

`AdminLeadsPremiumWorkspace.tsx:102:43`  
`Cannot find name 'setDebouncedSearch'`

Therefore no visual claim is made for the current head.

Existing `docs/TESTING.md` contains historical browser tests, including 390×844, 768×1024 and 1440×900, but those records are not sufficient to certify the current head after subsequent commits.

### Browser matrix to run after build recovery

Chrome/Chromium:
- 360×800
- 390×844
- 414×896
- 768×1024
- 1024×1366
- 1280×720
- 1440×900
- 1920×1080

Safari/WebKit, Edge and Firefox should be code-level/real-browser validated before release where tooling permits.

## W. Technical Debt

### Highest debt

1. AdminPage monolith;
2. dual state/data architecture;
3. hybrid routing;
4. dashboard derived from list state;
5. local fetch implementations duplicated across workspaces;
6. inconsistent responsive interaction patterns;
7. missing unified mutation/feedback contract;
8. incomplete accessibility evidence;
9. current build failure;
10. incomplete entity relationship navigation.

## X. Issue Classification

### P0 — Must Fix Before continuing implementation

| ID | Area | Evidence | Problem | Impact | Root cause | Recommended solution | Risk | Complexity |
|---|---|---|---|---|---|---|---|---|
| P0-001 | Build | Vercel head build log: `AdminLeadsPremiumWorkspace.tsx:102` | Current branch does not compile | No trustworthy runtime/visual validation | Missing `setDebouncedSearch` state | Restore coherent search state before any visual certification | Low | S |
| P0-002 | Architecture | AdminPage still owns global queries while dedicated workspaces own duplicate local state | Two competing Admin architectures | Stale data, inconsistent loading/errors, duplicated requests | Transitional strangler not yet converged | Establish one workspace shell + one server-state ownership model | Medium | L |
| P0-003 | Data correctness | AdminPage derives totals from finite query collections; projects endpoint defaults to 20 | Dashboard can report page-scoped totals | Managers may make decisions from false inventory/lead counts | List payloads are incorrectly treated as aggregate source | Create aggregate KPI queries/contracts independent of paginated lists | High | M |

### P1 — Must Fix in the first implementation waves

| ID | Area | Evidence | Problem | Impact | Recommended solution |
|---|---|---|---|---|---|
| P1-001 | Navigation | Hash + pathname + local activeTab + manual history/hashchange | Multiple route authorities | Back/forward/deep-link edge cases | Single validated route parser and URL state model |
| P1-002 | URL state | Search/filter/page are mostly local state | Refresh/back loses working context | Rework and navigation friction | Persist list state in URL |
| P1-003 | Responsive tables | Dedicated workspaces primarily use `overflow-x-auto` | Mobile remains desktop-shaped | Poor scanning/touch use | Cards on mobile for operational lists; scroll only where tabular semantics require it |
| P1-004 | Mobile dialogs | Generic Radix dialog sizing remains default in many flows | Long forms are cramped on phones | Editing friction | Full-screen mobile editor pattern |
| P1-005 | Touch | Table actions include 32px/36px controls | Below ASAS 44px operational target | Mis-taps | 44px hit areas with visual density preserved via padding/spacing |
| P1-006 | Mutation consistency | Dedicated workspaces have local mutation state; parent cache is separate | Changes can remain stale elsewhere | Incorrect context after save | Central mutation/query invalidation contract |
| P1-007 | Performance | AdminPage runs projects/apartments/buildings/leads queries independently of visible workspace | Hidden work can still fetch | Network/battery/render cost | Query ownership by active workspace; dedicated aggregate queries for dashboard |
| P1-008 | Media | Upload uses fetch/FormData; no upload-progress mechanism | User cannot see actual upload progress | Uncertainty on large images | Upload state machine + progress-capable transport |
| P1-009 | Media ordering | Upload computes max(order)+1 before insert | Concurrent uploads can collide | Gallery order nondeterminism | Atomic allocation or stable deterministic tie-break |
| P1-010 | Forms | Long editors are dialog-based; no unified dirty-state contract | Accidental loss possible | Data-entry risk | Dirty tracking + unsaved changes guard |
| P1-011 | Buildings | Current workspace visibly provides list/create but no full edit journey | Entity lifecycle incomplete | Admin cannot correct building metadata efficiently | Implement entity detail/edit workflow |
| P1-012 | Session UX | Local workspaces map 401 to error messages | No unified re-auth/context preservation | Confusing expired-session recovery | Global session-expired boundary that preserves route/draft |
| P1-013 | Accessibility validation | Existing docs explicitly list screen-reader/axe/visual gaps | Conformance unproven | Accessibility regression risk | Browser + keyboard + screen-reader/axe verification gate |
| P1-014 | Browser | Current head deployment is ERROR | Requested viewport evidence cannot be produced | Release confidence is low | Recover build, deploy, then run matrix |

### P2 — Should Fix

| ID | Area | Evidence / problem | Solution |
|---|---|---|---|
| P2-001 | Dark mode | Admin CSS mixes forced light surfaces with global dark foreground tokens | Define explicit admin color-scheme contract |
| P2-002 | Mobile drawer | Transform-hidden sidebar remains potentially focusable | Use inert/visibility/focus management for closed state |
| P2-003 | Workspace Assist | Parent route parsing and component route parsing differ | One shared validated route helper |
| P2-004 | Buildings fetching | Project and role retry dependencies are coupled | Separate effects/query keys |
| P2-005 | Apartment DELETE | Current DELETE path lacks the UUID validation used by GET/PUT | Validate before Prisma lookup |
| P2-006 | Lead notes | Pending notes request lifecycle is not fully tied to dialog/unmount | Abort on close/unmount |
| P2-007 | Media list | Media endpoint is unpaginated | Add pagination when asset volume warrants it |
| P2-008 | Sorting | Projects/apartments do not expose a consistent user sort contract | Add safe sortable fields where operationally valuable |
| P2-009 | Bulk operations | No consistent selection/bulk action model | Defer until single-entity workflows are stable; then introduce only high-value bulk actions |
| P2-010 | Feedback | Error/loading/status primitives are duplicated | Create shared AdminFeedback/AsyncState primitives |
| P2-011 | RTL | Direction is partly field-level rather than workspace-level | Add explicit locale/direction contract |
| P2-012 | Long content | Long Arabic/French names and mixed-direction strings are not comprehensively tested | Add text expansion/reflow checks |
| P2-013 | Dashboard | Completeness logic exists but remains partly passive | Convert diagnostics into prioritized actionable queue |
| P2-014 | Entity context | Project/building/apartment relationships are not consistently navigable | Add contextual entity links and breadcrumbs |

### P3 — Could Improve / Documentation and polish

| ID | Area | Finding | Solution |
|---|---|---|---|
| P3-001 | Documentation | Historical QA docs contain claims that do not certify the current head | Mark historical evidence explicitly |
| P3-002 | Terminology | Some legacy labels/actions differ across workspaces | Centralize terminology/status labels |
| P3-003 | Visual polish | Max widths/density are inconsistent across workspaces | Establish workspace container and density tokens |
| P3-004 | Code organization | AdminPage remains thousands of lines | Extract by bounded responsibility after architecture convergence |

## Y. Prioritization

### Must Fix

P0-001, P0-002, P0-003, then P1-001 through P1-014.

### Should Fix

P2-001 through P2-014.

### Could Improve

P3-001 through P3-004.

### Do Not Touch Yet

- public-site visual redesign;
- database schema redesign;
- migration reset/rewrite;
- speculative virtualization;
- speculative global state library;
- decorative animation;
- large-scale rewrite of AdminPage before target boundaries are proven.

## Z. UX Principles Extracted From Evidence

1. **Context is state** — preserve where the user is and what they filtered.
2. **Aggregates must be aggregate** — never derive business KPIs from a paginated slice.
3. **One authority per concern** — one route source, one server-state model, one mutation contract.
4. **Responsive means operational adaptation** — change information priority and interaction model, not only dimensions.
5. **Dense, not cramped** — optimize scan paths while preserving touch targets.
6. **Every mutation is a state machine** — validating → submitting → success/error/recovery.
7. **Failures are recoverable** — retry without destroying user context.
8. **System status is explicit** — users should know whether data is loading, saving, stale or failed.
9. **Entity relationships are navigation** — Project/Building/Apartment/Lead context should travel with the user.
10. **Progressive disclosure beats modal overload** — use dialogs for bounded tasks and routes/panels for substantial entity work.
11. **Accessibility is an interaction contract** — keyboard, touch, focus and assistive technology are first-class inputs.
12. **No visual certification without a buildable artifact**.

## AA. Audit Conclusion

The current Admin is a viable foundation but is **not ready for a cosmetic end-state pass**.

The target sequence is:

**Build integrity → architecture convergence → data correctness → navigation/state contract → responsive interaction model → mutation/error/loading contracts → accessibility → performance → visual polish → browser certification.**

No code was changed during this audit.
