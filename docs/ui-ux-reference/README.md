# ASAS UI/UX visual reference

![ASAS platform master visual reference](./ASAS_UI_UX_MASTER.jpg)

## Purpose

This directory is the visual source of truth for the public ASAS Immobilier experience. The generated board is the visual baseline to compare against during implementation and QA.

## Routes represented in the master board

| # | Route | Visual objective |
|---|---|---|
| 01 | Home | Editorial discovery, real-project proof, one dominant next action |
| 02 | Projects / catalogue | Search, filtering, inventory discovery and map context |
| 03 | Project detail | Desire → proof → inventory → risk reduction → conversation |
| 04 | Apartment detail | Emotional opening → decision facts → visual proof → visit request |
| 05 | Services | Premium advisory positioning and clear commercial process |
| 06 | About | Brand trust, mission, values and human credibility |
| 07 | For developers | B2B proposition, proof, process and contact |
| 08 | Contact | Low-friction contact, qualification and location/context |
| 09 | Insights / blog | Editorial content discovery and trust building |
| 10 | Legal | Clear, readable, restrained utility experience |
| 11 | Campaign landing | Focused acquisition experience without competing navigation |
| 12 | Privacy / Terms | Legible legal information with the same brand system |
| 13 | Not found / utility | Helpful recovery path, not a dead end |

## Responsive contract

Every page must be reviewed at these exact classes of viewport:

- **Mobile:** 360, 375, 390 and 430 px widths
- **Tablet:** 768, 820, 912 and 1024 px widths
- **Desktop:** 1280 and 1366 px widths
- **Large desktop:** 1440 and 1536 px widths

The layout must adapt intentionally; it must not simply shrink the desktop composition.

### Mobile requirements

- Thumb-safe controls and minimum 44 px interactive targets where practical.
- No horizontal overflow.
- Sticky primary CTA only when it improves the current decision step.
- Navigation becomes a focused sheet/menu.
- Cards collapse to a readable single-column hierarchy.
- Images preserve meaningful crops; no distorted property imagery.
- Forms remain short, scannable and keyboard-friendly.

### Tablet requirements

- Preserve editorial hierarchy while using available width efficiently.
- Avoid awkward two-column layouts that become cramped.
- Gallery, inventory and maps must have deliberate intermediate states.
- Navigation and CTA hierarchy must remain identical to the approved desktop intent.

### Desktop requirements

- Large editorial typography and architectural imagery.
- Generous whitespace and restrained borders/shadows.
- Strong alignment grid and consistent content measure.
- One dominant conversion action per decision section.

## Visual system

- Ivory / white backgrounds
- Charcoal typography and navigation
- Forest green for premium brand emphasis
- Restrained gold for accents and primary conversion emphasis
- Editorial serif display typography paired with clean UI typography
- Architectural photography and real inventory imagery only
- No SaaS/dashboard visual language on buyer-facing pages
- No gradients/blobs/excessive animation as decorative substitutes for hierarchy

## Data integrity

The visuals are a design reference, not permission to fabricate content. The implementation must use the actual ASAS data layer. Never invent prices, availability, apartment images, testimonials, statistics, maps, neighbourhood facts or developer claims.

## Conversion architecture

Visitor → Interest → Understanding → Trust → Qualified lead → Conversation → Visit → Decision.

The public experience must make the safest next step obvious at every stage. Primary actions should be property discovery, availability, contact, qualification or visit requests as appropriate to the page.

## Explicit exclusion

**Bank-credit / mortgage simulation is removed from the public platform.** Do not reintroduce mortgage calculators, monthly-payment simulation, interest-rate inputs, down-payment calculators or financing widgets into the public buyer journey.

## Implementation protocol

1. Compare the current route against the master visual.
2. Rebuild the hierarchy before polishing details.
3. Implement desktop, tablet and mobile states explicitly.
4. Preserve real business logic and API contracts.
5. Validate at the viewport matrix above.
6. Run lint, typecheck and production build.
7. Verify the deployed route and critical interactions before marking the page complete.
