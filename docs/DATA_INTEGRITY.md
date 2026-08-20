# DATA_INTEGRITY.md — ASAS Database Integrity Rules

> **Phase 3 Steps 5-6 — Apartment + Project Data Integrity**

## 1. Apartment Integrity Rules

### Required fields for creation
| Field | Required | Validation |
|---|---|---|
| projectId | ✅ | Must reference non-archived project |
| apartmentType | ✅ | Enum: F2/F3/F4/F5/Duplex/Studio/Villa |
| typeName | ✅ | Non-empty string |
| surface | ✅ | > 0 (CHECK constraint on PostgreSQL) |
| bedrooms | ✅ | >= 0 |
| slug | ✅ | Unique, kebab-case |

### CHECK constraints (PostgreSQL target)
```sql
ALTER TABLE apartments ADD CONSTRAINT chk_surface_pos CHECK (surface > 0);
ALTER TABLE apartments ADD CONSTRAINT chk_bedrooms_nonneg CHECK (bedrooms >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_bathrooms_nonneg CHECK (bathrooms IS NULL OR bathrooms >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_price_nonneg CHECK (price IS NULL OR price >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_balconies_nonneg CHECK (balconies IS NULL OR balconies >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_parking_spots_nonneg CHECK (parking_spots IS NULL OR parking_spots >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_publish_state CHECK (NOT (published = true AND archived = true));
```

### Referential integrity
- `projectId` → `Project.id` (CASCADE on delete — apartments deleted when project hard-deleted)
- `buildingId` → `Building.id` (SET NULL on delete — apartment preserved if building deleted)

### Publication rules
- Apartment can be published independently of project
- BUT: if project is unpublished/archived, apartment is not publicly visible (filtered via project relation)
- Cannot publish if: `published=true AND archived=true` (contradictory state — CHECK constraint prevents)

## 2. Project Integrity Rules

### Required fields
| Field | Required | Validation |
|---|---|---|
| name | ✅ | Non-empty |
| slug | ✅ | Unique, kebab-case |
| city | ✅ | Non-empty |
| district | ✅ | Non-empty |

### CHECK constraints
```sql
ALTER TABLE projects ADD CONSTRAINT chk_publish_state CHECK (NOT (published AND archived));
ALTER TABLE projects ADD CONSTRAINT chk_starting_price_nonneg CHECK (starting_price IS NULL OR starting_price >= 0);
ALTER TABLE projects ADD CONSTRAINT chk_surface_range CHECK (min_surface IS NULL OR max_surface IS NULL OR min_surface <= max_surface);
ALTER TABLE projects ADD CONSTRAINT chk_delivery_quarter CHECK (delivery_quarter IS NULL OR delivery_quarter IN ('Q1', 'Q2', 'Q3', 'Q4'));
```

## 3. Lead Data — Snapshot vs Relational

### Decision: SNAPSHOT (denormalized)

`Lead.projectName` and `Lead.apartmentName` are stored at submission time (denormalized).

**Rationale**: Leads must remain historically meaningful even if:
- Project name changes
- Apartment price changes
- Apartment is archived

### What is snapshot (denormalized):
- `projectName` — snapshot at submission time
- `apartmentName` — snapshot at submission time

### What is relational (FK):
- `projectId` — references Project (but no CASCADE — lead preserved if project deleted)
- `apartmentId` — references Apartment (same)

**Note**: These are NOT enforced as FKs at the database level (intentional — leads are immutable historical records).

## 4. Lead Pipeline Integrity

### Valid status transitions:
```
NEW → CONTACTED → QUALIFIED → VISIT → NEGOTIATION → SOLD
                                                        ↘ LOST (at any stage)
```

Any transition is valid (no CHECK constraint enforcing the path — admin can move freely).

### LeadNote integrity:
- Append-only (no UPDATE, no DELETE)
- `authorEmail` = session email (cannot be spoofed — set server-side)

## 5. Audit Log Integrity

- Append-only (no UPDATE, no DELETE)
- `before`/`after` capped at 8KB per field (safeStringify in `src/lib/audit.ts`)
- `ipAddress` from `x-forwarded-for` or `x-real-ip` headers
- `actorEmail` from session (null if unauthenticated)

## 6. Slug Change Strategy

### Current: slugs are immutable (not editable in admin UI)

### Risk if slug changes:
- Breaks SEO (old URL → 404)
- Breaks bookmarks
- Breaks internal links

### Recommendation:
- Keep slugs immutable in admin UI
- If slug must change: create a `Redirect` model:
```prisma
model Redirect {
  id        String @id @default(cuid())
  fromSlug  String @unique
  toSlug    String
  entityType String // 'project' | 'apartment'
  createdAt DateTime @default(now())
}
```
- Middleware checks redirects before returning 404

**Decision**: Keep immutable for now. Add Redirect model if ASAS needs slug changes.

## 7. Concurrent State Validation

### Impossible states prevented by CHECK constraints:
| State | Why impossible |
|---|---|
| `published=true, archived=true` | CHECK constraint prevents |
| `price < 0` | CHECK constraint prevents |
| `surface <= 0` | CHECK constraint prevents |
| `bedrooms < 0` | CHECK constraint prevents |

### Application-level validation (enforced via Zod):
| Rule | Level |
|---|---|
| `buildingId` must belong to same project as `projectId` | Application (cross-table check) |
| `hasParking=true` → `parkingSpots` should be > 0 | Warning (not blocking) |
| `status=SOLD` → `price` should be set | Warning (not blocking) |
