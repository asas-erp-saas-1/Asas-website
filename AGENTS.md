# ASAS ADMIN — Deep Operational Workspace Engineering Standard

## Status

This document is an engineering operating rule for agents working on the ASAS Admin / Real Estate ERP-CRM workspace.

It is mandatory for Admin work. It supplements the repository's existing engineering rules and does not authorize destructive operations.

## Core rule

Never treat an Admin workspace as a collection of screens.

Treat it as an operational system composed of:
- domain boundaries
- entity lifecycles
- relationships
- server state
- URL state
- UI state
- forms and mutations
- permissions
- failure/recovery behavior
- responsive interaction models
- accessibility
- performance
- auditability

The objective is a reliable real-estate operational workspace, not a visually impressive dashboard.

## Required reasoning loop

For every meaningful change:

**Observe → Inspect evidence → Model the behavior → Identify root cause → Define expected contract → Implement the smallest coherent change → Typecheck/Lint/Build → Inspect diff → Deploy when applicable → Runtime verify → Record limitations**

Never skip directly from a visual observation to a code patch.

## Deep-detail rule

Small details are first-class engineering requirements.

When auditing or implementing a workspace, inspect:
- field semantics and units
- labels and helper text
- required/optional state
- defaults
- validation boundaries
- null/unknown states
- loading transitions
- stale data
- race conditions
- duplicate requests/submits
- keyboard behavior
- focus behavior
- touch hit areas
- overflow
- long Arabic/French strings
- number/currency/date formatting
- URL persistence
- browser history
- refresh/deep-link behavior
- permission visibility
- destructive-action safety
- success/error/retry paths
- empty vs filtered-empty vs failed states
- relationships to neighboring entities
- ownership and activity history
- auditability

A missing small interaction is a real finding when it affects operational correctness.

## Domain architecture

ASAS Admin has three operational domains:

### 1. Site Operations — Gestion du site

Purpose: operate the public real-estate catalogue and its publication lifecycle.

Core entities:
Project → Building → Apartment/Unit → Media/Video → Publication

Inspect and preserve relationships between:
- project identity
- developer/promoter
- location
- buildings
- units
- unit availability
- pricing
- payment plans
- amenities
- floor plans
- furnished plans
- renders
- gallery
- videos
- multilingual content
- SEO
- publication status
- ordering
- delivery information

### 2. Customer Operations — Gestion des clients

Purpose: operate demand, sales follow-up, ownership, and conversion.

Core flow:
Lead → Qualification → Assignment → Activity/Follow-up → Property Interest → Negotiation → Reservation → Conversion/Loss

A CRM view must retain:
- lead identity
- source
- intent
- assigned owner
- status
- next action
- follow-up date
- notes/activity
- interested project
- interested apartment/unit
- reservation context
- history

Never implement Leads as an isolated CRUD table when property context exists.

### 3. System Operations

Users, roles/permissions, auditability, configuration and system state.

## Entity-context rule

Users must not be forced to remember where an entity belongs.

Contextual navigation should allow:
- Project → Buildings
- Project → Apartments
- Project → Leads interested in it
- Building → Apartments
- Apartment → Project/Building
- Apartment → interested Leads
- Apartment → Reservation
- Lead → interested Project/Apartment
- Lead → Activities
- Lead → Reservation

Do not duplicate authoritative domain data merely to make a screen convenient.

## Project editor standard

Project creation/editing must be evaluated as an entity workspace, not a flat form.

Required conceptual sections:

1. Identity
2. Location
3. Commercial
4. Delivery
5. Amenities
6. Buildings
7. Apartments
8. Media
9. Videos
10. Editorial content
11. SEO
12. Publication

At minimum consider:
- FR/AR identity
- slug
- project type
- developer
- city/district/address
- coordinates
- starting price
- price-on-request
- apartment types
- surface range
- delivery date/year/quarter
- amenities
- descriptions
- hero media
- gallery
- videos
- SEO metadata
- publication/archive state
- ordering

Do not expose every field at once on small screens. Use progressive disclosure without hiding operationally critical state.

## Apartment editor standard

An apartment/unit editor must account for the full property record.

Conceptual sections:

1. Unit identity
2. Project / Building relationship
3. Physical characteristics
4. Rooms
5. Outdoor areas
6. Parking
7. Availability
8. Pricing
9. Payment plan
10. Floor plans
11. Gallery / renders / video
12. Features
13. Editorial content
14. SEO
15. Publication

