# VIDEO WORKFLOW — ASAS Real Estate CMS

> How to manage project + apartment videos from the admin interface.

## 1. Access

Sidebar → **MÉDIAS > Médiathèque** → Left column → "Gestion des vidéos" card.

## 2. Add a New Video

### Step 1: Pick the target
- **Cible**: Projet or Appartement
- Select the specific project or apartment

### Step 2: Enter video URL
- **YouTube**: accept `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`
- **Vimeo**: accept `vimeo.com/ID`, `player.vimeo.com/video/ID`
- **Uploaded MP4**: enter the relative storage path (e.g., `/uploads/videos/project-slug/visit.mp4`)

### Step 3: Add metadata
- **Title** (required)
- **Description** (optional)
- **Type**: HERO / GALLERY / WALKTHROUGH / INTERVIEW
  - HERO = main project video on hero section
  - GALLERY = supplementary video in gallery
  - WALKTHROUGH = virtual tour of the apartment/project
  - INTERVIEW = developer or resident interview
- **Thumbnail URL** (optional — if not provided, default YouTube/Vimeo thumbnail is used)

### Step 4: Click "Ajouter la vidéo"
- Video appears in the list below

## 3. Manage Existing Videos

For each video in the list:
- **Star icon** — toggle Featured (a featured video shows prominently)
- **Eye icon** — toggle Published (unpublished videos are hidden from the public)
- **Trash icon** — delete with confirmation

## 4. Public Rendering

### Project detail page (`/#/projects/[slug]`)
- "Vidéo du projet" section appears ONLY if published videos exist
- Featured video shows prominently
- Other videos appear in a grid below

### Apartment detail page (`/#/projects/[slug]/apartments/[apartment-slug]`)
- "Vidéo de l'appartement" section appears ONLY if published videos exist

## 5. Technical Implementation

### `VideoPlayer.tsx` component
- Parses YouTube + Vimeo URLs via `toEmbedUrl()` helper
- For uploaded files: renders `<video>` tag with poster thumbnail
- For external URLs: renders thumbnail + green play button → click loads iframe
- Auto-skips rendering if no videos exist (no UI clutter)

### Public API
- `GET /api/videos?projectId=...&apartmentId=...` — returns only `published=true` videos
- Sorted by `featured DESC, order ASC, createdAt DESC`

### Admin APIs
- `POST /api/admin/videos` (Zod validation, requires ADMIN+EDITOR)
- `PATCH /api/admin/videos/[id]` (toggle featured/published, edit metadata)
- `DELETE /api/admin/videos/[id]` (ADMIN-only, with audit log)

## 6. Best Practices

- ✅ Use YouTube or Vimeo for high-quality videos (they handle CDN + compression)
- ✅ Set the WALKTHROUGH type for apartment virtual tours
- ✅ Mark ONE video as Featured per project (multiple featured = the first one shows prominently)
- ✅ Provide a Title in French + Description for SEO
- ✅ Use a custom Thumbnail URL for branded appearance

- ❌ Don't upload large MP4 files (>50MB) — they slow the page
- ❌ Don't set all videos as Featured — only the most important should be featured
- ❌ Don't leave videos Unpublished for long — either publish or delete them
