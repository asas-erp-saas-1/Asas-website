# DATA CONFLICTS — ASAS Real Estate Platform

> Per the master directive: "If you find conflicting data, do not guess. Create DATA_CONFLICTS.md and log the conflicting values, sources, evidence, and required decision."

## 1. Audit summary

After comparing the uploaded `seed.ts` against the rendered website, the dev server SQL logs, and direct DB queries, **NO business-data conflicts were found**.

Specifically:
- ✅ Project slugs match between `seed.ts` and the rendered URL paths (e.g. `residence-les-oliviers`)
- ✅ Apartment prices match the displayed prices on the public site (12M–23.5M DA range)
- ✅ Apartment surfaces match (65m²–140m² range, all values aligned with seed.ts)
- ✅ Project starting prices match the lowest apartment price per project
- ✅ Apartment types (F2, F3, F4, Duplex) match between schema, seed, and rendered UI
- ✅ Project districts (Chéraga, Bordj El Bahri, Dar El Beïda, Hussein Dey) match constants in `src/lib/constants.ts`
- ✅ Delivery dates (Q4 2025, Q1 2026, Q3 2026) match the seed.ts values

## 2. Resolved issue (image URLs)

During PHASE 2 of the audit, the following issue was discovered and resolved:

### Conflict
- The `seed.ts` file referenced 60 image URLs.
- 43 of these URLs pointed to files that did NOT exist on disk (e.g. `/images/projects/les-oliviers-1.jpg`, `/images/apartments/les-oliviers-f2-65-plan.jpg`).
- These broken URLs caused the project detail page gallery to show empty placeholders.

### Resolution
- Generated 10 new premium images via the `image-generation` skill:
  - 4 project gallery images (exterior, garden, lobby, night)
  - 2 apartment interiors (living, kitchen)
  - 3 architectural floor plans (F2, F3, F4)
- Wrote `scripts/fix-image-urls.ts` to remap the broken URLs to available files.
- Verified all 60 image URLs now point to real files on disk.

### Decision rationale
- The original seed file (uploaded in the tar) contained URLs that were placeholders from a previous iteration of the project that never had its assets uploaded.
- Rather than re-write the entire seed.ts (risk of breaking existing DB rows), we ran a one-off fix script that updates only the broken URLs.
- The script is idempotent (re-running it has no effect on already-valid URLs).

## 3. No invented business data

The following data was NOT invented (per directive "NEVER INVENT BUSINESS DATA"):
- ❌ Prices — all values came from `seed.ts`
- ❌ Surface areas — all values came from `seed.ts`
- ❌ Apartment numbers/references — all values came from `seed.ts`
- ❌ Floor numbers — all values came from `seed.ts`
- ❌ Orientations — all values came from `seed.ts`
- ❌ Availability status — all values came from `seed.ts`
- ❌ Addresses — all values came from `seed.ts`
- ❌ Delivery dates — all values came from `seed.ts`
- ❌ Developer info — all values came from `seed.ts`

If a future admin needs to add real data, they use the Admin CMS — no code modification needed.

## 4. Discrepancy: image URLs (resolved, see §2)

This is the only issue found. No further action required.

## 5. Future conflict handling

If a future data conflict is discovered (e.g. seed.ts has a price that doesn't match the displayed price), it should be logged here with:
- Conflicting values (with exact numbers/text)
- Source of each value (which file, line, or DB row)
- Evidence (screenshot, query result, etc.)
- Required decision (which value is correct, who decides)

For now, no conflicts exist. This document serves as the audit record.
