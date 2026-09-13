# ASAS Admin — Current UX/UI Execution State

**Branch:** `feat/admin-ux-ui-foundation`

**Current HEAD at this documentation update:** `a53ad50cdd00f8a3f5f51d6df3aa799374e363d3`

## Completed in this UX/UI wave

- Figma operational reference created and accessible: `https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk`.
- Seven reference surfaces established: Executive Dashboard, Projects, Project Detail, Buildings, Apartments, Apartment Detail and Leads.
- Repository UI reference layer added and loaded after the existing Admin UX foundation.
- Operational visual language covers hierarchy, table scanning, detail context, sticky toolbars, responsive data surfaces, focus behavior, async feedback space, skeleton treatment and reduced-motion behavior.
- Apartment mutation hydration issue repaired so successful detail mutations do not collapse entity context.
- Shared `AdminRoleProvider` is mounted at the stable Admin shell and derives `role`, `canMutate` and `canAdminister` from `/api/admin/me`.
- Supported client roles are `ADMIN`, `EDITOR`, `VIEWER`; unknown roles remain non-mutating.
- VIEWER receives an explicit read-only notice while server-side authorization remains authoritative.
- Project list, Project detail and Project creation consume the shared `canMutate` capability at the actual mutation controls.
- Building list/create and Building detail/edit now consume the same shared `canMutate` capability.

## Action-level permission presentation — current state

### Project list
- Publish/unpublish control is disabled for non-mutating roles.
- Archive control is disabled for non-mutating roles.
- Disabled controls expose a read-only explanation through title/accessible label semantics.
- Mutation execution re-checks `canMutate` before sending a request.
- Navigation, search, filters, pagination, refresh and recovery remain available to read-only users.

### Project detail
- Price input and save action are disabled for non-mutating roles.
- Publish/unpublish actions are disabled for non-mutating roles.
- Mutation function re-checks `canMutate` before execution.

### Project creation
- Read-only users retain context and can return to the project workspace.
- Creation fields and submit action are disabled for non-mutating roles.
- Submit handler refuses execution when capability is absent.

### Building list/create
- Read-only users retain search, filters, refresh and entity navigation.
- Building creation is disabled for non-mutating roles.
- Creation dialog fields and submit action are disabled for non-mutating roles.
- Create handler re-checks `canMutate` before POST execution.

### Building detail/edit
- Read-only users retain entity identity and associated apartment navigation.
- Building edit fields and save action are disabled for non-mutating roles.
- Detail save handler re-checks `canMutate` before PATCH execution.
- A visible read-only notice explains that the entity remains consultable but not editable.

### Remaining domains
Apartment and Lead mutation presentation still require the same capability-oriented treatment. Do not duplicate `/api/admin/me` role fetching where the shared provider can be consumed.

## Important role-model correction

The PostgreSQL Prisma contract and `src/lib/admin-auth.ts` define supported Admin roles as `ADMIN`, `EDITOR`, and `VIEWER`. Do not introduce `STAFF` as a client role. The client role layer is advisory and never replaces server-side authorization.

## Engineering constraints

- Admin styling is scoped to `body.admin-mode`.
- Public-site visual behavior remains isolated.
- Status/readiness remains evidence-backed.
- Reservation, Contract and Payment UI must not imply unsupported backend capabilities.
- URL/entity context remains authoritative for workspace navigation.
- No destructive production database changes are part of UX work.
- Every mutation remains server-authorized.

## Verification

- Prior exact-head CI run `#1013` was successful for the previous role-foundation implementation.
- CI run `#1027` was in progress for the previous exact head `5161202651eb530594f284875d0c99ffa58e629c`.
- No CI run has yet been returned for `a53ad50cdd00f8a3f5f51d6df3aa799374e363d3`; no pass is claimed.
- Browser certification remains blocked: `VISUAL VALIDATION BLOCKED — browser automation is not available in this execution context.`

## Next coherent UX gate

1. Obtain exact-head CI evidence for the building permission commit.
2. Apply the same contract to Apartment list/detail/status/price/publication controls while reusing the existing mutation lifecycle.
3. Apply the same contract to Lead status/follow-up/assignment controls.
4. Finish responsive/RTL review across Project, Building, Apartment and Lead surfaces.
5. Regression-check Project → Building → Apartment and Lead → Project/Apartment navigation and context isolation.
6. Audit lifecycle/publication semantics and unsupported Reservation boundary.
7. Browser certification when browser automation is available.
