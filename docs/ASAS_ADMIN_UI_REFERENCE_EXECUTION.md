# ASAS Admin UI Reference — Execution Log

## Current slice
Generated a professional UI reference in Figma from the verified Admin operational model and stored a repository-preview artifact.

## Editable design source
https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk

## Screens generated
- Executive Dashboard
- Projects
- Project Detail
- Buildings
- Apartments
- Apartment Detail
- Leads

## Business logic represented
- Site Operations: Project → Building → Apartment → Availability.
- Customer Operations: Lead → Follow-up → Interest → Negotiation → Reservation boundary.
- Entity detail views expose parent/child context and real navigation relationships.
- Publication is shown as an outcome gated by actual completeness signals.
- Status changes are constrained by the canonical transition graph.
- Unsupported Reservation / Contract / Payment execution is intentionally not fabricated.
- Mutation UX is designed around permission → validation → submit → feedback → recovery → audit.

## Visual system
Warm neutral workspace; charcoal navigation; forest-green primary actions; restrained gold emphasis; dense readable tables; explicit state badges; strong detail-page grouping; responsive hierarchy rather than desktop shrinkage.

## Repository preview
`docs/ui-reference/asas-admin-ui-contact-sheet.svg`

## Engineering limitation
The editable Figma source is the high-fidelity visual reference. Browser certification remains blocked because browser automation is not available in this execution context.

## Next engineering gate
1. Reconcile Apartment detail mutation response with hydrated detail state by refetching canonical GET detail after successful mutation.
2. Regression-check Building → Apartment and Lead → Project / Apartment navigation.
3. Run exact-head CI after the next coherent implementation slice.
