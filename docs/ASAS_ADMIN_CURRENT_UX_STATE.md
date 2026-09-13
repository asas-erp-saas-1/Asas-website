# ASAS Admin — Current UX/UI Execution State

**Branch:** `feat/admin-ux-ui-foundation`

**Current HEAD at this documentation update:** `6e74a57c4bfe453a79943bc220a692c62755c599`

## Completed in this UX/UI wave

- Figma operational reference created and accessible:
  `https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk`
- Seven reference surfaces established: Executive Dashboard, Projects, Project Detail, Buildings, Apartments, Apartment Detail and Leads.
- Repository UI reference layer added and loaded after the existing Admin UX foundation.
- Operational visual language now covers hierarchy, table scanning, detail context, sticky toolbars, responsive data surfaces, focus behavior, async feedback space, skeleton treatment and reduced-motion behavior.
- Apartment mutation hydration issue repaired so successful detail mutations do not collapse the entity context into a reduced response.
- A shared `AdminRoleProvider` is mounted at the stable Admin shell and derives `role`, `canMutate` and `canAdminister` from `/api/admin/me`.
- Role-aware UX presentation is explicit: STAFF users receive a read-only notice while server-side authorization remains the security boundary.
- Admin role/capability state is exposed on the workspace DOM (`data-admin-role`, `data-admin-can-mutate`, `data-admin-role-loading`) for future action-level presentation without coupling business authorization to CSS.
- Read-only notice styling is now part of the scoped Admin UX reference layer, with loading suppression to avoid a false permission state during role resolution.
- UX/UI execution method documented in `docs/ASAS_ADMIN_UX_UI_EXECUTION_METHOD.md`.

## Engineering constraints

- Admin styling is scoped to `body.admin-mode`.
- Public-site visual behavior must remain isolated.
- Status/readiness must remain evidence-backed.
- Reservation, Contract and Payment UI must not imply unsupported backend capabilities.
- URL/entity context remains authoritative for workspace navigation.
- No destructive production database changes are part of UX work.
- Client-side role presentation is advisory only; every mutation must continue to be protected by server-side authorization.

## Verification

- Previous implementation HEAD `610333269c4e7ddf31e2678c97fbdf6b29259d3a`: CI `#975` passed Prisma generation, baseline generation/verification/upload, Typecheck, Lint and Build.
- HEAD `a251f0a287a82551ad17fe6d31fc07e797256065`: CI `#1001` completed successfully.
- The latest role-aware implementation and UX CSS commits require exact-HEAD CI evidence after this documentation update.

Browser certification remains blocked until browser automation is available. No visual runtime verification is claimed without it.

## Next coherent UX gate

1. Run exact-HEAD CI for `6e74a57c4bfe453a79943bc220a692c62755c599`.
2. Apply explicit action capability markers to the highest-value Project, Building, Apartment and Lead mutation controls so STAFF sees a consistent read-only surface rather than relying on button text or DOM position.
3. Finish responsive/RTL review across Project, Building, Apartment and Lead surfaces.
4. Regression-check Project → Building → Apartment and Lead → Project/Apartment entity navigation and context isolation.
5. Audit lifecycle/publication semantics and unsupported Reservation boundary.
6. Perform browser certification when browser automation is available.
