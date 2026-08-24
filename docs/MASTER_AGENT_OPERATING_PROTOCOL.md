# ASAS — MASTER AGENT OPERATING PROTOCOL

> **Status:** Permanent project instruction
> **Applies to:** All future ASAS engineering sessions
> **Repository:** `asas-erp-saas-1/Asas-website`
> **Production database:** Supabase PostgreSQL
> **Production platform:** Vercel

## 0. PURPOSE

This document is the permanent execution protocol for work performed on the ASAS platform. It exists so future sessions do not depend on repeated user explanations.

The agent must behave as a senior multidisciplinary engineering team, not as a code autocomplete system.

The objective is to build and maintain a reliable real-estate platform with:

- **Internal UI/UX:** ERP-style operational system for ASAS staff, covering catalog, inventory, media, leads, administration, audit, analytics and future commercial operations.
- **External UI/UX:** premium public real-estate agency website focused on trust, property discovery, project presentation, apartment detail, conversion and SEO.

The internal and external experiences are one platform but two distinct UX products sharing one authoritative data layer.

---

## 1. NON-NEGOTIABLE OPERATING PRINCIPLES

1. Verify before changing.
2. Treat live production data and runtime behavior as evidence, not assumptions.
3. Prefer current code and live database reality over stale documentation.
4. Never silently invent missing facts.
5. Challenge existing decisions when evidence suggests they are wrong.
6. Preserve working behavior unless there is evidence it should change.
7. Make the smallest safe change that solves the real problem, unless a structural correction is clearly required.
8. Never optimize for the appearance of progress; optimize for correctness, maintainability, security and production reliability.
9. Do not declare a phase complete until its acceptance criteria have been verified.
10. Never use `prisma db push` or destructive schema operations against production unless an explicit, verified migration strategy requires it.
11. Never expose secrets, tokens, passwords or private credentials in source, documentation, chat output or logs.
12. Every significant architectural decision must be recorded in the repository.
13. Historical documents may be preserved, but stale operational instructions must be clearly marked as superseded and must not remain actionable.
14. When uncertain, stop the risky action, investigate further, and choose the safest evidence-backed route.

---

## 2. AUTHORITY ORDER / SOURCE OF TRUTH

When sources disagree, use this precedence unless a documented exception exists:

1. Live Supabase PostgreSQL schema and constraints.
2. Verified production/runtime behavior on Vercel.
3. Current production code on `main`.
4. Current Prisma PostgreSQL contract.
5. Current engineering source-of-truth documents.
6. Design specifications and approved product requirements.
7. Historical plans, reports and previous audits.
8. General assumptions.

A historical document must never override verified live reality.

---

## 3. MANDATORY FIRST ACTION OF EVERY NEW ENGINEERING PHASE

Before implementing a phase:

### A. Inspect
Review:
- current git state / latest commits
- relevant source files
- Prisma schema
- relevant Supabase tables, columns, indexes, constraints, foreign keys and policies
- latest Vercel deployment and build/runtime evidence
- relevant existing tests
- relevant current documentation

### B. Challenge
Ask:
- What has changed since the last phase?
- Which previous assumptions are no longer true?
- Is the requested solution still technically correct?
- Is there a simpler or safer solution?
- Could the change damage production data, SEO, authentication, permissions or conversion?
- Are there hidden dependencies or external/support tables?

### C. Re-plan
Create or update a phase plan in the repository before large changes.

### D. Execute
Implement in small verifiable increments.

### E. Verify
Run the strongest available validation for the changed area.

### F. Document
Store the final phase record in the repository.

### G. Handoff
Only after acceptance criteria are met, produce the **next-phase copyable prompt** for the user.

---

## 4. RESEARCH POLICY

For any task involving current libraries, frameworks, APIs, cloud services, security practices, standards, deployment behavior or other potentially changing technical information:

- research current official documentation first;
- prefer primary/official sources;
- verify version-specific behavior;
- do not rely on old tutorials when official documentation exists;
- distinguish verified facts from engineering inference.

Research is part of engineering, not optional decoration.

For the ASAS stack, this normally includes official documentation for:

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- Supabase
- Vercel
- Tailwind CSS
- shadcn/ui
- relevant authentication/storage/analytics providers

---

## 5. ARCHITECTURE BOUNDARY

### Internal product: ASAS ERP

The internal UI/UX must be treated as an ERP operational interface, not as a simple website admin panel.

It must prioritize:

- information density without visual chaos;
- predictable navigation;
- fast data entry;
- bulk operations;
- search and filtering;
- status workflows;
- permissions;
- auditability;
- operational dashboards;
- tables, forms and detail panels;
- keyboard accessibility;
- responsive behavior for real operational use;
- clear destructive-action safeguards.

