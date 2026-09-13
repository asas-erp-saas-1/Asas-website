# ASAS Admin — Current UX/UI Execution State

**Branch:** `feat/admin-ux-ui-foundation`

**Current HEAD at this documentation update:** `996392cadeca63e1757590cf329135a21c077a55`

## Completed in this UX/UI wave

- Figma operational reference created and accessible: `https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk`.
- Seven reference surfaces established: Executive Dashboard, Projects, Project Detail, Buildings, Apartments, Apartment Detail and Leads.
- Repository UI reference layer added and loaded after the existing Admin UX foundation.
- Operational visual language covers hierarchy, table scanning, detail context, sticky toolbars, responsive data surfaces, focus behavior, async feedback space, skeleton treatment and reduced-motion behavior.
- Apartment mutation hydration issue repaired so successful detail mutations do not collapse entity context.
- Shared `AdminRoleProvider` is mounted at the stable Admin shell and derives `role`, `canMutate` and `canAdminister` from `/api/admin/me`.
- Supported client roles are `ADMIN`, `EDITOR`, `VIEWER`; unknown roles remain non-mutating.
- VIEWER receives an explicit read-only notice while server-side authorization remains authoritative.
- Project list, Project detail and Project creation now consume the shared `canMutate` capability at the actual mutation controls.

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

### Remaining domains
Building, Apartment and Lead mutation presentation still require the same capability-oriented treatment. Do not duplicate `/api/admin/me` role fetching where the shared provider can be consumed.

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
- The current permission-presentation commits have no returned exact-head CI run yet; no pass is claimed.
- Browser certification remains blocked: `VISUAL VALIDATION BLOCKED — browser automation is not available in this execution context.`

## Next coherent UX gate

1. Obtain exact-head CI evidence for `996392cadeca63e1757590cf329135a21c077a55`.
2. Apply action-level capability presentation to Building mutation controls.
3. Apply the same contract to Apartment list/detail/status/price/publication controls while reusing the existing mutation lifecycle.
4. Apply the same contract to Lead status/follow-up/assignment controls.
5. Finish responsive/RTL review across Project, Building, Apartment and Lead surfaces.
6. Regression-check Project → Building → Apartment and Lead → Project/Apartment navigation and context isolation.
7. Audit lifecycle/publication semantics and unsupported Reservation boundary.
8. Browser certification when browser automation is available.