Consider:
- project
- building
- apartment/unit number
- slug
- type
- localized type name
- surface
- floor
- total floors
- orientation
- rooms/bedrooms/bathrooms
- balconies and balcony area
- terrace and terrace area
- garden and garden area
- parking and spots
- status
- price
- price-on-request
- payment plan
- floor plan
- furnished plan
- render
- gallery
- video
- localized descriptions/features
- publication and SEO

Never silently invent a property field. If persistence does not support a desired field, document it as a schema/product gap rather than faking storage in UI state.

## Responsive UX contract

Responsive means behavior changes, not merely CSS dimensions.

### 360px
- operationally essential information first
- drawer navigation
- full-screen editors where appropriate
- contextual actions
- collapsible filters
- minimum 44×44px operational targets
- no accidental page-level horizontal overflow
- no hover-only actions

### 390–430px
- preserve the 360px information hierarchy
- reveal useful secondary metadata only when it does not compromise scanning/actionability

### Tablet
Hybrid adaptive workspace.
Use available width for split/contextual layouts where touch usability remains strong.

### Desktop
Full operational workspace with bounded content width.
Do not stretch dense content indefinitely on 1920/2560px displays.

Never simply shrink desktop UI to produce mobile UI.

## Tables

For each major entity explicitly define:
- primary columns
- secondary columns
- mobile-hidden columns
- detail surface
- sorting
- filtering
- search
- pagination/cursor strategy
- row actions
- bulk actions
- selection
- loading
- empty
- filtered-empty
- error

Use cards where the mobile task is primarily scanning/acting on entities.
Use horizontal table scrolling only when preserving genuine tabular semantics is better.

## Forms and mutations

Form state is distinct from server state.

Every important mutation should model:

**idle → validating → submitting → success | recoverable-error**

Required:
- field validation
- server validation
- draft preservation after failure
- dirty-state tracking
- unsaved-change protection
- duplicate-submit prevention
- deterministic pending state
- success feedback
- actionable error feedback
- retry/recovery
- cache invalidation
- permission check
- audit logging where required

Pay special attention to:
- delete
- archive
- publish/unpublish
- price change
- availability/status change
- activation/deactivation
- media upload

Do not use optimistic UI for high-risk mutations unless rollback and conflict behavior are explicitly safe.

## Media

Uploads require an explicit state machine:
- queued
- validating
- uploading
- progress
- cancelling
- success
- failure
- retry
- cleanup

Concurrent uploads must have deterministic ordering and stable identity. Never let completion timing silently determine gallery order.

## Navigation and state ownership

Canonical flow:

**URL → validated AdminRouteModel → Workspace → Query/Data → UI**

Classify every state value:
- URL state
- server state
- workspace state
- UI state
- form state
- mutation state
- session state

Avoid duplicated server state owners.

Meaningful operational context should survive:
- back
- forward
- refresh
- deep link
- pagination
- search
- filters
- sort
- subview/entity context

Do not use ad-hoc mixtures of pathname parsing, hash parsing, local activeTab, pushState, and manually dispatched browser events when one route authority can represent the same state.

## Data correctness

Never derive business KPIs from finite paginated collections.

Dashboard aggregates require aggregate contracts/query semantics that remain correct at:
10, 100, 1,000, 10,000 and 100,000 records.

Reference selectors should not recursively fetch arbitrary pages merely to populate options. Prefer bounded option contracts or dedicated reference endpoints when justified.

## Search and fetching

For search/filter flows inspect:
- debounce
- abort/cancellation
- stale response protection
- duplicate request suppression
- pagination reset semantics
- cache keys
- invalidation
- request storms
- server filtering/index usage

Do not solve backend scalability problems with arbitrary client-side limits.

## Error and empty-state taxonomy

Distinguish:
- validation error
- user error
- authentication error
- authorization error
- network error
- API error
- server error
- conflict
- timeout
- unknown error

Also distinguish:
- no data
- no search results
- no filter results
- no permission
- not configured
- still loading
- failed to load

Each state needs an appropriate user action or recovery path.

## Accessibility

Target WCAG 2.2 AA and use 44×44px as ASAS's operational target.

Verify:
- keyboard traversal
- visible focus
- focus not obscured
- dialog focus entry/restore
- drawer focus management
- closed drawer removed from sequential focus
- labels
- field errors
- status/error announcements
- semantic tables
- navigation current state
- touch targets
- no hover-only information/action dependency

Do not add ARIA as decoration. Prefer correct native semantics.

## Internationalization

Design for:
- Arabic
- French
- English

Explicitly test:
- RTL
- mixed RTL/LTR
- Arabic wrapping
- French text expansion
- localized numbers
- DZD currency
- dates
- phone numbers
- long names
- long addresses
- bidirectional punctuation/content

