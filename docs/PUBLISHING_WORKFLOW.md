# PUBLISHING WORKFLOW — ASAS Real Estate CMS

> How to safely publish, unpublish, preview, and archive content.

## 1. Content Lifecycle

```
DRAFT  →  PUBLISHED  →  ARCHIVED
  ↓         ↓             ↓
hidden   visible     hidden + preserved
```

### States
- **DRAFT** (`published=false, archived=false`): invisible on public site, filterable in admin
- **PUBLISHED** (`published=true, archived=false`): visible on public site + sitemap + structured data
- **ARCHIVED** (`published=false, archived=true`): invisible everywhere, preserved in DB for historical leads + audit log

## 2. Create as Draft (default behavior)

When admin creates a new project or apartment via "+ Nouveau" / "+ Nouvel Appartement", the entity is created as DRAFT by default:
- `published=false`
- `archived=false`

This allows admin to populate the entity progressively without it being publicly visible.

## 3. Pre-publish Validation Checklist

Before publishing, the admin should open the edit dialog → **Publication** tab to see the validation checklist:

### Project checklist (7 items)
| Item | Status | Required? |
|---|---|---|
| Nom du projet | ✓ or ✕ | ✅ Required |
| Localisation (ville + quartier) | ✓ or ✕ | ✅ Required |
| Description | ✓ or ⚠ | Recommended |
| Prix de départ | ✓ or ✕ | ✅ Required |
| Image hero | ✓ or ✕ | ✅ Required |
| Description SEO | ✓ or ⚠ | Recommended |
| Image OpenGraph | ✓ or ⚠ | Recommended |

### Apartment checklist (8 items)
| Item | Status | Required? |
|---|---|---|
| Référence/numéro | ✓ or ⚠ | Optional |
| Type + nom du type | ✓ or ✕ | ✅ Required |
| Surface | ✓ or ✕ | ✅ Required |
| Étage | ✓ or ✕ | ✅ Required |
| Chambres | ✓ or ✕ | ✅ Required |
| Prix | ✓ or ✕ | ✅ Required |
| Orientation | ✓ or ⚠ | Recommended |
| Description SEO | ✓ or ⚠ | Recommended |

### Status indicators
- ✓ green = field is filled
- ⚠ amber = field is recommended but empty
- ✕ red = required field is empty (publication is discouraged)

The system shows "⚠ Des champs requis manquent. La publication est déconseillée." if any required field is missing, or "✓ Prêt pour publication." if all required fields are present.

> **Note**: The system does NOT block publishing when required fields are missing — it warns. This respects directive §12: "Do not block publishing unnecessarily. Instead classify: REQUIRED / RECOMMENDED / OPTIONAL."

## 4. Publish

### Via the Publication tab
1. Open the project/apartment edit dialog
2. Go to **Publication** tab
3. Toggle the "Publié/Brouillon" switch to "Publié"
4. Click "Sauvegarder"

### Via the projects/apartments table
1. Click the "Brouillon" badge button (orange)
2. The badge changes to "Publié" (green)
3. The entity is immediately visible on the public site

### After publishing
- The project/apartment appears on the public site immediately (1-minute React Query cache on client)
- The sitemap.xml is regenerated and includes the new URL
- Structured data is rendered in the public HTML
- An `UPDATE_PROJECT` or `UPDATE_APARTMENT` audit log entry is recorded

## 5. Unpublish (revert to Draft)

### Via the Publication tab
1. Open the edit dialog → Publication tab
2. Toggle the "Publié/Brouillon" switch to "Brouillon"
3. Click "Sauvegarder"

### Via the table
1. Click the "Publié" badge button (green)
2. The badge changes to "Brouillon" (orange)
3. The entity is immediately invisible on the public site (returns 404 on direct slug access)

### After unpublishing
- Public API returns 404 for the entity slug
- Sitemap.xml no longer includes the URL
- Structured data is no longer rendered
- Audit log records the change

## 6. Archive (soft-delete)

### Via the table
1. Click the trash icon on the project/apartment row
2. A confirmation dialog appears:
   > "Archiver le projet 'X' ? Il sera dépublié et masqué du site public."
3. Click "OK" to confirm
4. The entity is set to `archived=true, published=false`

### After archiving
- The entity is invisible on the public site
- The entity is invisible in the admin "default" list (filtered by `archived=false`)
- The entity is preserved in the DB for:
  - Historical leads that reference it (Lead.projectName, Lead.apartmentName are denormalized)
  - Audit log referential integrity
  - Future restoration (admin can set `archived=false` again via direct DB access — UI for unarchive not yet implemented)

## 7. Preview

### Via the Publication tab
1. Open the edit dialog → Publication tab
2. Click "Aperçu sur le site" button
3. A new browser tab opens with the public URL:
   - Project: `/#/projects/[slug]`
   - Apartment: `/#/projects/[project-slug]/apartments/[apartment-slug]`

### Preview behavior
- The preview opens the PUBLIC URL
- If the entity is unpublished, the public URL returns 404 (since the public API filters by `published=true`)
- For unpublished content preview, an admin-only preview mode is NOT yet implemented (see Future Work below)

## 8. Audit Trail for Publish/Unpublish/Archive

Every publish/unpublish/archive action is logged:
- `UPDATE_PROJECT` (when toggling published)
- `ARCHIVE_PROJECT` (when archiving — records before/after state)
- `UPDATE_APARTMENT` (when toggling published)
- `ARCHIVE_APARTMENT` (when archiving)
- `UPDATE_APARTMENT_STATUS` (when status field changes, e.g., AVAILABLE → SOLD)

View in **SYSTÈME > Journal d'audit**, filter by action.

## 9. Best Practices

- ✅ Always check the Publication tab validation checklist before publishing
- ✅ Use Draft state while populating content (don't publish incomplete projects)
- ✅ Archive (don't delete) — preserves audit log + historical leads
- ✅ Preview before publishing to verify visual appearance

- ❌ Don't publish without filling required fields (Nom, Localisation, Prix)
- ❌ Don't unpublish a project without warning your sales team (apartments become invisible)
- ❌ Don't archive an apartment that has active leads without handling them first
- ❌ Don't expect archived content to be auto-restored — manual unarchive requires DB access

## 10. Future Work (not implemented)

- **Admin Preview Mode**: Open unpublished content with a "PREVIEW MODE — Not visible to public" banner for authorized admins. Would require a `?preview=1` query param + admin session check on the public API.
- **Scheduled Publishing**: Set a `publishAt` DateTime to auto-publish at a future time.
- **Unarchive UI**: A button to restore archived entities (currently requires direct DB access).
- **Content Review Workflow**: `READY_FOR_REVIEW` state between DRAFT and PUBLISHED, with role-based approval (EDITOR submits → ADMIN approves).
- **Cache Invalidation**: Use Next.js `revalidateTag`/`revalidatePath` after mutations for on-demand cache refresh (currently relies on React Query 1-minute staleTime).
