# MEDIA SYSTEM — ASAS

## 1. Two-tier architecture

### 1.1 Seed images (read-only, deployed with code)
Located at `/home/z/my-project/public/images/`:
```
images/
├── projects/
│   ├── dar-saida-hero.jpg
│   ├── el-borj-hero.jpg
│   ├── les-oliviers-hero.jpg
│   ├── les-pins-hero.jpg
│   └── gallery/                 (AI-generated premium gallery images)
│       ├── exterior-1.jpg
│       ├── garden-1.jpg
│       ├── lobby-1.jpg
│       └── night-1.jpg
├── apartments/
│   ├── floor-plan-f3.jpg        (legacy)
│   ├── interior-kitchen.jpg     (legacy)
│   ├── interior-living.jpg      (legacy)
│   ├── interiors/
│   │   ├── kitchen-1.jpg
│   │   └── living-1.jpg
│   ├── plan-f2.jpg              (AI-generated architectural floor plan)
│   ├── plan-f3.jpg
│   └── plan-f4.jpg
└── brand/
    ├── about-asas.jpg
    ├── hero.jpg
    └── services.jpg
```

These images are versioned in source control and referenced by URL in `ProjectImage` and `ApartmentImage` tables.

### 1.2 Admin-uploaded images (runtime, written by admin)
Located at `/home/z/my-project/public/uploads/`:
```
uploads/
├── projects/
│   └── residence-les-oliviers/
│       └── residence-les-oliviers-gallery-1787111992999-21g5zp.jpg
└── apartments/
    └── les-oliviers-f3-92/
        └── les-oliviers-f3-92-hero-...
```

Naming convention: `{entity-slug}-{type}-{timestamp}-{random6chars}.{ext}`

## 2. Upload validation pipeline

`POST /api/admin/media/upload` runs these checks in order. Any failure returns a 4xx with a French error message.

1. **Auth check** — `verifyAdminAuth(request)` returns the session or 401.
2. **File presence** — `formData.get('file')` must be a `File` object (not a string).
3. **Declared MIME validation** — `file.type` must be in the allow-list:
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - `image/avif`
   - `image/gif`
4. **Size check** — `file.size` must be ≤ 8 MB (`8 * 1024 * 1024`).
5. **Magic-bytes verification** (defense-in-depth against MIME spoofing):
   - Reads first 12 bytes of the file.
   - Checks known signatures:
     - JPEG: `FF D8 FF`
     - PNG: `89 50 4E 47 0D 0A 1A 0A`
     - GIF: `47 49 46 38` (GIF8)
     - WebP: `52 49 46 46` + `57 45 42 50` (RIFF...WEBP)
     - AVIF: `66 74 79 70` + `61 76 69 66` or `61 76 69 73` (ftyp avif/avis)
   - Returns the file extension if match, null if mismatch.
6. **Entity validation** — `entityType` must be `project` or `apartment`, and the `entityId` must exist in the DB.
7. **Write file** — `fs.mkdirSync(destDir, { recursive: true })` then `fs.writeFileSync()`.
8. **Insert DB row** — `db.projectImage.create` or `db.apartmentImage.create` with `url = /uploads/...`, `type`, `alt`, `caption`, `order = current count`.

## 3. List endpoint

`GET /api/admin/media?projectId=...&apartmentId=...&type=...&q=...`

Returns a normalized array with shape:
```ts
{
  id: string,
  entity: 'project' | 'apartment',
  entityId: string,
  entityName: string | null,
  entitySlug: string | null,
  url: string,
  alt: string,
  caption: string,
  type: string,
  order: number,
  width: number | null,
  height: number | null,
  createdAt: string,
}
```

## 4. Single-item operations

- `GET /api/admin/media/[id]` — fetch one media item (looks in both projectImage and apartmentImage tables).
- `PATCH /api/admin/media/[id]` — update `alt`, `caption`, `type`, `order`.
- `DELETE /api/admin/media/[id]` — removes the file from disk AND deletes the DB row (in that order). Best-effort file removal — if the file is already gone, the DB delete still proceeds.

## 5. Public visibility

Public users see media via the project/apartment detail endpoints:
- `GET /api/projects/[slug]` returns `images[]` for the project
- `GET /api/apartments/[slug]` returns `images[]` for the apartment

These only return media for **published** projects/apartments.

## 6. Admin UI

### 6.1 MediaTab (in AdminPage)
- **Left column**:
  - `MediaUploadCard` — drag-drop upload form with progress bar
  - `VideoManager` — video URL manager (see below)
- **Right column**: `MediaGrid` — responsive card grid (2 cols mobile, 4 cols desktop)
  - Each card: image thumbnail, entity badge (top-left), type badge (top-right, green), alt text + Modifier/Supprimer buttons
  - Empty state: "Aucun média. Téléversez votre première image ci-dessus."
- **Filters** at top: entity type, media type, search query

### 6.2 Edit dialog
Clicking "Modifier" opens a Dialog with:
- Image preview
- Type selector
- Alt text input
- Caption input
- Save/Cancel buttons

### 6.3 Delete confirmation
Clicking "Supprimer" opens a confirmation Dialog:
> "Supprimer ce média? Cette action supprimera définitivement le fichier et son enregistrement en base."

User must click "Supprimer" to confirm.

## 7. Image generation skill

The image-generation skill (`z-ai-web-dev-sdk`) was used to generate 10 premium real-estate images for the seed:
- 4 project gallery images (exterior, garden, lobby, night)
- 2 apartment interiors (living, kitchen)
- 3 architectural floor plans (F2 65m², F3 92m², F4 120m²)
- Plus 1 already-existing hero regeneration cycle

Command used:
```bash
z-ai image -p "Modern luxury residential building exterior, Mediterranean architecture, white facade, palm trees, blue sky, premium architectural photography" -o "public/images/projects/gallery/exterior-1.jpg" -s 1344x768
```

## 8. URL repair script

`scripts/fix-image-urls.ts` — one-off script that remapped 43 broken image URLs in the DB (referenced non-existent files) to the available real files. Idempotent — can be re-run safely.

Strategy:
- Project hero → dedicated hero file
- Project gallery → rotate through 4 new gallery images
- Apartment floor-plan → plan-f2/f3/f4 by type
- Apartment 3d-plan → interiors/living-1.jpg
- Apartment hero → project's hero file
- Apartment gallery → rotate through interior images

All 60 image URLs verified to point to existing files.
