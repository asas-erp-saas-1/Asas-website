# ASAS UX / CRO Roadmap

**Version:** 1.6
**Date:** 2026-09-12
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `e10a2c3088337f2ab4e79bb7b9322ca838f5df5d`

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
**State:** ACTIVE — final page-level audit pending.

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
**State:** IMPLEMENTED — final verification pending.

Current implementation uses the active Project Sales Room experience with:

- editorial dark hero and verified project positioning
- real price/availability/delivery states where data exists
- real gallery/media only
- inventory separated by actual availability versus coming-soon state
- contextual primary actions and human-contact alternatives
- real amenities/map/video/developer information only when sourced
- final lead conversion block

Important business-logic rule: `AVAILABLE` and `COMING_SOON` are distinct states. Coming-soon inventory must not be presented as immediately visitable or currently available.

Remaining verification debt:

- remove any page-level duplicate fullscreen gallery control where the gallery already exposes that control
- verify hero → proof → visual story → inventory → reassurance → human action sequencing at all target widths
- verify no duplicate global/page CTA creates competing primary actions

### 3.7 Apartment Decision Room
**State:** IMPLEMENTED — final verification pending.

Current implementation uses the active Apartment Decision Room experience with:

- editorial dark hero
- exact property identity, status, type, surface, floor and location where available
- explicit price or price-on-request treatment
- real apartment imagery only; neutral fallback when no real apartment media exists
- decision facts, gallery, floor plans and other detail sections only when sourced
- contextual status-aware lead actions
- relevant available-apartment alternatives

Important business-logic rule: `AVAILABLE`, `COMING_SOON` and other statuses must not share the same visit CTA. The page-level action maps the lead intent to the real status; the global mobile action therefore uses a neutral information request rather than promising a visit for every apartment.

**Bank-credit simulation is intentionally removed from the public sales journey.** No mortgage calculator/simulator should be reintroduced unless explicitly requested as a separate product decision.

Remaining verification debt:

- verify price/status clarity and action hierarchy at all target widths
- verify gallery/floor-plan sequencing and action labels
- verify financial/payment information is shown only when sourced from real data
- verify no page-level CTA competes with the global mobile action

### 3.8 Shared conversion system
**State:** ACTIVE — final deduplication/verification pending.

Shared mobile conversion follows contextual hierarchy:

- project: primary action targets availability/inventory when the inventory section exists
- apartment: primary action requests information rather than promising a visit regardless of status
- general: primary action targets advisor contact
- WhatsApp and phone remain secondary/utility actions
- comparison controls remain a separate decision utility and must not be described as suppressing the sticky CTA unless that suppression is actually implemented
- desktop floating contact action opens the actual page lead form when present rather than routing unnecessarily
- continuous breathing animation was removed from the desktop contact FAB

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
2. Complete final verification of Project Detail / Sales Room.
3. Complete final verification of Apartment Detail / Decision Room.
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
