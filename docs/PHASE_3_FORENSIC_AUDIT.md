# PHASE_3_FORENSIC_AUDIT.md — ASAS Real Estate Platform

> **Phase 3 Step 0 — Forensic Pre-Flight Audit**
> Inspected actual Prisma schema, API routes, seed data, and all Phase 2 documentation against real code.

## 1. Current Architecture

| Component | Technology | Status |
|---|---|---|
| Framework | Next.js 16 + Turbopack | ✅ Stable |
| ORM | Prisma 6.19.2 | ✅ Stable |
| Database | SQLite (single file: `db/custom.db`) | ⚠️ Production → PostgreSQL |
| Auth | bcryptjs + in-memory sessions | ⚠️ Production → Redis/Supabase Auth |
| Storage | Local filesystem (`/public/uploads/`) | ⚠️ Production → Supabase Storage |

## 2. Current Schema (14 models verified)

```
Developer (1 row) → Project (4 rows) → Building (6 rows) → Apartment (28 rows)
                                     → ProjectImage (12 rows)
                                     → ProjectAmenity (19 rows)
                                     → Video (1 row)
                   Apartment → ApartmentImage (48 rows) → Video
Lead (1 row) → LeadNote (1 row)
AdminUser (4 rows: ADMIN, EDITOR, VIEWER, neweditor)
AuditLog (11 rows: 24 action types)
SiteContent (3 rows: key-value CMS)
NewsletterSubscription (0 rows)
```

**Total: 139 rows across 14 tables.**

## 3. Model Inventory (verified)

| # | Model | Purpose | Rows | PK | Indexes | Unique |
|---|---|---|---|---|---|---|
| 1 | Developer | Real-estate company | 1 | id (cuid) | — | slug |
| 2 | Project | Real-estate development | 4 | id (cuid) | — | slug |
| 3 | Building | Physical building | 6 | id (cuid) | — | slug |
| 4 | Apartment | Saleable unit | 28 | id (cuid) | — | slug |
| 5 | ProjectImage | Project media | 12 | id (cuid) | projectId, type | — |
| 6 | ApartmentImage | Apartment media | 48 | id (cuid) | apartmentId, type | — |
| 7 | Video | YouTube/Vimeo/uploaded | 1 | id (cuid) | projectId, apartmentId | — |
| 8 | ProjectAmenity | Per-project amenity | 19 | id (cuid) | projectId | — |
| 9 | Lead | Contact form submission | 1 | id (cuid) | status, createdAt | — |
| 10 | LeadNote | Follow-up note | 1 | id (cuid) | leadId, createdAt | — |
| 11 | AdminUser | Admin login | 4 | id (cuid) | — | email |
| 12 | AuditLog | Mutation log | 11 | id (cuid) | actorEmail, action, entityType+entityId, createdAt | — |
| 13 | SiteContent | Key-value CMS | 3 | id (cuid) | — | key |
| 14 | NewsletterSubscription | Email subscription | 0 | id (cuid) | status, createdAt | email |

## 4. Foreign Key Inventory (verified)

| FK | From → To | On Delete |
|---|---|---|
| Building.projectId → Project.id | Cascade |
| Apartment.projectId → Project.id | Cascade |
| Apartment.buildingId → Building.id | SetNull |
| ProjectImage.projectId → Project.id | Cascade |
| ApartmentImage.apartmentId → Apartment.id | Cascade |
| ProjectAmenity.projectId → Project.id | Cascade |
| Video.projectId → Project.id | Cascade |
| Video.apartmentId → Apartment.id | Cascade |
| LeadNote.leadId → Lead.id | Cascade |

## 5. Issues Found

### CRITICAL: `published` defaults to `true`
**Impact**: New projects/apartments are immediately visible on the public site upon creation — before the admin has populated required fields.
**Root cause**: `published Boolean @default(true)` in Project + Apartment models.
**Fix applied**: Changed to `@default(false)` — new content starts as DRAFT. Existing data preserved (all still published=true).
**Status**: ✅ FIXED in this phase.

### HIGH: No check constraints
**Impact**: No schema-level validation for:
- `price >= 0` (negative prices possible)
- `surface > 0` (zero surface possible)
- `bedrooms >= 0` (negative bedrooms possible)
- `published + archived` cannot both be true (contradictory state)
**Root cause**: SQLite has limited constraint support via Prisma. PostgreSQL supports `CHECK` constraints natively.
**Fix**: Documented in `POSTGRESQL_ARCHITECTURE.md` — add CHECK constraints when migrating to PostgreSQL.
**Status**: ⚠️ Documented (requires PostgreSQL for native CHECK constraints).

