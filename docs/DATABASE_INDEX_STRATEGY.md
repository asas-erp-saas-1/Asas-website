# DATABASE_INDEX_STRATEGY.md — Index Design

> **Phase 3 Step 18 — Index Analysis**

## 1. Current Indexes (SQLite — verified)

| Table | Index | Fields |
|---|---|---|
| ProjectImage | `@@index([projectId])` | project images by project |
| ProjectImage | `@@index([type])` | filter by type (hero/gallery/etc.) |
| ApartmentImage | `@@index([apartmentId])` | apartment images by apartment |
| ApartmentImage | `@@index([type])` | filter by type |
| ProjectAmenity | `@@index([projectId])` | amenities by project |
| Lead | `@@index([status])` | filter leads by status |
| Lead | `@@index([createdAt])` | sort by date |
| NewsletterSubscription | `@@index([status])` | filter by status |
| NewsletterSubscription | `@@index([createdAt])` | sort by date |
| Video | `@@index([projectId])` | videos by project |
| Video | `@@index([apartmentId])` | videos by apartment |
| LeadNote | `@@index([leadId])` | notes by lead |
| LeadNote | `@@index([createdAt])` | sort by date |
| AuditLog | `@@index([actorEmail])` | filter by actor |
| AuditLog | `@@index([action])` | filter by action type |
| AuditLog | `@@index([entityType, entityId])` | filter by entity |
| AuditLog | `@@index([createdAt])` | sort by date |

## 2. Unique Constraints (already in place)

| Table | Field | Type |
|---|---|---|
| Project | slug | @unique |
| Building | slug | @unique |
| Apartment | slug | @unique |
| Developer | slug | @unique |
| AdminUser | email | @unique |
| SiteContent | key | @unique |
| NewsletterSubscription | email | @unique |

## 3. Indexes to Add for PostgreSQL

### Partial indexes (PostgreSQL-only — filter published content)
```sql
-- Public queries always filter published=true AND archived=false
CREATE INDEX idx_projects_published ON projects (slug, published, archived)
  WHERE published = true AND archived = false;

CREATE INDEX idx_apartments_published ON apartments (project_id, slug, published, archived)
  WHERE published = true AND archived = false;
```

### Composite indexes (for common query patterns)
```sql
-- Apartment list filtered by project + status
CREATE INDEX idx_apartments_project_status ON apartments (project_id, status);

-- Lead list filtered by status + ordered by date
CREATE INDEX idx_leads_status_date ON leads (status, created_at DESC);

-- Audit log filtered by entity + ordered by date
CREATE INDEX idx_audit_entity_date ON audit_logs (entity_type, entity_id, created_at DESC);
```

### JSONB GIN indexes (for PostgreSQL JSONB fields)
```sql
-- When features is JSONB: WHERE features @> '["Climatisation"]'
CREATE INDEX idx_apartments_features_gin ON apartments USING GIN (features);

-- When audit before/after is JSONB
CREATE INDEX idx_audit_before_gin ON audit_logs USING GIN (before);
```

## 4. Query Pattern Analysis

| Query | Tables | Index used | Current? |
|---|---|---|---|
| `GET /api/projects` (list published) | Project | Full scan (4 rows) → fast | ✅ OK for now |
| `GET /api/projects/[slug]` | Project + relations | slug unique index | ✅ |
| `GET /api/apartments/[slug]` | Apartment + relations | slug unique index | ✅ |
| `GET /api/admin/projects` (admin list) | Project | Full scan | ✅ OK (4 rows) |
| `GET /api/admin/apartments` (admin list + filter) | Apartment | projectId + status index (future) | ⚠️ Add composite index for PostgreSQL |
| `GET /api/admin/leads` (filter by status) | Lead | status + createdAt index | ✅ |
| `GET /api/admin/audit` (filter by action) | AuditLog | action index | ✅ |

## 5. N+1 Query Analysis

### Current N+1 risks:
1. **Project list → apartment count**: Currently uses `_count` in Prisma (single query with JOIN). ✅ No N+1.
2. **Project detail → images + amenities + apartments**: Uses `include` with nested `include`. Single query with JOINs. ✅ No N+1.
3. **Apartment detail → images**: Uses `include` in Prisma. ✅ No N+1.
4. **Admin media list**: Queries `projectImage` + `apartmentImage` separately via `Promise.all`. Two queries but not N+1. ✅ OK.

**Verdict**: No N+1 query patterns detected.

## 6. Index Cost Analysis

| Index | Write Cost | Storage Cost | Query Benefit | Keep? |
|---|---|---|---|---|
| ProjectImage.projectId | Low | Small | High (eager load) | ✅ |
| ProjectImage.type | Low | Small | Medium (filter by type) | ✅ |
| AuditLog.createdAt | Low | Small | High (sort by date) | ✅ |
| AuditLog.entityType + entityId | Low | Small | High (filter by entity) | ✅ |
| Partial index on published | Low | Very small | High (public queries) | ✅ Add for PostgreSQL |
| JSONB GIN on features | Medium | Medium | Low (rarely queried) | ❌ Skip for now |

**Rule**: Every index has a write cost (slower INSERT/UPDATE/DELETE). Only add indexes for queries that are actually executed.
