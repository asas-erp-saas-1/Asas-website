# ASAS UX / CRO Roadmap

**Version:** 1.2
**Date:** 2026-09-10
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `82345a341fc8d0f9fc8f7223b3b805f3703be5d3`

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

Latest implementation checkpoint:

- Shared mobile project CTA was corrected so **«Voir les disponibilités»** now targets the existing `#apartments` inventory section when that section exists, instead of promising availability and immediately opening generic contact.
- The CTA keeps the existing contact fallback for apartment/general contexts and when project inventory is unavailable.
- No catalog/API/database contract was changed.
- Touch target remains at the shared 44px minimum.

Remaining project-detail checks:

- verify/remove the duplicate dead fullscreen overlay in `ProjectDetailPage.tsx` if it is still present at the current branch head
- bring any remaining hero action below 44px to the shared minimum
- final CTA hierarchy consolidation
- verify sticky CTA placement against compare bar and floating contact widget
- remove unused imports/components where confirmed by lint

### 3.5 Apartment Decision Room
**State:** NEXT execution target.

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

### 3.6 Shared conversion system
**State:** NEXT after detail surfaces.

Audit and standardize:

- primary CTA semantics
- WhatsApp message context
- phone/contact paths
- lead form headings and intents
- sticky mobile CTA
- success states
- post-contact expectations

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

1. Finish project detail corrections.
2. Finish apartment detail corrections.
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
