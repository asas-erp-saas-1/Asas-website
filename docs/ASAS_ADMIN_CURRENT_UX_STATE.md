# ASAS Admin — Current UX/UI Execution State

**Branch:** `feat/admin-ux-ui-foundation`
**PR:** #7
**Current implementation HEAD:** `0b473ad3298a1e02a0a460b9a073f55a2c3b2f80`

## Completed in this UX/UI wave

- Figma operational reference established: `https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk`.
- Admin reference surfaces cover Executive Dashboard, Projects, Project Detail, Buildings, Apartments, Apartment Detail and Leads.
- Scoped Admin visual reference layer covers hierarchy, tables, detail context, sticky actions, responsive data surfaces, focus treatment, async feedback, skeletons, reduced motion, RTL and long-string protection.
- Shared `AdminRoleProvider` is mounted at the stable Admin shell and exposes `role`, `canMutate` and `canAdminister` from `/api/admin/me`.
- Supported client roles are `ADMIN`, `EDITOR`, `VIEWER`; unknown roles remain non-mutating.
- VIEWER receives an explicit read-only notice while server-side authorization remains authoritative.

## Action-level permission presentation

### Project
- List publish/unpublish and archive controls are disabled for read-only roles with explicit permission explanation.
- Detail price/publication mutations are disabled for read-only roles.
- Creation fields and submit action are disabled for read-only roles.
- Mutation handlers re-check the shared capability before requests.
- Read-only users retain search, filters, navigation, pagination and operational context.

### Building
- List/create and detail/edit consume the shared `canMutate` capability.
- Read-only users retain search, filters, refresh, entity navigation and apartment navigation.
- Editable fields and mutation controls are disabled for read-only roles.
- Create/save handlers re-check `canMutate` before POST/PATCH execution.
- Detail mode explains the read-only restriction without removing context.

### Apartment
The current Apartment workspace already presents action-level mutation restrictions in the implementation:
- List publication control is enabled only for `ADMIN`/`EDITOR`.
- List archive control is enabled only for `ADMIN`.
- Detail price editing, status selection/application and publication are disabled for `VIEWER`.
- Publication readiness is checked before exposing a publish mutation path.
- Existing apartment mutation lifecycle (`validating → submitting → success/recoverable-error`) remains in use.
- Read-only users retain apartment identity, project/building context, navigation and operational information.

### Important Apartment engineering debt
`AdminApartmentsWorkspace.tsx` still performs its own `/api/admin/me` role fetch instead of consuming `AdminRoleProvider`. This is a client-side capability duplication, not a server authorization gap. The next refinement should converge Apartment on the shared provider and add explicit capability re-checks inside detail/list mutation handlers without changing the server contract.

### Lead
Lead status, follow-up and assignment mutation presentation remains the next permission gate. Do not fabricate reservation/contract/payment behavior.

## Role model

The supported Admin roles are `ADMIN`, `EDITOR`, `VIEWER`. Do not introduce `STAFF`. Client capability state is advisory; server-side authorization remains the security boundary.

## Engineering constraints

- Admin styling remains scoped to `body.admin-mode`.
- Public-site visual behavior remains isolated.
- Status/readiness must remain evidence-backed.
- Reservation, Contract and Payment UI must not imply unsupported backend capabilities.
- URL/entity context remains authoritative for workspace navigation.
- No destructive production database changes are part of UX work.

## Verification

- Vercel status for implementation HEAD `0b473ad3298a1e02a0a460b9a073f55a2c3b2f80`: **success**.
- No claim of full workflow CI success is made from this status alone.
- Browser certification remains blocked: `VISUAL VALIDATION BLOCKED — browser automation is not available in this execution context.`

## Next coherent UX gate

1. Converge Apartment role consumption on `AdminRoleProvider` and harden handler-level capability checks.
2. Apply the same capability contract to Lead status/follow-up/assignment controls.
3. Finish responsive/RTL review across Project, Building, Apartment and Lead surfaces.
4. Regression-check cross-entity navigation and context isolation.
5. Audit lifecycle/publication semantics and unsupported Reservation boundary.
6. Browser certification when browser automation is available.
