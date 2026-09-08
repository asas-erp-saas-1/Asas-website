# ASAS UX / CRO Source of Truth

**Status:** ACTIVE
**Last updated:** 2026-09-08
**Branch:** `fix/responsive-viewport-hardening`
**Scope:** Public real-estate website and sales journey only.

## 1. Purpose

This document is the operational source of truth for the public website UX, UI, conversion and sales-psychology work. It exists so implementation does not depend on conversational memory.

The objective is not to make the site look attractive in isolation. The objective is to make every public page a clear, credible and low-friction sales environment that moves a visitor toward an appropriate next step without fabricated claims or manipulative tactics.

## 2. Product principle

The website is a **digital sales system**, not a generic property catalogue.

Primary journey:

`Visitor → Interest → Understanding → Trust → Qualified Lead → Conversation → Visit → Decision`

Every important page must answer, in order:

1. What is this?
2. Why should it matter to me?
3. What evidence supports it?
4. What is my safest next step?

## 3. Sales psychology rules

Use:

- cognitive fluency and clear hierarchy
- progressive disclosure
- emotional visualization followed by rational validation
- risk reduction
- genuine proof close to decision points
- contextual CTAs
- low-friction contact
- choice architecture with one dominant action
- human assistance as a confidence mechanism

Never use:

- fake urgency or scarcity
- fake testimonials or invented social proof
- fabricated neighbourhood statistics, schools, hospitals or travel times
- invented prices, availability or delivery claims
- excessive badges, popups or competing CTAs
- dark patterns
- buyer-facing dashboard aesthetics when an editorial sales presentation is more appropriate

## 4. Page architecture standard

### Project detail

`Desire → Positioning → Proof → Inventory → Risk reduction → Human assistance → Alternatives`

The project hero should establish location, product, starting price/price state, availability and delivery when real data exists. Inventory is a decision tool, not merely a data grid.

### Apartment detail

`Emotional opening → Decision facts → Visual proof → Financial clarity → Action → Alternatives`

The apartment itself must be the visual and commercial focus. Real images, floor plan and exact attributes must outrank secondary content.

### Catalog/listing

`Discovery → Filtering → Shortlist → Property detail`

Cards must make scanning easy while preserving a strong route into the property detail page.

### Contact/conversion

The visitor should understand what happens after submitting/contacting before they commit. CTA copy must match the page context.

## 5. CTA hierarchy

Default hierarchy:

1. **Primary:** the next decision-making action (availability, apartment details, visit, or consultation depending on context).
2. **Secondary:** human/contact assistance.
3. **Utility:** share, compare, download, etc.

Do not give equal visual weight to multiple competing primary actions.

## 6. Data integrity rule

UX work must never widen or alter public data contracts merely to improve appearance. `PublicApartmentCard` is intentionally a lean listing DTO; apartment images belong to `PublicApartmentDetail` unless the API contract is explicitly and safely extended.

Current verified contract:

- `PublicApartmentCard`: no image collection.
- `PublicApartmentDetail`: optional `images?: PublicApartmentImage[]`.
- Project cards/details have real project image data.

Therefore, apartment listing cards must not invent or guess an image source. Visual richness belongs on the apartment detail surface until a deliberate DTO/API change is approved.

## 7. Current completed UX/UI work

- Responsive viewport and horizontal-overflow hardening.
- Mobile navigation, sheets, dialogs, toasts and comparison bar hardened.
- Shared mobile CTA made context-aware for project/apartment/general routes.
- Project and apartment lead forms made context-aware and touch-safe.
- Project cards and apartment cards received responsive hierarchy improvements.
- Status/availability badges standardized to ASAS visual language.
- Typography and button primitives standardized.
- Project gallery made touch-friendly with eager hero loading and fullscreen support.
- Floor-plan viewer made responsive and its download action made functional.
- Public project catalog discovery/filtering hierarchy improved.
- Neighbourhood content corrected to avoid fabricated quantitative claims.

## 8. Current active phase

### Phase 3 — Sales Experience & Conversion System

**Status:** ACTIVE — implementation in progress.

This phase starts after the responsive hardening work and runs independently from the database migration phase. Database/Prisma work remains governed by `docs/ENGINEERING_SOURCE_OF_TRUTH.md` and must not be mixed with UX completion claims.

### Phase 3 gates

**Gate A — visual system**
- ASAS palette, typography, spacing, radii and interaction language are coherent.
- No legacy noisy SaaS visual treatment remains on buyer-facing surfaces.

**Gate B — property presentation**
- Project pages sell the project before exposing complexity.
- Apartment pages sell the specific property before exposing secondary tools.
- Real media is prioritized over decorative UI.

**Gate C — conversion**
- Every page has a clear primary next action.
- CTAs are contextual to page and visitor intent.
- Contact/visit/WhatsApp paths remain operational.

**Gate D — trust**
- No fabricated proof.
- Real facts are placed near decision points.
- Risk-reduction information is understandable.

**Gate E — responsive UX**
- Mobile is a first-class sales surface.
- Sticky actions do not duplicate each other.
- Touch targets remain usable.
- No horizontal overflow or modal viewport traps.

**Gate F — quality verification**
- lint
- typecheck
- production build
- Vercel READY
- runtime smoke tests
- key public journey checks

## 9. Implementation order

1. Property presentation primitives and apartment/project detail UX.
2. Listing cards and discovery surfaces.
3. Shared conversion/CTA consistency across all public pages.
4. Mobile sales journey and sticky CTA deduplication.
5. Trust/risk-reduction surfaces using only verified data.
6. Performance/accessibility polish.
7. Whole-site CRO audit.
8. Release verification.

## 10. Definition of done for Phase 3

Phase 3 is not complete because pages look better. It is complete only when all gates are green and the public journey has been checked from discovery to contact/visit.

Required evidence:

- implementation commits
- lint/typecheck/build results
- Vercel READY deployment
- documented runtime smoke tests
- documented known limitations
- no unresolved critical UX defects

## 11. Next phase after Phase 3

### Phase 4 — Production Conversion Optimization & Measurement

Only after Phase 3 is green:

1. event taxonomy audit
2. funnel measurement
3. CTA performance measurement
4. lead-quality measurement
5. search/filter behaviour analysis
6. page-level conversion hypotheses
7. controlled experiments where traffic volume supports them
8. iteration based on observed data, not intuition alone

Phase 4 must not fabricate analytics. If measurement infrastructure is incomplete, instrumentation is implemented before optimization claims are made.
