# ASAS UX / CRO Roadmap

**Version:** 1.5
**Date:** 2026-09-10
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `f13442dee6553fbfa3fcb1096501fdbf5da0bc33`

## Execution ledger

| Phase | Scope | Status | Exit condition |
|---|---|---|---|
| 1 | Deployment / type-contract stabilization | CLOSED | Original production blocker resolved |
| 2 | Database engineering / schema contract | ACTIVE in parallel | All engineering gates in `ENGINEERING_SOURCE_OF_TRUTH.md` green |
| 3 | Sales UX / UI / CRO | ACTIVE | All Phase 3 gates in `UX_CRO_SOURCE_OF_TRUTH.md` green |
| 4 | Measurement / CRO optimization | NOT STARTED | Phase 3 released and instrumentation verified |

## Page-by-page execution order

The public interface is audited and improved one page at a time. A page is not considered finished because it looks better; it must pass structure, content hierarchy, interaction, responsive, accessibility, data-integrity and conversion checks before moving to the next page.

1. **Home** — brand promise, first impression, real project proof, discovery route, trust, CTA hierarchy, loading/error states.
2. **Projects / catalog** — discovery, search, filtering, sorting, map, apartment search, result comprehension and entry into project detail.
3. **Project Detail / Sales Room** — desire, positioning, proof, inventory decision zone, reassurance, visit/lead conversion.
4. **Apartment Detail / Decision Room** — real visual opening, exact facts, price clarity, gallery/floor plan, financial clarity, lead action, alternatives.
5. **Services** — service positioning, proof, relevance and lead routing.
6. **About** — credibility, differentiation, evidence and human trust without invented claims.
7. **For Developers** — B2B value proposition, proof, process and qualified lead capture.
8. **Contact** — intent matching, low-friction contact, expectations after submission and channel hierarchy.
9. **Campaign Landing** — campaign-specific message match, single objective and conversion path.
10. **Legal / utility pages** — readability, navigation, mobile accessibility and consistency without over-design.

Admin is treated separately from the public sales journey and must not inherit public-facing CRO patterns blindly.

## Phase 3 work packages

### 3.1 Responsive foundation
**State:** substantially implemented.

Completed areas include viewport configuration, overflow containment, mobile navigation, modal/sheet/drawer behaviour, safe-area handling, touch targets, typography, buttons, comparison bar and shared mobile CTA behaviour.

### 3.2 Visual identity system
**State:** substantially implemented.

Completed areas include ASAS semantic colors, status/availability treatments, button hierarchy, typography hierarchy, section headings and reduction of noisy legacy SaaS treatments.

### 3.3 Discovery / catalog
**State:** ACTIVE — page-by-page audit in progress.

Project discovery, search, filtering, sorting, map hierarchy and project/apartment entry points have been improved without changing catalog business logic.

### 3.4 Home
**State:** FIRST PASS COMPLETED — final whole-site verification pending.

Completed in this pass:

- one dominant hero promise and primary project-discovery route
- immediate real featured-project visual proof when project media exists
- real catalogue counters without fabricated social proof
- clearer project selection before contact
- explicit three-step decision path: explore → verify → advance
- final conversion block with one dominant advisor action and lower-friction contact alternatives
- loading state no longer presents zero-valued catalogue counters as if they were real data
- catalogue failure state now offers retry and a direct project route
- project cards no longer use a generic brand image as a substitute for missing project media

Home remains subject to the final responsive/accessibility/performance pass after all public pages are aligned.

### 3.5 Projects / Catalog
**State:** ACTIVE — current page under audit.

Target structure:

1. Clear discovery proposition.
2. Search and fast location/type shortcuts.
3. Filters with visible active state and easy reset.
4. Map as a supporting spatial decision tool, not the only discovery path.
5. Project results with consistent card hierarchy and real media only.
6. Apartment search as a secondary route that does not compete with project discovery.
7. Clear empty/error states and accessible keyboard interactions.

Current known technical/UX debt to verify:

- compact controls must remain usable at 44px where interaction is primary
- advanced filters must not dominate the first viewport
- apartment search should remain visually secondary to project discovery
- verify project map behaviour when projects exist without coordinates
- verify query/filter/sort state remains understandable after interaction
- remove unused icon imports or other lint debt discovered by verification

### 3.6 Project Sales Room
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
- Project page remains the next major page-level conversion refactor: hero → proof → visual story → inventory → reassurance → human action.
- No catalog/API/database contract was changed.

### 3.7 Apartment Decision Room
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
- Floor-plan guidance describes only supported controls: wheel/buttons for zoom and drag for panning.
- Alternative apartment section explicitly frames itself as a comparison step, using only real available apartments from the public search contract.
- No apartment data, API contract, pricing logic or image source was changed.

Next apartment-detail checks:

- page-level hero CTA hierarchy and mobile sticky CTA deduplication
- visual opening must prioritize real apartment media before secondary content
- verify price/price-on-request and availability are visually unambiguous
- verify gallery/floor-plan sequencing and action labels
- verify financial/payment information is shown only when sourced from real data

### 3.8 Shared conversion system
**State:** ACTIVE.

Shared mobile conversion now follows contextual hierarchy:

- project: primary action targets availability/inventory when available
- apartment: primary action targets the lead/visit path
- general: primary action targets advisor contact
- WhatsApp and phone remain secondary/utility actions
- compare mode suppresses the sticky CTA where the comparison action is the active decision context
- desktop floating contact action opens the actual page lead form when present rather than routing unnecessarily
- continuous breathing animation was removed from the desktop contact FAB

Final page-level deduplication remains required after Project and Apartment refactors.

### 3.9 Trust and risk reduction
**State:** PLANNED.

Use only verified project/developer/inventory facts. No fabricated testimonials, counts, ratings, proximity claims or scarcity.

### 3.10 Performance / accessibility
**State:** PLANNED.

Audit image loading, semantic headings, keyboard navigation, focus management, reduced motion, contrast, alt text, CLS/LCP and mobile interaction cost.

### 3.11 Whole-site CRO audit
**State:** PLANNED.

Review Home, Projects, Project Detail, Apartments, Apartment Detail, Services, About, For Developers, Campaign Landing and Contact using the same sales-system criteria.

## Definition of done per page

A page can move to **VERIFIED** only when:

- business logic and public data contracts are preserved
- no fabricated data or media has been introduced
- hierarchy and copy communicate one clear next action
- loading, empty and error states are intentional
- keyboard and touch interactions are usable
- responsive layouts have no overflow or clipped controls
- focus, labels and semantics are accessible
- images have truthful alt text and appropriate loading priority
- page-level CTAs do not compete with global sticky/floating actions
- lint/typecheck/build pass after the implementation batch
- deployment/runtime smoke testing has been completed when release verification is available

## Release sequence

1. Complete Projects / catalog page.
2. Complete Project Detail / Sales Room.
3. Complete Apartment Detail / Decision Room.
4. Complete Services, About, For Developers and Contact.
5. Complete Campaign Landing and legal/utility consistency.
6. Finish shared trust/risk-reduction pass.
7. Finish accessibility/performance pass.
8. Run lint/typecheck/build.
9. Verify Vercel deployment is READY.
10. Run public journey smoke tests.
11. Record evidence and remaining non-critical issues.
12. Mark Phase 3 CLOSED only when all required gates are green.

## Phase 4 — after Phase 3

Phase 4 is data-driven CRO, not another visual redesign.

Required sequence:

`Instrumentation → Baseline → Hypothesis → Experiment → Measurement → Decision → Iteration`

No conversion-rate claim is valid without verified measurement data.