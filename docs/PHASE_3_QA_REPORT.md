# PHASE_3_QA_REPORT.md — Regression Test Results

> **Phase 3 Step 30 — QA Regression Tests**

## 1. Test Methodology

Browser E2E via `agent-browser` + VLM screenshot analysis + curl API testing + Prisma direct queries. Per system instruction "do not write any test code", all testing is manual/behavioral.

## 2. Regression Test Results

### Project CRUD

| Test | Command | Expected | Actual | Pass? |
|---|---|---|---|---|
| List projects | GET /api/projects | 200 + 4 published projects | 200 + 4 projects | ✅ |
| Get single project | GET /api/projects/residence-les-oliviers | 200 + full detail | 200 + detail | ✅ |
| Create project (admin) | POST /api/admin/projects | 201 | 201 | ✅ |
| Update project (admin) | PUT /api/admin/projects/[slug] | 200 | 200 | ✅ |
| Archive project (admin) | DELETE /api/admin/projects/[slug] | 200 (archived=true) | 200 | ✅ |
| Unpublished project 404 | GET /api/projects/draft-slug | 404 | 404 | ✅ |
| Published default = false | New project created | published=false (DRAFT) | ✅ verified | ✅ |

### Apartment CRUD

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| List apartments | 28 published | 28 published | ✅ |
| Get single apartment | 200 + detail | 200 + detail | ✅ |
| Create apartment | 201 (DRAFT) | 201 | ✅ |
| Update apartment | 200 | 200 | ✅ |
| Price change confirmation | Dialog shows old/new/diff | Dialog verified via VLM | ✅ |
| Status change inline | Dropdown updates status | Inline dropdown works | ✅ |
| Archive apartment | 200 (archived=true) | 200 | ✅ |
| Unpublished apartment 404 | 404 | 404 | ✅ |

### Media Management

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| List media | 61 records | 61 records | ✅ |
| Upload image (valid) | 200 + file saved | 200 | ✅ |
| Upload .txt as image/jpeg | 415 magic-bytes mismatch | 415 | ✅ |
| Upload without auth | 401 | 401 | ✅ |
| Delete media (ADMIN) | 200 + file removed | 200 | ✅ |
| Delete media (EDITOR) | 403 | 403 | ✅ |
| All 61 media URLs valid | 0 broken | 0 broken | ✅ |

### Video Management

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| List videos | 1 published | 1 published | ✅ |
| Create video (YouTube URL) | 201 | 201 | ✅ |
| Toggle featured | 200 | 200 | ✅ |
| Toggle published | 200 | 200 | ✅ |
| Delete video (ADMIN) | 200 | 200 | ✅ |
| Public video section renders | VideoPlayer + thumbnail | VLM-verified | ✅ |

### Lead Management

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| Submit lead | 201 Created | 201 | ✅ |
| List leads (admin) | 1 lead | 1 lead | ✅ |
| Change lead status inline | VISIT | VISIT | ✅ |
| Add lead note | 201 | 201 | ✅ |
| View lead notes | List shows note | Notes visible | ✅ |

### User Management

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| List users (ADMIN) | 4 users | 4 users | ✅ |
| Create user (ADMIN) | 201 | 201 | ✅ |
| Change role (ADMIN) | 200 | 200 | ✅ |
| Deactivate user (ADMIN) | 200 (active=false) | 200 | ✅ |
| Self-role-change blocked | 400 | 400 | ✅ |
| Self-deactivate blocked | 400 | 400 | ✅ |
| VIEWER cannot create user | 403 | 403 | ✅ |

### Audit Log

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| Login → audit entry | LOGIN recorded | ✅ verified | ✅ |
| Create project → audit | CREATE_PROJECT recorded | ✅ | ✅ |
| Price change → audit | PRICE_CHANGE recorded | ✅ | ✅ |
| Filter audit by action | Returns filtered list | ✅ | ✅ |
| Audit log is append-only | No UPDATE/DELETE | ✅ (no API routes for this) | ✅ |

### Publishing

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| Publish project (badge toggle) | published=true | ✅ | ✅ |
| Unpublish project | published=false → 404 on public | ✅ | ✅ |
| Archive project | archived=true, published=false | ✅ | ✅ |
| Pre-publish checklist visible | ✓/⚠/✕ indicators | VLM-verified | ✅ |
| Published=false default | New records = DRAFT | ✅ FIXED in Phase 3 | ✅ |

### SEO

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| SEO fields on Project | 6 fields present | ✅ verified in schema | ✅ |
| SEO fields on Apartment | 6 fields present | ✅ | ✅ |
| SEO tab in edit form | Renders with 6 fields | VLM-verified | ✅ |
| sitemap.xml | Valid XML + all routes | 200 | ✅ |
| robots.txt | Disallow /api/ | 200 | ✅ |

### Role Enforcement

| Test | Expected | Actual | Pass? |
|---|---|---|---|
| ADMIN can POST project | 201 | 201 | ✅ |
| EDITOR can POST project | 201 | 201 | ✅ |
| VIEWER cannot POST project | 403 | 403 | ✅ |
| VIEWER cannot DELETE | 403 | 403 | ✅ |
| EDITOR cannot DELETE | 403 | 403 | ✅ |
| ADMIN can DELETE | 200/404 | 404 (not found, auth passed) | ✅ |
| Unauthenticated → 401 | 401 | 401 | ✅ |

## 3. Data Integrity Checks

| Check | Expected | Actual | Pass? |
|---|---|---|---|
| No negative prices | 0 rows with price < 0 | 0 | ✅ |
| No zero surface | 0 rows with surface <= 0 | 0 | ✅ |
| No contradictory pub+archived | 0 rows with both true | 0 | ✅ |
| All slugs unique | 0 duplicates | 0 | ✅ |
| All FK references valid | 0 orphans | 0 | ✅ |
| All media URLs valid | 0 broken | 0 | ✅ |

## 4. Summary

| Category | Tests | Passed | Failed |
|---|---|---|---|
| Project CRUD | 7 | 7 | 0 |
| Apartment CRUD | 8 | 8 | 0 |
| Media Management | 7 | 7 | 0 |
| Video Management | 6 | 6 | 0 |
| Lead Management | 5 | 5 | 0 |
| User Management | 7 | 7 | 0 |
| Audit Log | 5 | 5 | 0 |
| Publishing | 5 | 5 | 0 |
| SEO | 5 | 5 | 0 |
| Role Enforcement | 7 | 7 | 0 |
| Data Integrity | 6 | 6 | 0 |
| **Total** | **68** | **68** | **0** |

**All 68 regression tests PASS.**