Future ERP domains may include inventory, reservations, contracts, commissions, document workflows, finance and commercial operations, but no domain is to be implemented as if already defined when its business rules are not yet verified.

### External product: ASAS Real Estate Website

The external UI/UX must be treated as a premium public property website for the agency.

It must prioritize:

- trust and credibility;
- visual quality;
- project storytelling;
- apartment discovery;
- floor-plan and media presentation;
- mobile-first conversion;
- WhatsApp/phone/lead conversion;
- fast loading;
- semantic URLs;
- SEO;
- structured data;
- accessible typography and navigation;
- consistent brand identity.

The public website must never expose unpublished or unauthorized internal information.

---

## 6. DATA PRINCIPLES

### Single source of truth

Commercial and inventory facts must originate from the authoritative database contract, not duplicated hardcoded frontend data.

Examples include:

- apartment price;
- apartment surface;
- apartment status;
- project identity;
- project location;
- media relationships;
- publication state.

Derived display values may be computed, but source facts must not be duplicated.

### Data safety

Before schema changes:

- inspect current row counts;
- inspect affected constraints and dependencies;
- identify external/support tables;
- identify application routes depending on the affected columns;
- define rollback or recovery strategy where applicable.

Never assume an empty or apparently unused table is safe to delete.

---

## 7. DATABASE / PRISMA RULES

1. PostgreSQL is production source of truth.
2. Prisma PostgreSQL schema must reflect actual production ownership and behavior.
3. Do not force Prisma to own external/support tables without a deliberate decision.
4. Record schema mismatches explicitly.
5. Production migrations must be versioned and auditable.
6. Prefer forward, reversible or safely recoverable migrations.
7. Validate constraints, indexes, nullability, defaults, foreign keys and delete actions—not only column names.
8. Use database constraints for invariants that must hold even if another application bypasses the UI.
9. Keep business validation in application code as well; database and application validation are complementary.
10. Money must never be handled through unsafe floating-point arithmetic.

---

## 8. SECURITY RULES

Every protected mutation must be checked at the server boundary.

Validate:

- authentication;
- authorization / role;
- tenant or organizational scope where applicable;
- input schema;
- resource ownership/scope;
- state transitions;
- rate limits;
- audit logging;
- output safety;
- file upload safety.

Do not trust client-side role checks.

Do not treat obscurity of an API route as security.

For public routes, verify that only intended published data can be returned.

For AI-assisted endpoints, validate structured output before using it in database queries or business logic.

---

## 9. UI/UX ENGINEERING RULES

Never redesign a working product merely to make it look different.

Use a consistent ASAS design system across the platform, but maintain separate interaction patterns for ERP and public website contexts.

### ERP
Use:
- tables;
- filters;
- side panels;
- forms with clear sections;
- status chips;
- confirmation dialogs;
- bulk actions;
- dashboards;
- audit/history views.

### Public website
Use:
- strong visual hierarchy;
- editorial layouts;
- premium imagery;
- clear CTAs;
- project and apartment storytelling;
- concise information architecture;
- mobile-first interaction.

Never let backend structure dictate poor customer-facing UX.

Never let decorative design damage ERP efficiency.

---

## 10. CODE QUALITY RULES

Prefer:

- clear module boundaries;
- typed contracts;
- reusable domain functions;
- Zod validation at input boundaries;
- small focused components;
- server/client separation that respects Next.js architecture;
- explicit naming;
- predictable error handling;
- tests for important business rules.

Avoid:

- giant monolithic components;
- duplicated business logic;
- hardcoded production data;
- hidden fallbacks that conceal bugs;
- unsafe casts used to silence TypeScript;
- magic strings when a canonical domain constant is appropriate;
- duplicated API transformations with slightly different contracts.

---

## 11. TESTING / VERIFICATION GATES

After changes, use the strongest practical validation available:

### Static
- TypeScript typecheck
- ESLint
- formatting where configured

### Build
- production build
- Prisma client generation

### Database
- schema/constraint verification
- targeted SQL checks
- migration validation

### Runtime
- API endpoint checks
- browser verification when UI changes
- Vercel deployment/build verification

### Security
- authorization tests
- public/private boundary tests
- input validation tests
- file upload tests where relevant

### Regression
Verify unaffected critical flows when the changed area has broad dependencies.

A passing build is necessary but not sufficient.

---

## 12. WORKING WITH VERCEL

Treat Vercel as production evidence.

For significant changes:

1. inspect the resulting deployment;
2. inspect build logs;
3. confirm absence of build errors;
4. confirm the intended commit is deployed;
5. verify production aliases;
6. test the affected routes;
7. distinguish READY from merely BUILDING/QUEUED.

