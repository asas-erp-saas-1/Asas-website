# ASAS UI/UX Reference 2026

## Purpose

This document is the implementation reference for the public ASAS Immobilier website. The companion `ASAS_UI_UX_MASTER_2026.svg` is the visual board to preview and replicate in code.

The design is not a generic SaaS dashboard. It is a premium real-estate sales environment built around **desire → understanding → proof → trust → qualified contact → visit → decision**.

## Visual system

- **Ivory:** `#F8F7F2` — primary public background.
- **White:** `#FFFFFF` — cards, forms and clean decision surfaces.
- **Charcoal:** `#17232A` — primary dark surface and strong contrast.
- **Forest:** `#183C31` — trust/conversion surface and secondary brand accent.
- **Gold:** `#B9975B` — restrained premium accent, never used as a decorative gradient.
- Serif/editorial display headings; sans-serif for controls, metadata and body copy.
- Thin borders, restrained shadows, generous whitespace and controlled radii.
- Real architectural/property photography only when supplied by the data model.

## Page implementation contract

### Home

**Business job:** establish positioning and move qualified visitors into the project catalogue or a human conversation.

Hierarchy:
1. Editorial hero + real project image when available.
2. Primary CTA: `Explorer les projets`.
3. Secondary human CTA: `Parler à un conseiller`.
4. Real project selection.
5. Decision-oriented explanation of the ASAS process.
6. Final contact CTA.

Never fabricate project counts, availability percentages, testimonials or market statistics.

### Catalogue / Projects

**Business job:** reduce search friction and expose real inventory.

Required states:
- loading skeletons;
- populated results;
- no-result recovery;
- filter active state;
- apartment search only after criteria are entered;
- map only when at least one project has real coordinates;
- explicit empty-map state when no coordinates are published.

Primary action: open a relevant project/apartment. Secondary action: contact ASAS when the visitor cannot find a match.

### Project Detail

**Business job:** convert project interest into an inventory decision or qualified conversation.

Sequence:
1. Hero / project identity.
2. Price and availability evidence.
3. Decision facts.
4. Real gallery.
5. Amenities/features only when present in data.
6. Inventory with explicit `AVAILABLE` vs `COMING_SOON` states.
7. Map/video/developer only when real data exists.
8. Lead/contact conversion.
9. Alternatives.

The page must never imply a visit or availability that the data does not support.

### Apartment Detail

**Business job:** give enough certainty to request a visit or information.

Sequence:
1. Emotional opening using real apartment/project media when available.
2. Status + project context.
3. Price / price-on-request clarity.
4. Core facts: type, surface, floor, rooms, orientation, parking where available.
5. Real image gallery.
6. Real floor plan / 3D plan only when supplied.
7. Features and amenities only when supplied.
8. Short lead form.
9. Related apartments.

CTA logic:
- `AVAILABLE` → `Demander une visite`.
- `COMING_SOON` → `Demander les conditions`.
- Other states → neutral information/contact CTA.

No mortgage or bank-credit simulation is part of the public journey.

### Services / About / Developers / Contact

Each page must answer:
- what ASAS does;
- who it is for;
- what evidence supports the proposition;
- what the safest next action is.

Use one dominant conversion action per section. Avoid repeated equal-weight buttons.

### Insights

Insights are useful only when they reduce uncertainty. Do not show article affordances for content that has no real article route. Search may filter the curated resources; empty search must recover clearly.

### Campaign landing

Campaign pages must consume truthful campaign/project data. No hardcoded scarcity, fake launch deadlines, invented offers or unsupported commercial claims.

## Responsive contract

- Mobile-first.
- Interactive controls: minimum 44px target.
- No horizontal page overflow.
- Sticky conversion surfaces must not overlap comparison or consent UI.
- Mobile forms use one-column flow and explicit validation.
- Galleries remain touch-friendly and keyboard accessible.
- Important decision information appears before secondary detail.
- Reduced-motion users must not receive unnecessary transitions.

## Content integrity contract

Never invent:
- project images;
- apartment images;
- availability;
- prices;
- delivery claims;
- testimonials;
- review counts;
- neighborhood statistics;
- developer identities;
- urgency/scarcity;
- financing rates or monthly-payment examples.

When data is missing, show a useful neutral state rather than filling the gap with marketing fiction.

## Validation contract

For every page change:

1. Inspect existing route/component/API contracts.
2. Implement the smallest coherent change.
3. Check visual hierarchy against the SVG reference.
4. Check keyboard and touch interaction.
5. Check loading/empty/error states.
6. Check responsive widths and fixed/sticky layers.
7. Run lint/typecheck/build.
8. Verify the Vercel deployment before claiming runtime success.
9. Record known limitations rather than hiding them.
