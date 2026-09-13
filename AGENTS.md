# ASAS Website — Agent Operating Contract

## Mission

Treat this repository as a production real-estate sales product, not a demo. Optimize for truthful buyer confidence, conversion quality, maintainability, accessibility, responsive behavior, runtime reliability, and safe delivery.

## Required workflow

For any non-trivial task:
1. Inspect the repository and the relevant source-of-truth documents before editing.
2. State the objective, constraints, affected files, risks, and acceptance criteria internally before implementation.
3. Prefer the smallest coherent change that solves the real problem; do not rewrite unrelated code.
4. Preserve existing business logic, API contracts, authentication, permissions, routing, and data semantics unless the task explicitly requires change or a verified bug requires it.
5. Implement completely, then inspect the resulting diff for regressions and duplicated/obsolete paths.
6. Validate with the strongest applicable checks: `npm run lint`, `npm run typecheck`, `npm run build`, plus targeted runtime/API/UI checks when available.
7. Never declare a task complete merely because code compiles. Distinguish implementation, CI/deployment success, and runtime verification.
8. Record important architectural decisions, recurring pitfalls, and durable workflows in repository documentation rather than relying on chat memory.

## Product / UX / CRO

- The public website is a premium editorial real-estate sales experience, not a SaaS dashboard.
- Preserve the visual system: ivory/white, charcoal, forest, restrained gold; editorial/architectural typography; generous spacing; strong real imagery; precise borders; restrained shadows.
- Every important page must answer: what is it, why does it matter, what proves it, and what is the safest next action?
- Use one dominant CTA hierarchy. Secondary actions must not compete with the primary decision.
- Use emotional visualization first and rational validation second; progressively disclose secondary detail.
- Put proof, exact property facts, risk-reduction information, and human assistance near decision points.
- Never invent prices, availability, delivery dates, project statistics, neighbourhood facts, testimonials, reviews, images, maps, amenities, travel times, or other evidence.
- Never create fake urgency, fake scarcity, dark patterns, or misleading financial claims.
- Do not reintroduce bank-credit/mortgage simulation into the public journey unless explicitly requested as a new product requirement.
- Do not use placeholder URLs, placeholder images, or demo data as if they were real production content.
- If real media/data is unavailable, use a truthful neutral state or omit the section.

## Current architecture / source of truth

- Public journey source of truth: `docs/UX_CRO_SOURCE_OF_TRUTH.md`
- CRO roadmap: `docs/UX_CRO_ROADMAP.md`
- Engineering/database source of truth: `docs/ENGINEERING_SOURCE_OF_TRUTH.md`
- Active public pages are the V2/V3/V6 routes currently wired in `src/app/page.tsx`; verify routing before modifying legacy components.
- `SiteShell`, `NavbarV3`, `FooterV3`, `StickyMobileCTA`, `CompareBar`, `LeadForm`, and `SearchCommandPalette` form the shared public conversion system. Change them only with repository-wide impact considered.
- Project detail is `ProjectDetailPageV6`.
- Apartment detail is `ApartmentDetailPageV3`.
- Catalog is `ProjectsPageV2`.

## Data and database safety

- Production database is Supabase PostgreSQL with Prisma.
- Never run destructive migration, `prisma db push`, or blind production migration.
- Production has historically lacked a `_prisma_migrations` table; schema reconciliation and a truthful baseline are required before controlled migration adoption.
- Inspect live/schema evidence before changing Prisma models or migrations.
- Treat runtime database errors as real defects, even when they occur only in admin routes.
- Never fix a schema mismatch by deleting or weakening data structures without evidence.
- Validate API boundaries, nullability, Decimal/number normalization, status semantics, and RLS/security implications.

## Responsive and accessibility requirements

- Mobile is a first-class experience. Validate narrow phone, large phone, tablet, laptop, and wide desktop behavior.
- No horizontal overflow, clipped controls, inaccessible dialogs, hidden focus, or overlapping fixed layers.
- Interactive controls should provide comfortable touch targets (target ~44px minimum where practical).
- Support keyboard navigation, visible focus, Escape behavior for overlays, semantic landmarks, labels, and appropriate ARIA only where needed.
- Respect safe-area insets and reduced-motion preferences.
- Fixed conversion layers must not stack into unusable overlaps; cookie consent, comparison, and mobile CTA layering must be deliberately audited.

## Engineering standards

- Use existing project patterns and components before introducing new abstractions.
- Keep components focused; avoid speculative architecture.
- Prefer explicit, typed data transformations at API/UI boundaries.
- Avoid `any` unless unavoidable and justified.
- Handle loading, empty, error, and unavailable-data states where a user can reach them.
- Preserve SEO metadata and semantic HTML on public routes.
- Optimize images and avoid shipping unnecessary client JavaScript.
- Do not leave dead imports, dead routes, duplicate active implementations, or misleading comments.
- Never expose secrets, credentials, tokens, or private data.

## Definition of done

A task is complete only when:
- acceptance criteria are satisfied;
- relevant business logic remains correct;
- no fabricated content was introduced;
- responsive/accessibility behavior was considered;
- obsolete/duplicate paths were checked when relevant;
- lint/typecheck/build pass when applicable;
- runtime/deployment status is reported truthfully;
- documentation is updated when the decision is durable.

## Reporting

Final reports should be concise but factual: changed files/areas, user-visible impact, validation performed, deployment/runtime evidence, remaining risks, and next highest-value action. Never claim a test or deployment was run unless evidence exists.
