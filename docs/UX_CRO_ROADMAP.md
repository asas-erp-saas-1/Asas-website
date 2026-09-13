# ASAS UX / CRO Roadmap

**Version:** 1.6
**Date:** 2026-09-13
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `a6153bbea226c46e47288781e756a93311adb7a`

## Execution ledger

| Phase | Scope | Status | Exit condition |
|---|---|---|---|
| 1 | Deployment / type-contract stabilization | CLOSED | Original production blocker resolved |
| 2 | Database engineering / schema contract | ACTIVE in parallel | All engineering gates in `ENGINEERING_SOURCE_OF_TRUTH.md` green |
| 3 | Sales UX / UI / CRO | ACTIVE — final release audit | All Phase 3 gates in this document and `UX_CRO_SOURCE_OF_TRUTH.md` green |
| 4 | Measurement / CRO optimization | NOT STARTED | Phase 3 released and instrumentation verified |

## Current Phase 3 state

The public sales experience has been implemented across Home, Projects/Catalogue, Project Detail, Apartment Detail, Services, About, Developers, Contact, Insights, Campaign Landing and legal/utility routes. Shared conversion infrastructure includes `SiteShell`, `NavbarV3`, `FooterV3`, `StickyMobileCTA`, `CompareBar`, `LeadForm`, `SearchCommandPalette` and property recommendation/comparison flows.

The implementation follows the active ASAS sales journey:

`Visitor → Interest → Understanding → Trust → Qualified Lead → Conversation → Visit → Decision`

The remaining work is verification and evidence gathering, not speculative redesign.

## Completed implementation work

- Responsive viewport, overflow, focus, safe-area and reduced-motion hardening.
- Premium ASAS editorial visual system: ivory/white, charcoal, forest and restrained gold.
- Public catalogue discovery, search, project filters, apartment search, sorting and map handling.
- Explicit map handling for projects without usable coordinates.
- Project Detail Sales Room with truthful inventory semantics, including `AVAILABLE` vs `COMING_SOON`.
- Apartment Detail Decision Room with availability-aware CTA and lead-intent semantics.
- Shared mobile CTA/comparison layering deduplication.
- Homepage conversion hierarchy and truthful project proof.
- Services, About, Developers, Contact, Insights and legal/utility refinements.
- Campaign landing cleanup so commercial facts are not fabricated in static campaign definitions.
- Comparison/floor-plan interaction hardening.
- Bank-credit/mortgage simulation and obsolete public detail implementations removed from the active journey.
- Repository-native UI reference, implementation contract and AI/Codex operating contract added.

## Final release gates

### Visual / Figma
- [x] Repository-native visual reference exists and is versioned under `docs/ui-ux-reference/`.
- [x] Shared visual tokens and public component direction implemented in code.
- [ ] Editable Figma design-system synchronization.
  - Current Figma connection has **View** access only and no editable ASAS design-file key is available to this agent.
  - Do not treat the repository SVG/raster reference as a substitute for a real editable Figma source of truth.

### Property / business logic
- [x] Project detail uses real project/inventory data.
- [x] Apartment detail uses real apartment/status data.
- [x] `AVAILABLE` and `COMING_SOON` remain distinct.
- [x] Missing media/evidence produces neutral states rather than fabricated content.
- [x] Public mortgage/credit simulation is removed.

### Conversion
- [x] Context-aware lead form.
- [x] Availability-aware apartment actions.
- [x] Mobile sticky-action deduplication.
- [x] WhatsApp and phone escalation paths.
- [x] Comparison remains a separate decision utility.

### Trust / risk reduction
- [x] No fabricated testimonials, reviews, statistics or scarcity introduced.
- [x] Static campaign copy does not claim hardcoded price/availability/timing as live facts.
- [x] Human assistance is available near major decision points.
- [ ] Final independent page-by-page trust/proof review.

### Responsive / accessibility
- [x] Viewport and overflow foundation.
- [x] Mobile navigation safe-area behavior.
- [x] Key interactive controls use approximately 44px-class touch targets.
- [x] Focus-visible baseline and semantic landmarks.
- [ ] Full manual viewport matrix: 360/375/390/430/768/820/912/1024/1280/1366/1440/1536.

### Quality / deployment
- [x] Commit `a6153bbea226c46e47288781e756a93311adb7a` has Vercel combined status `success`.
- [x] Deployment `dpl_HJyM37zfXZ3zrHAcEq1ibCE83ZHY` is `READY`.
- [x] Latest preview root returned HTTP 200.
- [x] Latest deployment had no error/fatal preview runtime logs in the checked 24-hour window.
- [ ] Independent lint/typecheck evidence recorded outside the Vercel build result.
- [ ] Public journey smoke matrix completed for project, apartment, contact and campaign routes.

## Known engineering issue

Historical production runtime logs show an admin-only Prisma/schema mismatch involving `apartment_images.captionAr`. The active branch's `/api/admin/apartments` and `/api/admin/media` projections no longer request that absent legacy column. The underlying Supabase PostgreSQL schema still requires formal reconciliation before any migration is proposed. No blind `db push`, reset, or destructive migration is permitted.

## Release sequence

1. Finish final Projects/Catalogue audit.
2. Finish Project Detail and Apartment Detail verification.
3. Finish Services, About, Developers, Contact and Campaign audit.
4. Finish trust/risk-reduction review.
5. Finish responsive/accessibility/performance review.
6. Run and record lint/typecheck/build.
7. Verify Vercel `READY`.
8. Run public smoke tests.
9. Resolve any P0/P1 public defects.
10. Mark Phase 3 CLOSED only when all required gates are green.

## Phase 4

Phase 4 begins only after Phase 3 release. It is evidence-driven CRO rather than another broad visual rewrite:

`Instrumentation → Baseline → Hypothesis → Experiment → Measurement → Decision → Iteration`

No conversion-rate claim is valid without verified measurement data.
