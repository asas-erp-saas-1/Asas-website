# MEDIA WORKFLOW — ASAS Real Estate CMS

> How to manage images, videos, and floor plans from the admin interface.

## 1. Access the Media Library

Sidebar → **MÉDIAS > Médiathèque**

Layout:
- **Left column** (1/3 width):
  - "Téléverser un média" card (image upload)
  - "Gestion des vidéos" card (video URL management)
- **Right column** (2/3 width):
  - Filter bar (entity type + media type + search)
  - Responsive media grid (2 cols mobile, 4 cols desktop)

## 2. Image Upload Workflow

### Step 1: Pick the target
- **Cible**: Projet or Appartement (dropdown)
- Select the specific project or apartment from the second dropdown

### Step 2: Pick the media type
8 types available:
- `hero` — main hero image (1 per entity recommended)
- `gallery` — gallery images (multiple)
- `floor-plan` — architectural floor plan
- `3d-plan` — 3D plan visualization
- `render` — interior/exterior render
- `interior` — interior photo
- `exterior` — exterior photo
- `amenity` — amenity photo (pool, garden, etc.)

### Step 3: Add metadata
- **Texte alt (accessibilité)**: required for accessibility + SEO. Example: "Façade principale de la Résidence Les Oliviers"
- **Légende (optionnel)**: caption displayed under the image. Example: "Vue nocturne"

### Step 4: Choose the file
- Drag-drop the image into the dashed zone, OR click to choose
- **Accepted formats**: JPEG, PNG, WebP, AVIF, GIF
- **Max size**: 8 MB
- **Validation layers**:
  1. Authentication (admin session cookie)
  2. Authorization (ADMIN or EDITOR role — VIEWER cannot upload)
  3. Declared MIME type check
  4. File size check
  5. **Magic-bytes verification** (reads first 12 bytes — rejects MIME spoofing)
  6. Entity existence verification

### Step 5: Upload
- Click "Téléverser"
- Progress bar shows upload %
- On success: image appears in the grid immediately
- On failure: red error banner with reason (e.g., "Type MIME non supporté" or "Le contenu du fichier ne correspond pas à son type déclaré")

## 3. File Storage

Uploaded files are saved to:
```
/home/z/my-project/public/uploads/projects/{project-slug}/{project-slug}-{type}-{timestamp}-{random6}.{ext}
/home/z/my-project/public/uploads/apartments/{apartment-slug}/{apartment-slug}-{type}-{timestamp}-{random6}.{ext}
```

Naming convention is safe (no user-supplied path components — prevents path traversal).

## 4. Managing Existing Media

### 4.1 Filter
- **Entity filter**: Toutes cibles / Projets / Appartements
- **Type filter**: Tous types or specific type
- **Search**: matches Alt text + Caption

### 4.2 Edit a media item
- Click "Modifier" on a card
- Dialog opens with:
  - Image preview
  - Type selector (change type if misclassified)
  - Alt text input
  - Caption input
- Click "Enregistrer"

### 4.3 Delete a media item
- Click the trash icon on a card
- Confirmation dialog: "Supprimer ce média? Cette action supprimera définitivement le fichier et son enregistrement en base."
- Click "Supprimer" to confirm
- File is removed from disk AND the DB row is deleted (in that order)
- Best-effort file removal — if file is already gone, DB delete still proceeds
- Path traversal prevention: `filePath.startsWith(path.join(process.cwd(), 'public'))` check

## 5. Video Management

Located in the left column, below the image upload card.

### Step 1: Pick target
- Same as image upload (Projet or Appartement)

### Step 2: Enter video URL
- Accepts YouTube (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`)
- Accepts Vimeo (`vimeo.com/`, `player.vimeo.com/video/`)
- For uploaded MP4 files: enter the relative storage path (e.g., `/uploads/videos/project-slug/visit.mp4`)

### Step 3: Add metadata
- **Title** (required)
- **Description** (optional)
- **Type**: HERO, GALLERY, WALKTHROUGH, INTERVIEW
- **Thumbnail URL** (optional — if not provided, default YouTube/Vimeo thumbnail is used)

### Step 4: Click "Ajouter la vidéo"
- Video appears in the list below

### 5.1 Manage existing videos
Each video row has 3 action buttons:
- **Star icon** — toggle Featured (a featured video shows prominently on the public detail page)
- **Eye icon** — toggle Published (unpublished videos are hidden from the public)
- **Trash icon** — delete with confirmation

## 6. Public Rendering

### On the public website
- **Project detail page** (`/#/projects/[slug]`):
  - Hero image (type=hero) shows in the hero section
  - Gallery images (type=gallery) show in the gallery section
  - Videos show in "Vidéo du projet" section (conditional — only if videos exist)
- **Apartment detail page** (`/#/projects/[slug]/apartments/[apartment-slug]`):
  - Floor plan (type=floor-plan) shows in the "Plan" section
  - 3D plan (type=3d-plan) shows alongside floor plan
  - Renders (type=render) show in the gallery
  - Hero image (type=hero) is the main image
  - Videos show in "Vidéo de l'appartement" section (conditional)

### How the website knows which media belongs to which entity
- Database relationships: `ProjectImage.projectId` FK + `ApartmentImage.apartmentId` FK
- When admin uploads, the `entityId` (project or apartment ID) is stored with the media record
- Public API returns media via eager-loaded relations on the project/apartment fetch
- No manual URL management in components — fully DB-driven

## 7. Validation Rules Summary

| Layer | What it checks |
|---|---|
| Auth | Valid session cookie |
| Authorization | ADMIN or EDITOR role (VIEWER rejected with 403) |
| File presence | `formData.get('file')` must be a File object |
| Declared MIME | Must be in {image/jpeg, image/png, image/webp, image/avif, image/gif} |
| File size | ≤ 8 MB (8 * 1024 * 1024 bytes) |
| Magic bytes | Reads first 12 bytes, verifies against declared MIME |
| Entity existence | `entityId` must exist in DB |
| Write safety | `path.join` for dest dir, no user-supplied path components |

## 8. Common Mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Upload .txt renamed as .jpg | Rejected with 415 (magic bytes mismatch) | Use real image files |
| Forget Alt text | Accessibility -1, SEO -1 | Always fill Alt |
| Upload too-large image (>8MB) | Rejected with 413 | Compress with TinyPNG/Squoosh first |
| Wrong entity type | Wrong project gets the image | Double-check the Cible dropdown |
| Upload with non-existent entity ID | 404 "Projet introuvable" | Refresh entity list |

## 9. Recommended File Sizes

| Use case | Recommended | Max |
|---|---|---|
| Hero image (1344×768) | 200-400 KB | 1 MB |
| Gallery thumbnail | 100-200 KB | 500 KB |
| Floor plan | 300-600 KB | 2 MB |
| 3D render | 500 KB-1 MB | 4 MB |

Use WebP or AVIF for best compression. JPEG is acceptable but ~30% larger.
