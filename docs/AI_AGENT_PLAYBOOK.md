# ASAS AI Agent Playbook

**Status:** ACTIVE

This is the reusable operating procedure for AI-assisted product, UX, engineering, QA, CRO, and release work. `AGENTS.md` is the primary operating contract.

## Operating loop

`Discover → Plan → Implement → Inspect → Validate → Verify → Document`

### Discover
- Inspect the active branch, route, component, API, data model, and relevant source-of-truth docs.
- Search for existing implementations, duplicate/legacy paths, consumers, tests, and dependencies.
- Identify what must not change.

### Plan
Define objective, user/business outcome, acceptance criteria, affected files, edge cases, risks, rollback considerations, and validation commands.

For large changes, perform a plan/ask pass before implementation.

### Implement
- Make the smallest coherent change.
- Reuse existing patterns.
- Preserve contracts and business logic.
- Never silently invent data or alter product semantics.

### Inspect
Review the diff independently for correctness, regressions, accessibility, responsive behavior, performance, security, SEO, CTA hierarchy, stale code, duplication, and misleading content.

### Validate
Run the strongest applicable checks:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- targeted tests/scripts when present.

### Verify
Keep these claims separate:
1. Implemented — code changed.
2. Validated — checks passed.
3. Runtime verified — deployed/live behavior was actually inspected.

Never claim one based only on another.

### Document
If a decision is durable, update the appropriate source-of-truth document. Do not fill agent instructions with temporary task details.

## Expert prompt structure

Use prompts that read like precise GitHub issues:

```text
ROLE
Act as a senior product engineer + UX/CRO reviewer + QA engineer.

CONTEXT
Repository: [repo]
Branch: [branch]
Source of truth: [files]
Active implementation: [files/components/routes]

OBJECTIVE
[one measurable outcome]

CONSTRAINTS
- preserve [business/API/data contracts]
- do not invent [data/media/etc.]
- do not modify [protected areas]

TASK
1. inspect
2. identify
3. implement
4. audit
5. validate

ACCEPTANCE CRITERIA
- ...

VALIDATION
Run relevant lint/typecheck/build/tests and report exact outcomes.

DELIVERABLE
Changed areas, decisions, validation evidence, remaining risks, next action.
```

## Reusable audit prompt

```text
Perform a production-grade repository audit before changing code.
Inspect architecture, active routes, duplicate/legacy implementations, data/API contracts, database schema/migrations, security/RLS, responsive behavior, accessibility, SEO, performance, observability, and deployment configuration.
Do not modify code yet.
For every finding classify P0/P1/P2/P3 and provide evidence, impact, root cause, fix, validation method, and release-blocking status.
Use repository evidence only. Do not invent missing facts.
End with the highest-value implementation sequence.
```

## Reusable UI/CRO prompt

```text
Act as a senior real-estate product designer, UX architect, CRO specialist, and frontend engineer.
First inspect the current route, UX source of truth, data shape, active components, and responsive shell.
Improve the page in this order: discovery → emotional relevance → rational proof → risk reduction → decision → human assistance.
Enforce one dominant CTA, real data only, premium editorial hierarchy, progressive disclosure, accessible semantics, mobile-first touch targets, no overflow or fixed-layer collisions, loading/empty/error states, and truthful media fallbacks.
Do not rewrite unrelated architecture. Do not introduce fake proof, scarcity, testimonials, statistics, or placeholder media.
After implementation, inspect the final diff and validate lint/typecheck/build plus the relevant runtime route.
```

## Reusable responsive prompt

```text
Audit this interface as a responsive-systems specialist.
Check 320/360/390/430px phones, tablet portrait/landscape, 1280px desktop, and wide desktop.
Find horizontal overflow, clipped text, small controls, sticky/fixed overlap, safe-area issues, modal/drawer failures, keyboard/focus problems, wrapping failures, grid density failures, image cropping issues, and CTA hierarchy collapse.
Fix only verified issues. Preserve content and business behavior. Re-run validation.
```

## Reusable database/API prompt

```text
Act as a senior TypeScript/Next.js/Prisma/PostgreSQL engineer.
Investigate the reported API/database issue from actual schema, Prisma schema, migrations, query, runtime evidence, and affected consumers.
Do not use prisma db push, destructive SQL, blind migration application, or schema deletion.
First establish the mismatch and root cause. Then propose the smallest safe reconciliation. Validate types, nullability, serialization, authorization/RLS, and backward compatibility.
If a production migration is required, produce a reviewed migration plan and validation evidence before deployment mutation.
```

## Reusable independent review prompt

```text
Review this change as an independent senior reviewer who did not write it.
Try to break it. Focus on correctness, regressions, security, accessibility, performance, data integrity, responsive UX, SEO, observability, and maintainability.
Return blocking findings, non-blocking findings, missing verification, exact fixes, and release recommendation.
```

## Reusable release-gate prompt

```text
Act as release engineer. Do not change code initially.
Verify active branch/commit, diff scope, lint, typecheck, production build, automated checks, deployment status, public-route smoke tests, API/runtime errors, known database/schema risks, and critical accessibility/responsive paths.
Separate implemented, validated, and runtime-verified claims.
Return GO / GO WITH CONDITIONS / NO-GO with evidence for every condition.
```

## ASAS non-negotiables

- Public website is a premium real-estate sales environment, not a SaaS dashboard.
- Use truthful data and media only.
- No bank-credit simulation in the public journey unless explicitly reintroduced as a requirement.
- No fake urgency, scarcity, testimonials, social proof, statistics, or neighbourhood claims.
- No destructive production database shortcuts.
- No claiming runtime success from CI success alone.
- No resurrecting deleted legacy page implementations.
- Preserve active Project Detail V6, Apartment Detail V3, Catalog V2, and shared public conversion architecture unless verified repository changes establish a new active version.
