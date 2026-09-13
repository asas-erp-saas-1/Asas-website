# ASAS Admin — Current UX/UI Execution State

**Branch:** `feat/admin-ux-ui-foundation`

**Current HEAD at this documentation update:** `805fe88f581b963980bb5cb126f5b0d1491b9f31`

## Completed in this UX/UI wave

- Figma operational reference created and accessible:
  `https://www.figma.com/design/G4zoKNzl1FBcN2kxrNikwk`
- Seven reference surfaces established: Executive Dashboard, Projects, Project Detail, Buildings, Apartments, Apartment Detail and Leads.
- Repository UI reference layer added and loaded after the existing Admin UX foundation.
- Operational visual language now covers hierarchy, table scanning, detail context, sticky toolbars, responsive data surfaces, focus behavior, async feedback space, skeleton treatment and reduced-motion behavior.
- Apartment mutation hydration issue repaired so successful detail mutations do not collapse the entity context into a reduced response.
- A shared `AdminRoleProvider` is mounted at the stable Admin shell and derives `role`, `canMutate` and `canAdminister` from `/api/admin/me`.
- Role-aware UX presentation is explicit for the canonical role model: `ADMIN`, `EDITOR`, `VIEWER`. VIEWER receives a read-only notice while server-side authorization remains the security boundary.
- Unknown role values are treated as non-mutating and are not silently mapped to a fabricated role.
- Admin role/capability state is exposed on the workspace DOM (`data-admin-role`, `data-admin-can-mutate`, `data-admin-role-loading`) for future action-level presentation without coupling business authorization to CSS.
- UX/UI execution method documented in `docs/ASAS_ADMIN_UX_UI_EXECUTION_METHOD.md`.

## Important role-model correction

The PostgreSQL Prisma contract and `src/lib/admin-auth.ts` define the supported Admin roles as `ADMIN`, `EDITOR`, and `VIEWER`. The initial UX provider used an unsupported `STAFF` role label. That mismatch was corrected before further permission-aware UI work.

The client role layer remains advisory. It does not replace server-side authorization and it must not invent additional roles.

## Engineering constraints

- Admin styling is scoped to `body.admin-mode`.
- Public-site visual behavior must remain isolated.
- Status/readiness must remain evidence-backed.
- Reservation, Contract and Payment UI must not imply unsupported backend capabilities.
- URL/entity context remains authoritative for workspace navigation.
- No destructive production database changes are part of UX work.
- Client-side role presentation is advisory only; every mutation must continue to be protected by server-side authorization.

## Verification

- CI run `#1013` on the prior exact implementation/documentation head completed successfully: Prisma generation, baseline generation/verification/upload, Typecheck, Lint and Build.
- The role-model correction after that CI run is now at a new HEAD and requires exact-head CI before being treated as certified.
- Browser certification remains blocked until browser automation is available. No visual runtime verification is claimed without it.

## Next coherent UX gate

1. Obtain exact-head CI evidence for the role-model correction.
2. Apply explicit action capability markers to the highest-value Project, Building, Apartment and Lead mutation controls so VIEWER sees a consistent read-only surface rather than relying on button text or DOM position.
3. Finish responsive/RTL review across Project, Building, Apartment and Lead surfaces.
4. Regression-check Project → Building → Apartment and Lead → Project/Apartment entity navigation and context isolation.
5. Audit lifecycle/publication semantics and unsupported Reservation boundary.
6. Perform browser certification when browser automation is available.
