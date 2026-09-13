# ASAS UX / CRO Roadmap

**Version:** 1.6
**Date:** 2026-09-13
**Current phase:** Phase 3 — Sales Experience & Conversion System
**Current branch:** `fix/responsive-viewport-hardening`
**Latest implementation checkpoint:** `8b7b7f9f89dcbf9094b1e777b63fe45c81730948`

## Release state

Phase 3 public UX/UI/CRO implementation is substantially complete. Remaining work is verification and evidence gathering, not speculative redesign.

Implemented: premium editorial visual system; responsive and safe-area hardening; catalogue search/filter/sort/apartment search/map; Project Detail Sales Room; Apartment Detail Decision Room; shared CTA/comparison architecture; Home; Services; About; Developers; Contact; Insights; Campaign; legal/utility pages; comparison/floor-plan hardening; removal of public mortgage/credit simulation; repository-native UI reference and AI operating contract.

## Gates still open

- Editable Figma design-system synchronization: current Figma connection is View-only and no editable ASAS design-file key is available to this agent.
- Final independent trust/proof review.
- Full responsive viewport matrix verification.
- Independent lint/typecheck evidence.
- Public journey smoke matrix for project, apartment, contact and campaign routes.

## Verified evidence

- Commit `a6153bbea226c46e47288781e756a93311adb7a` reached Vercel `READY` with combined Vercel status `success`.
- Latest preview root returned HTTP 200.
- Latest checked preview deployment had no error/fatal runtime logs in the checked 24-hour window.

## Engineering note

Historical production runtime logs contain an admin-only Prisma/schema mismatch involving `apartment_images.captionAr`. The active branch's affected admin GET projections no longer request that absent legacy column. Formal Supabase PostgreSQL schema reconciliation is still required before any migration is proposed. No blind `db push`, reset or destructive migration is permitted.

## Phase 4

Starts only after Phase 3 release and focuses on measured CRO: `Instrumentation → Baseline → Hypothesis → Experiment → Measurement → Decision → Iteration`.
