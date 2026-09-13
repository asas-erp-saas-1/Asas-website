# ASAS UX / CRO Roadmap

**Version:** 1.6
**Date:** 2026-09-13
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `a21356aea7263189476470f43603581717c6a55f`

## Execution ledger

| Phase | Scope | Status | Exit condition |
|---|---|---|---|
| 1 | Deployment / type-contract stabilization | CLOSED | Original production blocker resolved |
| 2 | Database engineering / schema contract | ACTIVE in parallel | All engineering gates in `ENGINEERING_SOURCE_OF_TRUTH.md` green |
| 3 | Sales UX / UI / CRO | ACTIVE — final release audit | All Phase 3 gates in this document and `UX_CRO_SOURCE_OF_TRUTH.md` green |
| 4 | Measurement / CRO optimization | NOT STARTED | Phase 3 released and instrumentation verified |

## Current state

Public sales UX is implemented across Home, Projects/Catalogue, Project Detail, Apartment Detail, Services, About, Developers, Contact, Insights, Campaign Landing and legal/utility routes. Shared conversion infrastructure includes `SiteShell`, `NavbarV3`, `FooterV3`, `StickyMobileCTA`, `CompareBar`, `LeadForm`, `SearchCommandPalette` and property recommendation/comparison flows.

Remaining work is verification/evidence gathering, not speculative redesign.

## Completed implementation

- Premium ASAS editorial visual system: ivory/white, charcoal, forest and restrained gold.
- Responsive viewport, overflow, focus, safe-area and reduced-motion hardening.
- Public catalogue search, filters, sorting, apartment search and map handling.
- Explicit empty-coordinate handling for maps.
- Project Detail Sales Room with truthful `AVAILABLE` vs `COMING_SOON` inventory semantics.
- Apartment Detail Decision Room with status-aware actions.
- Shared mobile CTA/comparison layering deduplication.
- Homepage conversion hierarchy and truthful project proof.
- Services, About, Developers, Contact, Insights and legal/utility refinements.
- Campaign landing cleanup so hardcoded commercial facts are not presented as live facts.
- Comparison/floor-plan interaction hardening.
- Bank-credit/mortgage simulation and obsolete public detail implementations removed.
- Repository-native UI reference, implementation contract and AI/Codex operating contract added.

## Final release gates

### Visual / Figma
- [x] Repository-native visual reference is versioned under `docs/ui-ux-reference/`.
- [x] Shared visual tokens and public component direction implemented in code.
- [ ] Editable Figma design-system synchronization. Current Figma connection is **View-only** and no editable ASAS design-file key is available to this agent.

### Property / business logic
- [x] Project and apartment pages use real catalog data.
- [x] `AVAILABLE` and `COMING_SOON` remain distinct.
- [x] Missing media/evidence produces neutral states.
- [x] Public mortgage/credit simulation is removed.

### Conversion
- [x] Context-aware lead form.
- [x] Status-aware apartment actions.
- [x] Mobile sticky-action deduplication.
- [x] WhatsApp and phone escalation paths.
- [x] Comparison remains a separate decision utility.

### Trust / risk reduction
- [x] No fabricated testimonials, reviews, statistics or scarcity introduced.
- [x] Static campaign copy does not claim hardcoded price/availability/timing as live facts.
- [x] Human assistance is available near decision points.
- [ ] Final independent page-by-page trust/proof review.

### Responsive / accessibility
- [x] Viewport and overflow foundation.
- [x] Mobile navigation safe-area behavior.
- [x] Key interactive controls use approximately 44px-class touch targets.
- [x] Focus-visible baseline and semantic landmarks.
- [ ] Full manual viewport matrix: 360/375/390/430/768/820/912/1024/1280/1366/1440/1536.

### Quality / deployment
- [x] Commit `a6153bbea226c46e47288781e756a93311adb7a1` reached Vercel `READY`.
- [x] Vercel combined status for that commit is `success`.
- [x] Latest preview root returned HTTP 200.
- [x] Latest deployment had no error/fatal preview runtime logs in the checked 24-hour window.
- [ ] Independent lint/typecheck evidence recorded outside the Vercel build.
- [ ] Public journey smoke matrix completed for project, apartment, contact and campaign routes.

## Known engineering issue

Historical production runtime logs show an admin-only Prisma/schema mismatch involving `apartment_images.captionAr`. The active branch's affected admin GET projections no longer request that absent legacy column. The underlying Supabase PostgreSQL schema still requires formal reconciliation before any migration is proposed. No blind `db push`, reset or destructive migration is permitted.

## Release sequence

1. Finish final catalogue audit.
2. Verify Project Detail and Apartment Detail.
3. Verify Services, About, Developers, Contact and Campaign.
4. Finish trust/risk-reduction review.
5. Finish responsive/accessibility/performance review.
6. Run and record lint/typecheck/build.
7. Verify Vercel `READY`.
8. Run public smoke tests.
9. Resolve P0/P1 public defects.
10. Mark Phase 3 CLOSED only when all required gates are green.

## Phase 4

After Phase 3 release, begin evidence-driven CRO:

`Instrumentation → Baseline → Hypothesis → Experiment → Measurement → Decision → Iteration`