### MEDIUM: Price stored as `Int`
**Impact**: SQLite `Int` is 32-bit (max ~2.1B). Current prices (max ~30M DA) are fine. But if ASAS expands to other markets with larger numbers, Int could overflow.
**Root cause**: Prisma schema uses `Int?` for `price` and `startingPrice`.
**Fix**: For PostgreSQL, use `@db.Decimal(12, 0)` or `BigInt` for prices. Documented in `POSTGRESQL_ARCHITECTURE.md`.
**Status**: ⚠️ Documented (requires PostgreSQL migration).

### MEDIUM: No concurrency protection
**Impact**: Two admins editing the same apartment simultaneously can silently overwrite each other's changes.
**Root cause**: No `version` or `updatedAt` optimistic locking field.
**Fix**: Add `version Int @default(0)` field + optimistic concurrency check in PUT handlers. Documented in `CONCURRENCY_STRATEGY.md`.
**Status**: ⚠️ Documented (requires application-level change).

### LOW: No composite unique constraint for apartment reference within project
**Impact**: Two apartments with the same `unitNumber` within the same project are possible.
**Fix**: Add `@@unique([projectId, unitNumber])` when migrating to PostgreSQL.
**Status**: ⚠️ Documented.

### LOW: Lead.projectId and Lead.apartmentId are not FK-enforced
**Impact**: Lead stores `projectId` and `apartmentId` as plain strings (not FK to Project/Apartment). This is intentional (preserves lead history if project/apartment is deleted) but means orphan references are possible.
**Fix**: Keep as-is (intentional design — leads are snapshot data). Document the decision.
**Status**: ✅ Intentional — documented in `DATA_INTEGRITY.md`.

## 6. Data Duplication Check

Searched for hardcoded business data in components:
- ✅ No hardcoded prices in `src/components/`
- ✅ No hardcoded apartment types/names in components (only in seed.ts + constants)
- ✅ No hardcoded project names in components
- ✅ All prices fetched from API (`useQuery` → `/api/apartments/[slug]`)
- ✅ All statuses fetched from DB

**Verdict**: No data duplication violations found.

## 7. Phase 2 Documentation vs Code Consistency

| Phase 2 Doc | Claims | Code Reality | Match? |
|---|---|---|---|
| CONTENT_MODEL.md | 14 entities | 14 models in schema | ✅ |
| DATA_SINGLE_SOURCE_OF_TRUTH.md | Apartment.price is SSOT | price field on Apartment, fetched via API | ✅ |
| ADMIN_INFORMATION_ARCHITECTURE.md | 5 sidebar groups | SIDEBAR_GROUPS in AdminPage.tsx | ✅ |
| CONTENT_VALIDATION.md | Pre-publish checklist | Publication tab in ProjectEditForm + ApartmentEditForm | ✅ |
| ROLE_PERMISSION_MATRIX.md | ADMIN/EDITOR/VIEWER enforcement | sessionHasRole() on all mutating routes | ✅ |
| SEO_CONTENT_ARCHITECTURE.md | 6 SEO fields per entity | seoTitle/seoDescription/seoKeywords/canonicalUrl/ogImage/robotsIndex on Project + Apartment | ✅ |
| SECURITY_BOUNDARY.md | Public API filters published=true | All public routes filter `published: true, archived: false` | ✅ |
| PHASE_2_DECISIONS.md | 12 open decisions | Decisions remain open — no code changes to resolve them | ✅ |

**Verdict**: Documentation matches code. No conflicts found.

## 8. Migration Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| SQLite → PostgreSQL data type differences (Int vs Decimal) | HIGH | Prisma handles type mapping; document the target types |
| No CHECK constraints → possible invalid data | MEDIUM | Run data validation queries before migration |
| `published=true` default changed to `false` | LOW | Already applied; existing data preserved |
| In-memory sessions lost on migration | LOW | Sessions expire (8h TTL); users re-login after migration |
| Media file paths use relative URLs | LOW | Paths work on both SQLite + PostgreSQL (stored as strings) |
| AuditLog.before/after are JSON strings | LOW | PostgreSQL JSONB recommended for better query support |

## 9. Recommended Changes (Phase 3)

1. ✅ **FIXED**: Change `published` default from `true` to `false`
2. 📝 Design PostgreSQL target schema with native enums, CHECK constraints, Decimal prices
3. 📝 Design RLS policies for all 14 tables
4. 📝 Design optimistic concurrency strategy (version field)
5. 📝 Design PriceHistory table (per Phase 2 Decision #2)
6. 📝 Design AnalyticsEvent table (for Phase 9 analytics)
7. 📝 Document migration plan (SQLite → PostgreSQL)
8. 📝 Document media migration reconciliation
9. 📝 Document backup/recovery strategy
10. 📝 Document environment variables for production
