# ASAS UX / CRO Roadmap

**Version:** 1.4
**Date:** 2026-09-10
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `d47d7795107ab1b9a50ce4f7563ea3ede8381650`

## Execution ledger

| Phase | Scope | Status | Exit condition |
|---|---|---|---|
| 1 | Deployment / type-contract stabilization | CLOSED | Original production blocker resolved |
| 2 | Database engineering / schema contract | ACTIVE in parallel | All engineering gates in `ENGINEERING_SOURCE_OF_TRUTH.md` green |
| 3 | Sales UX / UI / CRO | ACTIVE | All Phase 3 gates in `UX_CRO_SOURCE_OF_TRUTH.md` green |
| 4 | Measurement / CRO optimization | NOT STARTED | Phase 3 released and instrumentation verified |

## Phase 3 work packages

### 3.1 Responsive foundation
**State:** substantially implemented.

Completed areas include viewport configuration, overflow containment, mobile navigation, modal/sheet/drawer behaviour, safe-area handling, touch targets, typography, buttons, comparison bar and shared mobile CTA behaviour.

### 3.2 Visual identity system
**State:** substantially implemented.

Completed areas include ASAS semantic colors, status/availability treatments, button hierarchy, typography hierarchy, section headings and reduction of noisy legacy SaaS treatments.

### 3.3 Discovery / catalog
**State:** implemented, requires final whole-site audit.

Project discovery, search, filtering, sorting, map hierarchy and project/apartment entry points have been improved without changing catalog business logic.

### 3.4 Project Sales Room
**State:** ACTIVE.

Target structure:

1. Hero: project, location, positioning, real starting price/price state, real availability and delivery.
2. Trust/facts: concise verified proof.
3. Project visual story.
4. Inventory decision zone.
5. Amenities and neighbourhood context.
6. FAQ / risk reduction.
7. Human consultation / visit.
8. Alternatives.

Latest implementation checkpoints:

- Shared mobile project CTA targets the existing `#apartments` inventory section when that section exists.
- Project gallery already provides functional fullscreen and keyboard controls; the remaining page-level duplicate fullscreen control is still identified as cleanup debt and must be removed at page level rather than duplicated elsewhere.
- The project page remains the next page-level conversion refactor: hero → proof → visual story → inventory → reassurance → human action.
- No catalog/API/database contract was changed.

### 3.5 Apartment Decision Room
**State:** ACTIVE.

Target structure:

1. Strong real visual opening.
2. Exact property identity and availability.
3. Price / price-on-request clarity.
4. Key decision facts.
5. Gallery and floor plan.
6. payment/financial information where real data exists.
7. visit/contact action.
8. relevant alternatives.

Hard rule: do not create fake apartment imagery. The current lean apartment card DTO intentionally contains no images; apartment detail contains real apartment images.

Latest implementation checkpoints:

- Shared apartment gallery interaction is keyboard/touch safe and prioritizes only the first real visual.
- Floor-plan guidance now describes only supported controls: wheel/buttons for zoom and drag for panning; it no longer claims unsupported pinch behavior.
- Alternative apartment section now explicitly frames itself as a comparison step, using only real available apartments from the public search contract.
- No apartment data, API contract, pricing logic or image source was changed.

Next apartment-detail checks:

- page-level hero CTA hierarchy and mobile sticky CTA deduplication
- visual opening must prioritize real apartment media before secondary content
- verify price/price-on-request and availability are visually unambiguous
- verify gallery/floor-plan sequencing and action labels
- verify financial/payment information is shown only when sourced from real data

### 3.6 Shared conversion system
**State:** ACTIVE after the first landing-page pass.

The homepage has now been restructured as a high-intent landing page rather than a generic catalogue entry:

- one dominant hero promise and primary project-discovery CTA
- immediate real featured-project visual proof when project media exists
- real catalogue counters as proof, without fabricated testimonials or social proof
- project selection before contact
- explicit three-step decision path: explore → verify → advance
- final conversion block with one dominant advisor action and lower-friction WhatsApp/phone alternatives

Shared apartment/project surfaces still require final CTA deduplication so page-level actions do not compete with the global mobile CTA.

### 3.7 Trust and risk reduction
**State:** PLANNED.

Use only verified project/developer/inventory facts. No fabricated testimonials, counts, ratings, proximity claims or scarcity.

### 3.8 Performance / accessibility
**State:** PLANNED.

Audit image loading, semantic headings, keyboard navigation, focus management, reduced motion, contrast, alt text, CLS/LCP and mobile interaction cost.

### 3.9 Whole-site CRO audit
**State:** PLANNED.

Review Home, Projects, Project Detail, Apartments, Apartment Detail, Services, About, For Developers and Contact using the same sales-system criteria.

## Release sequence

Before Phase 3 is closed:

1. Finish project detail page-level conversion refactor.
2. Finish apartment detail page-level conversion refactor.
3. Finish shared CTA consistency and deduplication.
4. Finish trust/risk-reduction pass.
5. Finish accessibility/performance pass.
6. Run lint/typecheck/build.
7. Verify Vercel deployment is READY.
8. Run public journey smoke tests.
9. Record evidence and remaining non-critical issues.
10. Mark Phase 3 CLOSED only in this document and the UX source of truth.

## Phase 4 — after Phase 3

Phase 4 is data-driven CRO, not another visual redesign.

Required sequence:

`Instrumentation → Baseline → Hypothesis → Experiment → Measurement → Decision → Iteration`

No conversion-rate claim is valid without verified measurement data.
