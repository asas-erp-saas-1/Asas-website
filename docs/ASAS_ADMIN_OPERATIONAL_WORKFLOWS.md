# ASAS Admin — Operational Workflow Contracts

## 1. Project Operations

### Create
Preconditions: authorized operator. Inputs: identity, location, commercial/publication metadata. Success: persistent project context. Failure: preserve draft and expose field/server errors.

### Complete information
Track completeness by required operational sections, not by arbitrary form length. A project is publish-ready only when its required identity, structure, inventory, commercial, media and publication prerequisites are satisfied.

### Add buildings / apartments
Creation must inherit project context. The child record must remain navigable to its parent and the parent must expose its inventory relationship.

### Inventory / pricing / media / publication
These are separate operational capabilities. Do not couple them into one mutation. Pricing and publication are consequential actions and require explicit feedback and safe recovery.

## 2. Building Operations

A building belongs to a project. The workspace must show project context, structural data and apartment inventory. An orphan building must be treated as an integrity problem, not a normal empty state.

## 3. Apartment Operations

The apartment editor is organized around: identity/context → physical specification → commercial data → availability → plans/media → publication → lifecycle. Project and building assignment are first-class context, not hidden implementation details.

## 4. Customer Operations

Lead intake creates the customer context. Qualification determines commercial readiness. Assignment determines ownership. Follow-up and activity establish continuity. Property Interest connects the lead to project/apartment inventory. Negotiation records commercial progression. Reservation must require confirmed availability. Conversion/Loss closes the commercial outcome with an auditable reason.

## 5. Contextual Navigation Contract

Every child entity view should provide parent context and relevant downstream entities. From Project, operators can reach Buildings, Apartments and Leads/interest where supported. From Building, operators can reach Project and Apartments. From Apartment, operators can reach Project, Building, availability and customer interest/reservation. From Lead, operators can reach interested inventory and reservation state.

## 6. Mutation Contract

idle → validating → submitting → success | recoverable-error. Mutations must be protected from duplicate submission, preserve user input on recoverable failure, invalidate affected server state and communicate the resulting state explicitly.

## 7. No-Fabrication Rule

Operational readiness must be computed only from data actually available to the application. Do not invent completion, availability, publication or conversion states merely to improve UI appearance.
