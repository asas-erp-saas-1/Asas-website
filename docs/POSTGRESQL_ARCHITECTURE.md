# POSTGRESQL_ARCHITECTURE.md — ASAS Target Database Schema

> **Phase 3 Step 3 — PostgreSQL Schema Design**
> Target schema for PostgreSQL/Supabase migration. SQLite schema remains the dev source until migration is approved.

## 1. ID Strategy

**Current**: String (cuid) — 24-char alphanumeric
**Target**: String (cuid) — same. Keep cuid for simplicity + uniqueness across instances.

**Rationale**: UUID would add complexity (index size, display) without clear benefit. cuid is collision-resistant and URL-safe.

## 2. Type Mapping (SQLite → PostgreSQL)

| SQLite Type | PostgreSQL Target | Rationale |
|---|---|---|
| `String` | `String` + `@db.Text` (for long text) | PostgreSQL Text is unlimited |
| `Int` (price) | `Decimal(12,0)` via `@db.Decimal(12,0)` | Prevents Int32 overflow; money-safe |
| `Int` (counts) | `Integer` | Standard integer |
| `Float` (lat/lng) | `Double` via `@db.Double` | Precise floating point |
| `Boolean` | `Boolean` | Same |
| `DateTime` | `DateTime` + `@db.Timestamptz` | Timezone-aware timestamps |
| `String` (JSON arrays) | `Json` via `@db.JsonB` | PostgreSQL JSONB — queryable + indexable |

## 3. Enum Design (PostgreSQL native enums)

PostgreSQL supports native enum types. Prisma maps these via `@map`.

### Enums to create:

```sql
CREATE TYPE project_type AS ENUM ('RESIDENTIAL', 'MIXED_USE', 'COMMERCIAL');
CREATE TYPE project_status AS ENUM ('AVAILABLE', 'COMING_SOON', 'SOLD_OUT', 'DRAFT');
CREATE TYPE apartment_type AS ENUM ('F2', 'F3', 'F4', 'F5', 'Duplex', 'Studio', 'Villa');
CREATE TYPE apartment_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'COMING_SOON', 'OFF_MARKET', 'DRAFT');
CREATE TYPE orientation AS ENUM ('Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest');
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'VISIT', 'NEGOTIATION', 'SOLD', 'LOST');
CREATE TYPE admin_role AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE media_type AS ENUM ('hero', 'gallery', 'floor-plan', '3d-plan', 'render', 'interior', 'exterior', 'amenity', 'document');
CREATE TYPE video_type AS ENUM ('HERO', 'GALLERY', 'WALKTHROUGH', 'INTERVIEW', 'PROJECT_OVERVIEW', 'APARTMENT_TOUR', 'LOCATION', 'OTHER');
```

> **Note**: SQLite has no enum type — these are enforced at the app layer via Zod. When migrating to PostgreSQL, switch to native enums.

## 4. Money/Price Architecture

### CRITICAL RULE: No floating point for money.

**Current**: `price Int?` (stored in DA — Algerian Dinar, no decimal places needed)
**Target**: `price Decimal? @db.Decimal(12, 0)` — max 999,999,999,999 DA (12 digits, 0 decimal places)

**Rationale**: Algerian Dinar doesn't use decimal places. But using `Decimal` instead of `Int` prevents overflow for large values and is the standard for monetary columns.

### Price fields:
| Field | Type | Validation | Notes |
|---|---|---|---|
| `Apartment.price` | `Decimal(12,0)?` | `>= 0` | Sale price in DA |
| `Apartment.oldPrice` | `Decimal(12,0)?` | `>= 0` | Previous price (for display) |
| `Project.startingPrice` | `Decimal(12,0)?` | `>= 0` | Project starting price |

### Price per m²:
**Derived** — NOT stored. Computed at query time: `price / surface`.

### CHECK constraints (PostgreSQL):
```sql
ALTER TABLE apartments ADD CONSTRAINT chk_price_nonneg CHECK (price IS NULL OR price >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_surface_pos CHECK (surface > 0);
ALTER TABLE apartments ADD CONSTRAINT chk_bedrooms_nonneg CHECK (bedrooms >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_bathrooms_nonneg CHECK (bathrooms IS NULL OR bathrooms >= 0);
ALTER TABLE projects ADD CONSTRAINT chk_starting_price_nonneg CHECK (starting_price IS NULL OR starting_price >= 0);
ALTER TABLE projects ADD CONSTRAINT chk_surface_range CHECK (min_surface IS NULL OR max_surface IS NULL OR min_surface <= max_surface);
```

