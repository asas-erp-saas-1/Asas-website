# ASAS Admin — Current UX/UI Execution State

**Branch:** `feat/admin-ux-ui-foundation`
**PR:** #7
**Current implementation HEAD:** `1e833a68bccf7155ff106615ae152d103c6ee79c`

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
- Apartment now consumes the shared `AdminRoleProvider` rather than maintaining a duplicate client role fetch.
- List publication control is enabled only for `ADMIN`/`EDITOR`.
- List archive control is enabled only for `ADMIN`.
- Detail price editing, status selection/application and publication are disabled for `VIEWER`.
- Mutation handlers re-check `canMutate` / `canAdminister` before requests.
- Publication readiness and the existing apartment mutation lifecycle remain preserved.
- Read-only users retain apartment identity, project/building context, navigation and operational information.

### Lead
- Lead now consumes the shared role context.
- Lead status changes and internal-note creation are treated as mutations and are disabled for `VIEWER`.
- Lead mutation handlers re-check the shared capability before requests.
- Project/apartment navigation, contact links, filtering and operational context remain available read-only.
- `assignedTo` and `followUpDate` are currently displayed fields rather than verified writable capabilities in this workspace; no unsupported assignment/follow-up API was invented.

## URL/navigation contract

- Admin workspace, filters, pagination and entity context are URL-derived and recoverable.
- A defect was identified in hash-route parsing: a query string on `#/admin/<workspace>?…` was previously included in the workspace capture, causing valid filtered workspace URLs to fall back to `dashboard`.
- Commit `1e833a68bccf7155ff106615ae152d103c6ee79c` separates the hash path from its query before workspace normalization, preserving the existing URL contract while making filtered/deep-linked hash routes parse correctly.

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

- Vercel status for previous exact HEAD `27d28b73bda1a8680605bf288ff5901cac0def00`: **success**.
- New route-parser commit `1e833a68bccf7155ff106615ae152d103c6ee79c` currently has no reported GitHub status/workflow run; no CI pass is claimed yet.
- Browser certification remains blocked: `VISUAL VALIDATION BLOCKED — browser automation is not available in this execution context.`

## Next coherent UX gate

1. Verify exact-head CI/Vercel for `1e833a68bccf7155ff106615ae152d103c6ee79c`.
2. Audit cross-entity deep-link behavior and context isolation across Project → Building → Apartment → Lead.
3. Audit mutation/error/loading lifecycle consistency across the four operational workspaces.
4. Continue responsive/RTL/accessibility review and preserve evidence-backed lifecycle semantics.
5. Browser certification when browser automation is available.