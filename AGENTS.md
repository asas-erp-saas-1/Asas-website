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