Do not assume an LTR layout will become correct by adding dir=rtl later.

## Security UX

UI visibility and server authorization are separate controls.

The UI should avoid presenting actions a user cannot perform when role-based visibility is appropriate, but the server must remain authoritative.

Handle:
- session expiry
- permission denial
- destructive permissions
- sensitive information
- stale authorization
- mutation rejection after permission changes

Never infer security from disabled buttons.

## Performance

First establish:
- bounded payloads
- server pagination
- indexed server filtering/search
- query deduplication
- appropriate caching
- cancellation
- server/client boundaries
- render profiling
- image discipline

Do not add virtualization without evidence that rendering cost requires it.

## Verification discipline

Never claim:
- browser validation without actual browser evidence
- Vercel READY without deployment evidence
- runtime success from static code inspection
- accessibility verification from code appearance alone

When browser access is blocked, record:

**VISUAL VALIDATION BLOCKED — [specific reason]**

Then continue with code/runtime/static analysis that is actually possible.

## Change safety

Never:
- reset
- force-push
- delete valid features
- rewrite history
- merge into main
- perform destructive database operations

unless separately authorized and explicitly required.

Prefer small, reviewable commits with one coherent purpose.

## Definition of done

A workspace change is not done merely because it renders.

It is done when:
1. the domain behavior is correct;
2. state ownership is clear;
3. URL/history behavior is deterministic;
4. loading/error/empty/recovery states are explicit;
5. permissions are respected;
6. responsive behavior is intentional;
7. keyboard/touch accessibility is considered;
8. Arabic/French/English content does not break the layout;
9. large-data behavior is bounded;
10. typecheck/lint/build pass;
11. relevant runtime/deployment verification is completed;
12. limitations are documented.

## Final principle

**Every small detail is part of the product contract when it changes user understanding, operational efficiency, safety, recoverability, data correctness, or trust.**

Do not optimize for “looks good”.

Optimize for:

**Reliable → Understandable → Efficient → Safe → Recoverable → Accessible → Scalable → Consistent.**


## 13. ASAS ADMIN — Deep Workspace Operating Standard

This section is mandatory for all Admin work and extends the general protocol above. The Admin is an operational workspace, not a collection of dashboard screens.

### 13.1 Workspace domains
Treat Admin as three coordinated operational areas:
- **Site Operations:** projects, buildings, apartments/units, media, videos, content, SEO, publication and availability.
- **Customer Operations:** leads, qualification, assignment, follow-up, activities/notes, property interest, negotiation and conversion.
- **System Operations:** users, roles/permissions, auditability, configuration and system state.

The critical cross-domain flows are:
- Project → Building → Apartment → Availability → Reservation → Contract → Payment
- Project/Apartment → Lead → Follow-up → Reservation

Do not leave these as isolated CRUD screens. Entity views must expose relevant relationships, ownership, status, activity/history and next actions.

### 13.2 Project editor contract
A project editor is an entity workspace with progressive disclosure, not a flat form. Audit and implement these conceptual sections:
1. Identity — name, localized name, slug, type, developer/promoter.
2. Location — city, district, address, coordinates and localized values.
3. Commercial — starting price, price-on-request, apartment types, surface range and status.
4. Delivery — date/year/quarter and related delivery information.
5. Amenities — parking, elevator, garden, pool, security, climate and structured amenities.
6. Buildings — project/building relationship and building inventory.
7. Apartments — unit inventory and availability summary.
8. Media — hero, gallery, plans/renders where applicable.
9. Videos.
10. Editorial content — localized descriptions/features.
11. SEO — title, description, keywords, canonical, OG and indexing controls.
12. Publication — draft/review/published/archive semantics where supported by the domain contract.

Never invent persistence. If the UI needs a field that the live schema/contracts do not support, document the gap instead of faking it in client state.

### 13.3 Apartment/unit editor contract
Treat an apartment as a property entity, not a row. The editor must account for:
1. Identity — project, building, apartment/unit number, slug and type.
2. Physical characteristics — surface, floor, total floors, orientation, rooms, bedrooms and bathrooms.
3. Outdoor areas — balconies/count/area, terrace/area, garden/area.
4. Parking — availability and spots.
5. Availability/status — through the authoritative lifecycle/state machine, never arbitrary status writes.
6. Pricing — server-authoritative DZD amount semantics.
7. Payment plan.
8. Floor plan/furnished plan/renders.
9. Gallery and video.
10. Features.
11. Localized editorial content.
12. SEO.
13. Publication/order.