## 5. Publishing State Machine

### Problem: `published=true + archived=true` is a contradictory state

**Current**: Two independent booleans allow contradictory combinations:
- `published=true, archived=true` — should not be possible (archived implies unpublished)

**Target**: Add CHECK constraint:
```sql
ALTER TABLE projects ADD CONSTRAINT chk_publish_state CHECK (NOT (published = true AND archived = true));
ALTER TABLE apartments ADD CONSTRAINT chk_publish_state CHECK (NOT (published = true AND archived = true));
```

**Application-level enforcement**: The DELETE (archive) handler already sets `published=false, archived=true`. The CHECK constraint prevents any other code path from creating the contradictory state.

## 6. Concurrency (Optimistic Locking)

### Problem: Silent overwrites

Two admins editing the same apartment can overwrite each other's changes.

**Target**: Add `version` field to Project + Apartment:

```prisma
model Project {
  // ... existing fields
  version Int @default(0)
}

model Apartment {
  // ... existing fields
  version Int @default(0)
}
```

**Update flow**:
```sql
UPDATE apartments
SET price = $1, version = version + 1
WHERE id = $2 AND version = $3
RETURNING *;
-- If 0 rows returned → concurrent modification detected
```

See `CONCURRENCY_STRATEGY.md` for full implementation.

## 7. New Models to Add

### PriceHistory (per Phase 2 Decision #2 — recommended for production)

```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  apartmentId String
  apartment   Apartment @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  oldPrice    Decimal? @db.Decimal(12, 0)
  newPrice    Decimal? @db.Decimal(12, 0)
  currency    String   @default("DZD")
  changedBy   String?  // AdminUser email
  reason      String?  // optional reason for change
  createdAt   DateTime @default(now())

  @@index([apartmentId])
  @@index([createdAt])
}
```

### AnalyticsEvent (per Phase 2 blueprint — prepare for Phase 9)

```prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  eventName   String   // project_view, apartment_view, whatsapp_click, phone_click, lead_submit, brochure_download
  projectId   String?
  apartmentId String?
  sessionId   String?
  source      String?  // utm_source
  campaign    String?  // utm_campaign
  metadata    Json?    @db.JsonB // flexible metadata
  createdAt   DateTime @default(now())

  @@index([eventName])
  @@index([projectId])
  @@index([apartmentId])
  @@index([createdAt])
}
```

## 8. Composite Unique Constraints (PostgreSQL)

```sql
-- Apartment reference unique within project
ALTER TABLE apartments ADD CONSTRAINT uq_apartment_project_ref UNIQUE (project_id, unit_number);

-- Lead email + phone combination (prevent exact duplicate leads)
ALTER TABLE leads ADD CONSTRAINT uq_lead_phone_msg UNIQUE (phone, message);
```

## 9. Index Strategy (see DATABASE_INDEX_STRATEGY.md for full rationale)

### Critical indexes (already exist):
- `Project.slug` (unique)
- `Apartment.slug` (unique)
- `AdminUser.email` (unique)
- `AuditLog.action` + `AuditLog.createdAt`
- `Lead.status` + `Lead.createdAt`

### Indexes to add for PostgreSQL:
- `Project(published, archived)` — partial index for published content
- `Apartment(projectId, status)` — composite for project inventory queries
- `Apartment(published, archived, status)` — partial index for public filtering
- `AuditLog(entityType, entityId, createdAt)` — composite for entity audit history

## 10. JSONB Strategy

### Current: JSON stored as String
- `Project.apartmentTypes` — JSON array string
- `Apartment.features` — JSON array string
- `Apartment.rooms` — JSON array string
- `AuditLog.before/after` — JSON string

### Target: PostgreSQL JSONB
```prisma
apartmentTypes Json? @db.JsonB
features       Json? @db.JsonB
rooms          Json? @db.JsonB
before         Json? @db.JsonB
after          Json? @db.JsonB
```

**Benefits**: Queryable (e.g., `WHERE features @> '["Climatisation"]'`), indexable with GIN index, type-safe at DB level.

## 11. Timestamp Strategy

### Current: `DateTime @default(now())` + `@updatedAt`
### Target: `@db.Timestamptz` for timezone-aware timestamps

```prisma
createdAt DateTime @default(now()) @db.Timestamptz
updatedAt DateTime @updatedAt @db.Timestamptz
```

**Benefit**: All timestamps stored in UTC, converted to local timezone at display time. Prevents timezone confusion in multi-region deployments.
