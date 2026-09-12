# ASAS Expert CRO / UX Standard

Last updated: 2026-09-12

This document is the review gate for every public ASAS page. The objective is not visual novelty; it is a credible, low-friction path from visitor to qualified conversation.

## Evidence base

The standard incorporates current large-scale UX findings from Baymard and real-estate lead-capture patterns. Baymard's 2026 product-page benchmark reports that only 38% of mobile sites in its benchmark reached decent-or-better product-page UX, and stresses that accumulated medium-level usability problems can drive abandonment. Search, filtering, detail-page information architecture, forms, and mobile touch behavior are therefore first-class conversion concerns.

## ASAS conversion sequence

1. Orientation — visitor immediately understands what ASAS sells and who it serves.
2. Relevance — visitor can find a suitable project or apartment quickly.
3. Desire — real photography, architecture, location, and concise positioning create interest.
4. Proof — factual inventory, price, surface, delivery, amenities, plans, map, and truthful project data reduce uncertainty.
5. Action — one dominant next step is obvious: availability, visit, information request, or qualified contact.
6. Human handoff — WhatsApp, phone, and lead form support the decision without competing equally with the primary CTA.
7. Recovery — unavailable inventory, missing media, errors, and empty states always provide a useful next action.

## Page-specific gates

### Home
- Above the fold: proposition + primary action + real project signal.
- Show a small number of high-confidence proof points; never fabricate social proof or statistics.
- Route visitors into Projects rather than forcing a contact form too early.
- Keep secondary contact action visually subordinate.

### Projects / Catalog
- Search and filters must be immediately understandable.
- Cards expose decision-critical information before opening the detail page: project name, location, type/status, price when available, and key apartment signals.
- Filtering and sorting controls use touch-safe targets and clear reset behavior.
- Map is evidence, not decoration; if coordinates are unavailable, explain that state instead of showing an empty map.
- Empty results must offer a recovery path.

### Project Detail
- Hero communicates project identity, location, price position, status, and the next action.
- Inventory is the commercial core: availability must be truthful and easy to scan.
- Evidence follows desire: gallery, essentials, location, amenities, and delivery information.
- Primary decision card remains visible on desktop while users inspect the page.
- Avoid horizontal tabs for core information; use visible sections or vertically collapsible sections when density requires it.

### Apartment Detail
- First viewport answers: what is it, where is it, how large is it, what does it cost, and what can I do next?
- Real images are prioritized; no invented media.
- Core facts remain scannable instead of being buried in prose.
- Availability changes the CTA language: available inventory can request a visit; coming-soon/reserved inventory requests information or conditions.
- Project context and alternatives prevent dead ends.
- No public bank-credit simulation.

### Services / About / Developers / Contact / Insights
- Each page has one job and one dominant CTA.
- Copy is outcome-led and evidence-based rather than generic agency language.
- Contact forms minimize unnecessary friction and preserve contextual intent.
- Developer pages sell the commercial process and quality of execution, not software features.
- Insights exists to answer buyer/developer questions and route readers toward a relevant commercial action.

## Universal interaction gates

- Minimum 44px interactive targets for primary controls.
- Visible keyboard focus.
- No horizontal overflow at common mobile widths.
- Clear loading, empty, and error states.
- No fake urgency, fake scarcity, fake testimonials, invented neighborhood claims, or invented metrics.
- No competing sticky layers on mobile. Comparison and conversion actions must not overlap.
- Public visual language remains editorial real estate, not SaaS/dashboard UI.

## Measurement gates

Do not claim conversion improvement without ASAS analytics. Track at minimum:

- catalog search/filter usage;
- project detail inventory clicks;
- apartment primary CTA clicks;
- WhatsApp and phone clicks;
- lead-form starts, validation errors, submissions, and qualified intent;
- share/favorite/compare usage;
- recovery from empty/error states.

Use these events to form hypotheses and run controlled CRO iterations only after functional correctness, accessibility, responsive behavior, and deployment health are verified.

## Release rule

A page is not considered finished because it looks polished. It is finished only when the business journey, truthful data, interaction model, responsive behavior, accessibility, error/recovery paths, analytics, and production verification are coherent.