For every apartment list/detail, define mobile primary fields, secondary fields, hidden fields and the detail surface explicitly. Preserve property identity and project/building context during navigation.

### 13.4 Every workspace receives the same deep audit
For Dashboard, Projects, Buildings, Apartments, Leads, Users, Roles/Permissions, Settings, Site Content, Media, Videos, Newsletter, Audit Logs and future Admin workspaces, inspect all of the following before material implementation:
- domain purpose and ownership
- entity lifecycle and legal state transitions
- relationships and contextual navigation
- permissions and visibility
- URL/deep-link/history contract
- server/URL/workspace/UI/form/mutation/session state ownership
- fetch, cache, invalidation, cancellation and race behavior
- search/filter/sort/pagination semantics
- table/card/detail strategy
- form semantics and validation
- dialog/drawer/focus/scroll behavior
- loading/error/empty/recovery states
- mutation safety and audit trail
- responsive interaction model at every required viewport
- keyboard/touch/screen-reader behavior
- RTL/LTR and Arabic/French/English expansion
- long names, addresses and content
- number, currency, date and phone semantics
- large-data behavior
- browser compatibility
- runtime/deployment evidence

A workspace is not considered audited because its happy path renders.

### 13.5 Device behavior is a product contract
Do not equate responsive CSS with responsive UX. Define what information, actions, navigation and interaction model changes at 360, 375, 390, 414, 430, 768, 820, 834, 1024, 1280, 1366, 1440, 1536, 1920 and 2560px widths.
- **Mobile:** hybrid operational subset; priority-first information, drawer navigation, contextual actions, full-screen editors where useful, collapsible filters, ≥44×44 operational targets, no hover dependency, no accidental page overflow.
- **Tablet:** hybrid adaptive workspace; exploit width for split/context layouts without sacrificing touch usability.
- **Desktop:** full operational workspace with bounded content width and high information density; never stretch dense content indefinitely.

### 13.6 Tables are operational instruments
For every major entity explicitly define primary/secondary/mobile-hidden columns, detail view, sorting, filtering, search, pagination/cursor strategy, selection, row/bulk actions and all loading/empty/filtered-empty/error states. Use cards when mobile tasks are entity scanning/acting; preserve horizontal table semantics only when genuinely valuable.

### 13.7 Forms and mutations are state machines
Important mutations follow: **idle → validating → submitting → success | recoverable-error**.
Every mutation requires permission verification, duplicate-submit protection, deterministic pending state, success/error feedback, recovery/retry, cache invalidation and audit logging where applicable. Protect dirty forms and preserve drafts after recoverable failure. High-risk mutations (delete/archive/publish/status/price/activation/media) require explicit safety semantics; do not use unsafe optimistic UI.

Media uploads follow an explicit queued/validating/uploading/progress/cancelling/success/failure/retry/cleanup model. Concurrent uploads must have deterministic identity and ordering.

### 13.8 Data correctness and scale
Never derive business KPIs from finite paginated lists. Use aggregate contracts/query semantics. Search and filtering must be server-bounded and cancellation-aware where appropriate. Do not solve scale with arbitrary client limits. Establish pagination, indexes, bounded payloads, deduplication and caching before considering virtualization; virtualization requires profiling evidence.

### 13.9 Failure and recovery contract
Explicitly test slow/failed APIs, network loss, double-submit, mutation failure, retry, session expiry, refresh during save, Back/Forward during operations, upload failure, rapidly changing search/filter/page state and stale responses. Distinguish validation, auth, authorization, network, API, server, conflict, timeout and unknown errors. Distinguish no-data, no-results, no-filter-results, no-permission, not-configured, loading and failed states.

### 13.10 Accessibility and localization
Target WCAG 2.2 AA and use ≥44×44px operational targets. Verify focus entry/restore, visible/unobscured focus, keyboard traversal, drawer focus containment/removal, semantic tables, labels, error/status announcements and current navigation semantics. Design for Arabic RTL, French and English from the beginning, including mixed bidi content, DZD formatting, dates, phones and text expansion.

### 13.11 Evidence discipline
Never claim visual/browser/runtime/deployment validation without actual evidence. If browser access is blocked, record the exact limitation. Every implementation follows: **Observe → isolate → model → smallest coherent change → verify → inspect diff → deploy when applicable → re-verify**. P0 defects block visual polish. Do not alter production schema during UX work unless a separately justified schema requirement is documented.

### 13.12 Intelligence and continuous learning
When an implementation exposes a reusable lesson, update the appropriate skill or learning ledger rather than relying on conversation memory. For external facts, verify primary sources and record the question, facts, date, confidence and applicability. At completion, perform the failure self-check: scope drift, weakened gates, unverified claims, and tests that do not actually assert behavior.


