# DATABASE_MIGRATION_PLAN.md — SQLite → PostgreSQL/Supabase

> **Phase 3 Step 22 — Safe Migration Strategy**

## 1. Pre-Migration Checklist

- [ ] Supabase project created + URL + keys obtained
- [ ] `DATABASE_URL` updated to PostgreSQL connection string
- [ ] `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] SQLite database backed up: `cp db/custom.db /backup/custom-$(date +%Y%m%d).db`
- [ ] All 139 rows verified in SQLite (see PHASE_3_FORENSIC_AUDIT.md)
- [ ] Phase 2 functionality verified working on SQLite

## 2. Migration Sequence (17 steps)

### Step 1: Backup
```bash
cp /home/z/my-project/db/custom.db /backup/asas-sqlite-backup-$(date +%Y%m%d).db
```

### Step 2: Create PostgreSQL schema
Update `prisma/schema.prisma` datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Run:
```bash
bun run db:push  # Creates all tables in PostgreSQL
```

### Step 3: Create CHECK constraints
Execute raw SQL (from `POSTGRESQL_ARCHITECTURE.md`):
```sql
ALTER TABLE projects ADD CONSTRAINT chk_publish_state CHECK (NOT (published AND archived));
ALTER TABLE apartments ADD CONSTRAINT chk_publish_state CHECK (NOT (published AND archived));
ALTER TABLE apartments ADD CONSTRAINT chk_price_nonneg CHECK (price IS NULL OR price >= 0);
ALTER TABLE apartments ADD CONSTRAINT chk_surface_pos CHECK (surface > 0);
-- ... (see POSTGRESQL_ARCHITECTURE.md for all constraints)
```

### Step 4: Create indexes
Execute `DATABASE_INDEX_STRATEGY.md` index creation scripts.

### Step 5: Create enums
Execute `POSTGRESQL_ARCHITECTURE.md` enum creation scripts.

### Step 6: Enable RLS
Execute `SUPABASE_RLS_ARCHITECTURE.md` RLS enable + policy scripts.

### Step 7: Export SQLite data
```bash
# Use a script to export each table as JSON
bun scripts/export-sqlite.ts > /tmp/asas-export.json
```

### Step 8: Import data to PostgreSQL
```bash
bun scripts/import-postgres.ts < /tmp/asas-export.json
```

### Step 9: Validate row counts
```sql
-- Expected counts (from forensic audit):
SELECT 'projects' as t, COUNT(*) FROM projects UNION ALL  -- 4
SELECT 'buildings', COUNT(*) FROM buildings UNION ALL     -- 6
SELECT 'apartments', COUNT(*) FROM apartments UNION ALL  -- 28
SELECT 'project_images', COUNT(*) FROM project_images UNION ALL  -- 12
SELECT 'apartment_images', COUNT(*) FROM apartment_images UNION ALL  -- 48
SELECT 'videos', COUNT(*) FROM videos UNION ALL           -- 1
SELECT 'leads', COUNT(*) FROM leads UNION ALL             -- 1
SELECT 'lead_notes', COUNT(*) FROM lead_notes UNION ALL  -- 1
SELECT 'admin_users', COUNT(*) FROM admin_users UNION ALL  -- 4
SELECT 'audit_logs', COUNT(*) FROM audit_logs UNION ALL   -- 11
SELECT 'developers', COUNT(*) FROM developers UNION ALL  -- 1
SELECT 'project_amenities', COUNT(*) FROM project_amenities UNION ALL  -- 19
SELECT 'site_content', COUNT(*) FROM site_content UNION ALL  -- 3
SELECT 'newsletter_subscriptions', COUNT(*) FROM newsletter_subscriptions;  -- 0
```

### Step 10: Validate foreign keys
```sql
-- Check for orphan apartments (no project)
SELECT COUNT(*) FROM apartments a LEFT JOIN projects p ON a.project_id = p.id WHERE p.id IS NULL;
-- Expected: 0

-- Check for orphan images
SELECT COUNT(*) FROM project_images pi LEFT JOIN projects p ON pi.project_id = p.id WHERE p.id IS NULL;
SELECT COUNT(*) FROM apartment_images ai LEFT JOIN apartments a ON ai.apartment_id = a.id WHERE a.id IS NULL;
-- Expected: 0
```

### Step 11: Validate media references
Verify all image URLs point to existing files (see `MEDIA_MIGRATION_REPORT.md`).

### Step 12: Validate prices
```sql
-- Check for negative prices
SELECT COUNT(*) FROM apartments WHERE price < 0;  -- Expected: 0
-- Check for zero surface
SELECT COUNT(*) FROM apartments WHERE surface <= 0;  -- Expected: 0
```

### Step 13: Validate publication states
```sql
-- Check for contradictory states
SELECT COUNT(*) FROM projects WHERE published = true AND archived = true;  -- Expected: 0
SELECT COUNT(*) FROM apartments WHERE published = true AND archived = true;  -- Expected: 0
```

### Step 14: Validate SEO
```sql
-- Check that published projects have SEO fields
SELECT name, seo_title, seo_description FROM projects WHERE published = true;
```

### Step 15: Run application against PostgreSQL
```bash
# Update .env
DATABASE_URL=postgresql://...@supabase.co:5432/postgres
# Restart dev server
bun run dev
# Test homepage, project detail, apartment detail, admin
```

### Step 16: Run regression tests
Execute `PHASE_3_QA_REPORT.md` test battery.

### Step 17: Declare migration successful
Only after all validations pass. Otherwise, rollback to SQLite backup.

## 3. Rollback Strategy

If migration fails at any step:
1. Revert `prisma/schema.prisma` datasource to `sqlite`
2. Restore `DATABASE_URL` to SQLite path
3. Restore backup: `cp /backup/asas-sqlite-backup-*.db db/custom.db`
4. Restart dev server
5. Document the failure reason in `DATABASE_MIGRATION_REPORT.md`

## 4. Data Reconciliation (Step 23)

After migration, compare SQLite vs PostgreSQL row counts:

| Table | SQLite Expected | PostgreSQL Actual | Match? |
|---|---|---|---|
| Project | 4 | ? | |
| Building | 6 | ? | |
| Apartment | 28 | ? | |
| ProjectImage | 12 | ? | |
| ApartmentImage | 48 | ? | |
| Video | 1 | ? | |
| Lead | 1 | ? | |
| LeadNote | 1 | ? | |
| AdminUser | 4 | ? | |
| AuditLog | 11 | ? | |
| Developer | 1 | ? | |
| ProjectAmenity | 19 | ? | |
| SiteContent | 3 | ? | |
| NewsletterSubscription | 0 | ? | |

**Rule**: If ANY table count doesn't match → STOP. Investigate. Do not declare migration successful.

## 5. Sandbox Constraint

> **HONEST STATEMENT**: This migration plan cannot be executed in the current sandbox because:
> 1. No Supabase project is configured (no `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
> 2. `DATABASE_URL` points to SQLite (`file:...`)
> 3. The system prompt restricts to "Prisma ORM (SQLite client only)"
>
> This document is a **production-ready migration plan** that a DevOps engineer can execute when Supabase credentials are available. The current SQLite database continues to function as the development source.