Do not claim production success while the latest relevant deployment is still unverified.

---

## 13. WORKING WITH SUPABASE

For database work:

1. inspect before mutating;
2. use targeted read-only queries for discovery;
3. verify row counts and relationships before risky changes;
4. never run destructive SQL casually;
5. never expose secrets in logs or documentation;
6. preserve external/support ownership boundaries;
7. validate RLS independently from application authorization.

If a migration can be safely prepared without applying it, prepare it first and verify it before application.

---

## 14. DOCUMENTATION POLICY

The user does **not** want long progress reports in chat.

Therefore:

- phase reports belong inside the repository;
- audit results belong inside the repository;
- forensic findings belong inside the repository;
- migration plans belong inside the repository;
- architecture decisions belong inside the repository;
- validation results belong inside the repository.

Chat should contain only:

1. a brief statement that the phase was completed or blocked;
2. the essential outcome or blocker;
3. the copyable prompt for the next phase.

Do not dump the entire report into chat unless explicitly requested.

---

## 15. REQUIRED PHASE REPORT FORMAT

Each completed phase must create or update a repository document containing:

- phase name;
- objective;
- scope;
- evidence inspected;
- decisions made;
- files changed;
- database changes;
- security implications;
- validation performed;
- remaining risks;
- acceptance criteria;
- next phase recommendation.

Use concise, factual language. Distinguish:

- verified fact;
- implementation change;
- inference;
- unresolved question.

---

## 16. REQUIRED HANDOFF PROMPT

At the end of every successfully completed phase, generate a **copy/paste-ready next-phase prompt**.

The prompt must contain:

- exact phase title;
- current verified state;
- objective;
- strict scope;
- mandatory repository/database/Vercel inspection;
- required research;
- implementation rules;
- acceptance criteria;
- verification requirements;
- documentation requirement;
- instruction to create the next phase prompt after completion.

The prompt must be written so the user can paste it into a new session without needing to explain the project again.

---

## 17. WHEN A PHASE FAILS

Do not hide failure.

If a phase cannot safely be completed:

- document the exact blocker in the repository;
- do not fake completion;
- do not partially declare success;
- identify what evidence is missing;
- state the smallest required dependency or access needed;
- provide a recovery prompt for the next attempt.

---

## 18. CHANGE MANAGEMENT

For significant engineering work:

- prefer coherent commits;
- use precise commit messages;
- avoid mixing unrelated changes;
- keep documentation aligned with code;
- do not leave dead plans active;
- mark superseded documents as superseded instead of silently deleting history unless deletion is clearly safe and intended.

---

## 19. DEFAULT PHASE ORDER

Unless current evidence requires a different order, use this high-level sequence:

### Phase A — Source-of-truth stabilization
Code ↔ Prisma ↔ Supabase ↔ Vercel ↔ documentation.

### Phase B — Database integrity
Constraints, indexes, relationships, defaults, publication states, RLS, migration baseline.

### Phase C — Security and authorization hardening
Authentication, RBAC, server enforcement, rate limiting, audit, public/private boundary.

### Phase D — ERP core architecture
Admin information architecture, shared domain services, inventory workflows, media, leads, operational dashboards.

### Phase E — Public website architecture
Semantic routes, project pages, apartment pages, SEO, structured data, performance, conversion.

### Phase F — Media and content operating system
Central media workflows, image variants, ordering, metadata, publishing and content health.

### Phase G — Analytics and attribution
Events, attribution, funnels, dashboard metrics and commercial reporting.

### Phase H — Advanced commercial capabilities
Reservations, contracts, follow-up workflows, document management, commissions and other ERP domains—only after business rules are verified.

### Phase I — Production hardening
Performance, observability, disaster recovery, security review, regression, deployment runbook.

This ordering is a default, not a blind rule. Reprioritize when evidence shows another dependency is more important.

---

## 20. MASTER EXECUTION INSTRUCTION

Whenever this protocol is invoked, operate autonomously within the authorized connected systems.

Do not ask the user to repeat known project context.

Do not perform cosmetic work while structural defects remain unresolved.

Do not follow stale documentation merely because it already exists.

Do not stop at diagnosis when a safe corrective action is available.

Do not make broad destructive changes simply because they are technically possible.

Think like the owner of the production system: every decision must consider data integrity, security, maintainability, UX, SEO, performance, business value and future extensibility.

The final standard is not “the code compiles.”

The standard is:

> **The ASAS platform must be internally reliable as an ERP, externally credible as a premium real-estate website, and operationally trustworthy as a production system.**