## 14. Active Execution Note — Dashboard Aggregate Boundary

The dashboard KPI boundary is now an implementation rule, not documentation: /api/admin/stats is the authoritative aggregate source for total projects, total apartments, apartment availability/reservation/sold counts, total leads and new leads. Bounded workspace collections may be used only for previews/breakdowns and must never be promoted into business totals.

During deployment waits, continue engineering from verified repository state: inspect the resulting deployment and runtime evidence before declaring the change valid; do not infer build success from a commit alone. If deployment fails, isolate the failure and fix the smallest coherent cause before proceeding.


## 15. Operational Units — Mandatory Domain Lens

Admin work must be reasoned about as operational units, not isolated CRUD screens. Site Operations cover project-management, building-management, apartment-inventory, availability-management, media-management and publication-management. Customer Operations cover lead-intake, qualification, assignment, follow-up-management, property-interest and reservation-conversion. System Operations cover users, permissions, settings and audit activity. Entity work must preserve the contextual relationship graph and expose appropriate next actions.

For the real-estate catalog, the canonical operational chain is Project → Building → Apartment → Availability → Reservation → Contract → Payment. For commercial operations, it is Project/Apartment → Lead → Follow-up → Reservation. New Admin functionality must identify its operational unit, entity context, upstream/downstream relationships, mutation risks and recovery behavior before implementation.


## 16. Canonical ASAS Admin Operational Model

The following operational decomposition is authoritative for Admin engineering.

### SITE OPERATIONS

Project: Create → Complete information → Add buildings → Add apartments → Manage inventory → Manage pricing → Manage media → Manage publication → Monitor completeness.

Building: Create → Associate Project → Define structure → Manage apartments → Monitor inventory.

Apartment: Create → Assign Project → Assign Building → Define physical specs → Define commercial data → Define availability → Upload plans/media → Publish → Track lifecycle.

### CUSTOMER OPERATIONS

Lead: Intake → Qualification → Assignment → Follow-up → Activity/Notes → Property Interest → Negotiation → Reservation → Conversion/Loss.

### CANONICAL RELATION

Project → Building → Apartment → Availability → Lead Interest → Follow-up → Reservation.

This is a behavioral/domain model, not merely navigation. Each operational unit must have explicit ownership, context, prerequisites, next actions, validation, mutation safety, failure recovery, permissions, and auditability. Do not implement a disconnected CRUD screen when the operation belongs to an existing entity lifecycle.


## 17. GitHub Delivery Controls

GitHub is the engineering evidence system for ASAS. The repository must enforce the following operational model:

1. Every material change is delivered through one coherent branch and pull request.
2. CI must run on pull requests targeting the protected integration branch and on branch pushes where execution evidence is useful.
3. Required CI checks are the arbiter; never infer success from a commit alone.
4. GitHub Actions use least-privilege permissions and immutable full-length commit SHA pins for third-party actions.
5. Dependency maintenance is automated through Dependabot for GitHub Actions and application dependencies.
6. Dependency Review runs on pull requests and is treated as a security gate when dependency manifests change.
7. Protected integration/production branches must disable force-push and deletion, require pull requests, require the canonical CI checks, and enforce administrators where the repository policy permits.
8. Production deployment is a separate controlled concern from pull-request CI. CI proves code quality; deployment evidence proves deployability; runtime evidence proves operational health.
9. Required checks must be uniquely named. A required check must pass for the latest commit SHA; an earlier successful run is not sufficient.
10. Never weaken a CI gate to obtain a green PR. Fix the underlying failure or document an explicit engineering decision.
11. GitHub configuration changes that cannot be represented safely as repository files must be recorded as an administrative configuration task with evidence after application.
12. Workflow changes themselves are security-sensitive and require the same observe → isolate → model → implement → verify discipline as application code.
13. Dependency Review is a target security gate but must not be treated as active until GitHub Dependency Graph is enabled for the repository; an unsupported check is configuration debt, not a green result.

### GitHub configuration target

For the protected integration/production branch:
- pull request required
- force-push disabled
- branch deletion disabled
- required status checks enabled
- conversation resolution required
- stale approvals dismissed when new commits materially change the review
- required checks must come from the expected GitHub App/source where supported
- administrator bypass disabled where operationally feasible
- deployment success required before production merge when the deployment environment is configured
- signed commits and linear history are considered according to the repository's collaboration model, not enabled blindly

This section describes the target control plane; repository settings are only considered active after direct GitHub settings evidence exists.
