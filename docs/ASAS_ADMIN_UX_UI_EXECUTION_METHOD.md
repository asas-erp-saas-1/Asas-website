# ASAS Admin — UX/UI Execution Method

## Purpose

This is the working method for evolving the Admin Console from a functional CRUD surface into an operational real-estate workspace.

## 1. Business model first

UX is derived from the operating model, not from isolated screens.

- Site Operations: Project → Building → Apartment → Availability
- Customer Operations: Lead → Follow-up → Interest → Negotiation → Reservation → Conversion/Loss
- Cross-context relationships are explicit and deep-linkable.

Unsupported capabilities must not be represented as if they exist. Reservation, Contract and Payment UI remains evidence-gated until the backend contract exists.

## 2. Screen contract

Every workspace is reviewed through the same sequence:

1. Context — where am I and what entity am I operating on?
2. Evidence — what persisted data is actually known?
3. State — what is the current operational state?
4. Primary action — what is the highest-value next action?
5. Preconditions — what blocks that action?
6. Mutation — what changes on the server?
7. Feedback — success, failure, retry and pending state.
8. Recovery — how does the user recover without losing context?
9. Relationships — what related entities can be opened next?
10. Auditability — can the action be explained later?

## 3. Visual system

Use the ASAS Admin visual language:

- warm ivory workspace background
- white operational panels
- forest green for primary actions and positive operational state
- restrained gold for attention and commercial emphasis
- charcoal primary text and muted secondary text
- compact, information-dense tables without sacrificing readability
- consistent focus states and 44px mobile interaction targets
- reduced-motion support

The visual system is scoped to `body.admin-mode`; public website surfaces must not inherit Admin styling.

## 4. Responsive method

Validate design intent at:

- 360–430px: mobile operational execution
- 768–1024px: tablet / compact desktop
- 1280–2560px: full workstation

Do not solve desktop density by forcing mobile users into horizontally clipped controls. Tables may preserve semantic columns inside a deliberate horizontal scroll container.

## 5. Localization method

Every relevant screen must remain coherent in:

- French LTR
- English LTR
- Arabic RTL

Never position essential controls using assumptions about text width or direction.

## 6. Data-density method

For lists, optimize for scanning and decision-making:

- stable column hierarchy
- explicit status
- meaningful primary identifier
- related entity context
- one obvious row action
- filters that persist in URL state
- pagination for bounded retrieval
- empty/loading/error states

Do not fabricate totals, readiness, availability, reservations or financial values.

## 7. Figma → implementation loop

Figma is the visual reference, not a substitute for application behavior.

1. Model business context.
2. Define the screen contract.
3. Create/reference the visual composition in Figma.
4. Translate the composition into existing ASAS components and tokens.
5. Preserve the real API/data contracts.
6. Add responsive and RTL behavior.
7. Run typecheck/lint/build.
8. Compare the implementation against the reference.
9. Record deviations and fix them in the next coherent slice.

Current Figma reference: `https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk`

## 8. Engineering gates

No UX slice is considered complete until:

- static gates are green
- mutation state is recoverable
- route/entity context is stable
- no unsupported business state is displayed
- public styling is unaffected
- repository documentation records the decision

Browser certification is a separate gate. If browser automation is unavailable, report the limitation explicitly rather than claiming visual verification.

## 9. Current priority order

1. Cross-workspace navigation integrity
2. Entity detail completeness
3. Mutation and recovery UX
4. Permission-aware action presentation
5. Responsive data surfaces
6. Localization / RTL
7. Accessibility
8. Performance at realistic data volume
9. Visual polish

This order prevents cosmetic work from masking operational defects.
