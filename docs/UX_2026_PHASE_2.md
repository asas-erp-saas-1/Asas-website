# ASAS Website — UX 2026 Phase 2

## Scope

This phase focuses on the property-discovery surface: project cards, search results, availability communication, imagery, accessibility, and conversion-oriented interaction patterns.

## Implemented

- Project cards are semantic `<article>` components rather than interactive containers with nested controls.
- Project navigation is exposed through explicit keyboard-accessible buttons in the card title and primary CTA.
- Favorite remains an independent button and no longer depends on a card-level `role="button"` interaction model.
- Project images now reserve explicit dimensions and use responsive `sizes` plus asynchronous decoding for below-the-fold cards.
- Missing project imagery is represented as a neutral state instead of silently substituting a potentially unrelated brand image.
- Availability counts distinguish `AVAILABLE` units from `RESERVED` units; `COMING_SOON` is not counted as currently available.
- Project image alt text contains the real project name and location fields already present in the data model.
- Hover treatment was restrained to avoid excessive motion while preserving discoverability.

## Data integrity rule

No project, apartment, price, availability, delivery date, testimonial, performance metric, or marketing claim is fabricated by this phase. All displayed property information remains sourced from the existing application data model/API.

## Performance basis

The image strategy follows current web performance guidance: below-the-fold images should be lazy loaded, important images should receive higher loading priority only when appropriate, and responsive sizing reduces unnecessary transfer. See:

- https://web.dev/learn/design/responsive-images
- https://web.dev/learn/images/performance-issues
- https://web.dev/articles/fetch-priority

## Routing note

The current `src/lib/router.ts` already emits semantic paths such as `/projects/[slug]` and `/projects/[slug]/apartments/[slug]`. The older Phase 4 routing document describes hash routing and should be reconciled with the current implementation in a later documentation-cleanup pass.

## Next UX targets

1. Projects search/filter hierarchy on mobile.
2. Project detail hero and availability summary.
3. Apartment detail conversion flow and price/availability clarity.
4. Gallery/floor-plan interaction and media performance.
5. Lead forms and WhatsApp/visit-request conversion paths.
6. Cross-page accessibility and keyboard navigation audit.
