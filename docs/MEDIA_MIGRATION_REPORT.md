# MEDIA_MIGRATION_REPORT.md — ASAS Media Reconciliation

> **Phase 3 Step 24 — Media File Audit**
> Scanned all media records against actual files on disk.

## 1. Audit Results

| Metric | Count |
|---|---|
| Project images | 12 |
| Apartment images | 48 |
| Videos | 1 |
| **Total media records** | **61** |
| VALID (file exists on disk) | 61 |
| MISSING (file not found) | 0 |
| BROKEN/NULL (URL is null or invalid) | 0 |
| **All media URLs valid** | **YES** |

## 2. File Classification

| Status | Count | Action Needed |
|---|---|---|
| ✅ VALID | 61 | None — files exist at referenced paths |
| ❌ MISSING | 0 | None |
| ⚠ DUPLICATE | 0 | None detected (would need hash-based dedup) |
| ⚠ BROKEN | 0 | None |
| ⚠ UNREFERENCED | Not checked | Would need reverse scan (files without DB records) |

## 3. URL Patterns

### Project images
- `/images/projects/{slug}-hero.jpg` (4 files — seed images)
- `/images/projects/gallery/{exterior,garden,lobby,night}-1.jpg` (4 files — AI-generated)
- `/uploads/projects/residence-les-oliviers/...` (4 files — admin-uploaded test images)

### Apartment images
- `/images/apartments/plan-f{2,3,4}.jpg` (3 files — AI-generated floor plans)
- `/images/apartments/interiors/{living,kitchen}-1.jpg` (2 files — AI-generated interiors)
- `/images/apartments/{interior-kitchen,interior-living,floor-plan-f3}.jpg` (3 legacy files)
- `/uploads/apartments/...` (0 admin-uploaded — cleaned from prior test)

### Videos
- 1 video with external URL (YouTube) — `thumbnailUrl` points to existing project hero image

## 4. Migration Strategy (SQLite → PostgreSQL)

When migrating to PostgreSQL/Supabase:

### Step 1: Upload local files to Supabase Storage
```bash
# Upload /images/projects/* to Supabase 'gallery' bucket
# Upload /images/apartments/* to Supabase 'plans' bucket
# Upload /uploads/* to Supabase 'renders' bucket
```

### Step 2: Update media URLs in database
```sql
-- Update project images
UPDATE project_images SET url = REPLACE(url, '/images/projects/', '/storage/renders/projects/')
WHERE url LIKE '/images/projects/%';

UPDATE project_images SET url = REPLACE(url, '/uploads/projects/', '/storage/renders/projects/')
WHERE url LIKE '/uploads/projects/%';

-- Update apartment images
UPDATE apartment_images SET url = REPLACE(url, '/images/apartments/', '/storage/plans/apartments/')
WHERE url LIKE '/images/apartments/%';

UPDATE apartment_images SET url = REPLACE(url, '/uploads/apartments/', '/storage/renders/apartments/')
WHERE url LIKE '/uploads/apartments/%';
```

### Step 3: Verify all URLs resolve
- Test each URL via `curl -I {public_url}` — expect 200
- Flag any 404s

### Step 4: Keep local files as backup
- Do NOT delete local files until production is verified for 7+ days

## 5. Unreferenced Files (not checked)

Files in `/public/images/` or `/public/uploads/` that don't have a corresponding DB record should be:
1. Listed (reverse scan)
2. Reviewed manually
3. Deleted if confirmed unused

**Script to find unreferenced files** (to be written for production migration):
```bash
# List all files in /public/images/ and /public/uploads/
# Cross-reference against DB media URLs
# Output: files_not_in_db.txt
```

## 6. Conclusion

**All 61 media records point to valid files on disk.** No broken references. No migration blockers related to media.

The earlier image URL fix (`scripts/fix-image-urls.ts` from Phase 0) successfully resolved all 43 broken URLs. The system is clean for PostgreSQL migration.
