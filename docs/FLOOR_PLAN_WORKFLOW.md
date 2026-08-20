# FLOOR PLAN WORKFLOW — ASAS Real Estate CMS

> Floor plans are critical real estate documents. This guide covers how to upload, manage, and present them.

## 1. Importance

Floor plans are **not** ordinary gallery images. They are:
- Architectural documents with technical dimensions
- The single source of truth for apartment layout
- Required for serious buyer evaluation

Per directive §30 (Architectural Data Rule):
> THE ORIGINAL PLAN IS THE SOURCE OF TRUTH.
> Do not move walls, change dimensions, add/remove rooms, change doors/windows/balconies, or invent information.

You can improve presentation only — never alter the architectural data.

## 2. Plan Types

The system supports 2 plan-related media types via the Media Library:
- **`floor-plan`** — the original architectural floor plan with measurements
- **`3d-plan`** — a 3D visualization of the plan (furnished or unfurnished)

## 3. Upload Workflow

### Step 1: Open Media Library
Sidebar → **MÉDIAS > Médiathèque**

### Step 2: Pick the target
- **Cible**: Appartement (most common for floor plans)
- Select the specific apartment

### Step 3: Pick the media type
- For original architectural plan: select `floor-plan`
- For 3D visualization: select `3d-plan`

### Step 4: Add metadata (recommended)
- **Alt text**: "Plan F3 92m² Résidence Les Oliviers A-101" — descriptive for accessibility + SEO
- **Caption**: optional (e.g., "Plan original — version 2025-08")

### Step 5: Upload
- Drag-drop the image into the drop zone OR click to choose
- Accepted: JPEG, PNG, WebP, AVIF, GIF (8MB max, magic-bytes verified)

## 4. Public Rendering

### Apartment detail page (`/#/projects/[slug]/apartments/[apartment-slug]`)
- The **SECTION 4: FLOOR PLAN** component renders floor plans prominently
- The `FloorPlanViewer` component supports zoom + pan for readability on mobile
- The first `floor-plan` type image is the primary plan
- 3D plans (`3d-plan`) show alongside the floor plan

### Public API
- `GET /api/apartments/[slug]` returns `images[]` with type information
- The apartment page filters `images.filter(i => i.type === 'floor-plan')` for the plan section
- The apartment page filters `images.filter(i => i.type === '3d-plan')` for the 3D section

## 5. Replace a Floor Plan

Currently: upload a new image with type `floor-plan`, then delete the old one.

The admin interface already supports this via the Media Library:
1. Upload the new plan (type=floor-plan)
2. Delete the old plan (with confirmation — the system warns "Cette image est actuellement utilisée comme média floor-plan pour...")

## 6. Plan Status Indicators (via Content Completeness)

The dashboard's "Appartements nécessitant attention" card surfaces apartments with missing floor plans. The completion score is computed from 9 checks including "Image hero" (proxy for floor plan presence in the basic summary).

For more detailed plan verification, view the apartment via the edit dialog → Spec tab to see all room dimensions.

## 7. Best Practices

- ✅ Always upload the **original architectural plan** first (not just the 3D render)
- ✅ Use a high-resolution image (min 1500×1000 pixels)
- ✅ Include the apartment reference in the Alt text (e.g., "Plan A-101 F3 92m²")
- ✅ If you have both 2D and 3D versions, upload both (type=floor-plan + type=3d-plan)
- ✅ Keep the plan readable when zoomed in on mobile (use PNG or WebP for sharp text)

- ❌ Don't crop or alter the architectural plan in image editing software
- ❌ Don't upload a render (interior visual) as a floor plan — use type=render instead
- ❌ Don't forget the Alt text — buyers using screen readers need it
- ❌ Don't upload PDFs — convert to image first (the Media Library accepts only images)

## 8. Future Work (not implemented in current version)

- Dedicated FloorPlan Prisma model with: type (Original/Clean/Furnished/2D/3D), version, PDF support
- Plan status indicator UI showing "✓ Plan uploaded, ⚠ Missing 3D visualization"
- Version history (keep multiple plan versions with timestamps)
- PDF download for serious buyers
