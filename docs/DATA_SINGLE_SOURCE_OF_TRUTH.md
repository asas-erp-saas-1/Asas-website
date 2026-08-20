# DATA_SINGLE_SOURCE_OF_TRUTH.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — Single Source of Truth Rules**
> This document defines where each piece of business data lives, how it's derived, how it's cached, how updates propagate, and where duplication is forbidden.

## 1. The Prime Rule

> **The database is the single source of truth. The UI displays data only. No hardcoded business data in components, JSON, or static arrays.**

If a normal employee needs a developer to perform a routine content operation (changing a price, updating a description, adding an image), that is a **CMS design failure**.

## 2. Canonical Sources

| Data | Canonical Source | Where Displayed | How Derived | How Cached | How Invalidated |
|---|---|---|---|---|---|
| Apartment price | `Apartment.price` | Apartment detail page, Project inventory, Apartment cards, Search, Filters, SEO structured data | Direct DB read | React Query (1-min staleTime) | `qc.invalidateQueries(['admin','apartments'])` on mutation |
| Apartment surface | `Apartment.surface` | Same as price | Direct read | Same | Same |
| Apartment status | `Apartment.status` | Apartment badge, Project inventory count, Search filter | Direct read | Same | Same |
| Apartment type | `Apartment.apartmentType` + `typeName` | Apartment card, Project filter, Search | Direct read | Same | Same |
| Project name | `Project.name` | Project detail, Apartment project info, Breadcrumbs, SEO | Direct read | Same | `qc.invalidateQueries(['admin','projects'])` |
| Project location | `Project.city` + `district` | Project detail, Apartment inherited location, SEO | Direct read | Same | Same |
| Project starting price | `Project.startingPrice` (manual) OR derived from `MIN(Apartment.price WHERE available)` | Project card, Project detail hero | Manual override OR derived | Same | Same |
| Project status | `Project.status` | Project badge, Search filter | Direct read | Same | Same |
| Developer | `Developer` table (via FK) | Project developer section | Direct read via relation | Same | Same |
| Hero image | `ProjectImage` / `ApartmentImage` with `type=hero` | Hero section | Query: `images.filter(i => i.type === 'hero')[0]` | Same | `qc.invalidateQueries(['admin','media'])` |
| Gallery | `ProjectImage` / `ApartmentImage` with `type=gallery` | Gallery section | Query: `images.filter(i => i.type === 'gallery')` | Same | Same |
| Floor plan | `ApartmentImage` with `type=floor-plan` | Floor plan section | Query: `images.filter(i => i.type === 'floor-plan')` | Same | Same |
| Video | `Video` table (filtered by `published=true`) | Video section | `GET /api/videos?projectId=...` | Same | `qc.invalidateQueries(['admin','videos'])` |
| SEO title | `Project.seoTitle` / `Apartment.seoTitle` | `<title>` tag, OG | If null: auto-gen from name + location + "ASAS" | Next.js Metadata API | Auto-regenerated on next render |
| SEO description | `Project.seoDescription` / `Apartment.seoDescription` | `<meta name="description">`, OG | If null: auto-gen from tagline/description | Same | Same |
| OG image | `Project.ogImage` / `Apartment.ogImage` | `<meta property="og:image">` | If null: first hero image | Same | Same |
| Canonical URL | `Project.canonicalUrl` / `Apartment.canonicalUrl` | `<link rel="canonical">` | If null: `https://asas.dz/#/projects/[slug]` | Same | Same |
| Lead status | `Lead.status` | Admin Leads tab, inline dropdown | Direct read | Same | `qc.invalidateQueries(['admin','leads'])` |
| Admin user role | `AdminUser.role` | Admin Users tab, Settings | Direct read (in session) | Session cookie (8h) | New login required |

## 3. Price Propagation Map

**Price is the most critical business data.** When admin changes an apartment's price:

```
Admin UI (ApartmentEditForm → Prix tab)
  ↓ user changes price field
  ↓ clicks "Sauvegarder"
Price Change Confirmation Dialog (shows old/new/diff)
  ↓ user clicks "Confirmer"
PUT /api/admin/apartments/[slug]
  ↓ server validates (auth + role + Zod)
  ↓ detects price change → records PRICE_CHANGE audit log with before/after
  ↓ db.apartment.update({ price: newPrice })
  ↓ returns 200
Client receives response
  ↓ qc.invalidateQueries(['admin', 'apartments'])
  ↓ qc.invalidateQueries(['admin', 'apartment', slug])
  ↓ React Query refetches
  ↓ UI updates with new price
Public site (next visitor or admin preview)
  ↓ GET /api/apartments/[slug] → returns updated price
  ↓ Apartment detail page renders new price in hero
  ↓ Project inventory (GET /api/projects/[slug]) → apartment card shows new price
  ↓ Search/filter results (if cached) → stale for max 1 minute, then refreshed
  ↓ SEO structured data (Apartment schema) → `offers.price` updated on next render
  ↓ Sitemap → no change needed (sitemap doesn't include prices)
```

**No stale price anywhere.** The maximum staleness is 1 minute (React Query staleTime).

## 4. Status Propagation Map

When admin changes an apartment's status (e.g., AVAILABLE → SOLD):

```
Admin UI (ApartmentEditForm → Identité tab OR inline dropdown on table)
  ↓ user changes status
  ↓ clicks "Sauvegarder" (or inline dropdown triggers save)
PUT /api/admin/apartments/[slug]
  ↓ detects status change → records UPDATE_APARTMENT_STATUS audit log
  ↓ db.apartment.update({ status: newStatus })
Client invalidates queries
  ↓ UI updates
Public site
  ↓ Apartment detail page shows new status badge (Disponible/Réservé/Vendu)
  ↓ Project inventory: "Available" count decreases, "Sold" count increases
  ↓ Search filter: apartment no longer appears in "Available" filter (if status=SOLD)
  ↓ SEO structured data: `availability` field updates
```

## 5. Media Propagation Map

When admin uploads a new hero image:

```
Admin UI (MediaTab → upload card)
  ↓ user picks entity + type=hero + file
  ↓ clicks "Téléverser"
POST /api/admin/media/upload (multipart)
  ↓ 6-layer validation (auth + MIME + size + magic-bytes + entity)
  ↓ writes file to /public/uploads/projects/[slug]/
  ↓ db.projectImage.create({ projectId, url, type: 'hero' })
  ↓ records UPLOAD_MEDIA audit log
Client invalidates ['admin', 'media']
  ↓ Media grid refreshes
Public site
  ↓ Project detail page: hero section fetches first image with type=hero
  ↓ New hero image appears
  ↓ SEO OG image (if ogImage is null) auto-uses first hero image
```

When admin deletes a media item:

```
Admin UI (MediaGrid → trash icon)
  ↓ confirmation dialog shows "used in N locations" warning
  ↓ user clicks "Supprimer définitivement"
DELETE /api/admin/media/[id]
  ↓ auth + ADMIN role check
  ↓ removes file from disk (best-effort)
  ↓ db.projectImage.delete OR db.apartmentImage.delete
  ↓ records DELETE_MEDIA audit log
Client invalidates ['admin', 'media']
  ↓ Media grid refreshes (item disappears)
Public site
  ↓ Next render: hero/gallery/floor-plan section no longer shows deleted image
  ↓ If deleted item was the hero: hero section shows fallback (first gallery image OR project hero file)
```

## 6. Publication Propagation Map

When admin publishes a project:

```
Admin UI (Projects tab → toggle "Brouillon" → "Publié")
  ↓ badge click triggers togglePublished mutation
PATCH /api/admin/projects/[slug] (PUT with published=true)
  ↓ auth + role check
  ↓ records UPDATE_PROJECT audit log (with before/after published state)
  ↓ db.project.update({ published: true })
Client invalidates ['admin', 'projects']
  ↓ Projects table refreshes (badge turns green)
Public site
  ↓ GET /api/projects → now includes this project
  ↓ GET /api/projects/[slug] → returns 200 (was 404)
  ↓ Sitemap.xml → regenerated, includes new URL
  ↓ Structured data → rendered in public HTML
  ↓ Homepage featured section (if featured=true) → shows project
```

When admin unpublishes:

```
Same flow but published=false
  ↓ GET /api/projects → excludes this project
  ↓ GET /api/projects/[slug] → returns 404
  ↓ Sitemap.xml → excludes URL
  ↓ Structured data → no longer rendered
```

When admin archives:

```
DELETE /api/admin/projects/[slug]
  ↓ auth + ADMIN role check
  ↓ confirmation dialog: "Archiver le projet 'X' ? Il sera dépublié et masqué."
  ↓ db.project.update({ archived: true, published: false })
  ↓ records ARCHIVE_PROJECT audit log
Public site
  ↓ Project disappears from all public APIs
  ↓ Sitemap excludes
  ↓ Apartments within the project also become inaccessible (cascade via project filter)
Admin
  ↓ Project disappears from default list (filtered by archived=false)
  ↓ Project preserved in DB for historical leads (Lead.projectName denormalized)
```

## 7. Cache Strategy

### Client-side (React Query)
- `staleTime: 60 * 1000` (1 minute) — default for all queries
- `refetchOnWindowFocus: false` — avoid unnecessary refetches
- Mutations call `qc.invalidateQueries({ queryKey: ['admin', ...] })` to refresh

### Server-side (Next.js)
- Currently: no ISR/SSG caching (dev mode)
- **Future**: use `revalidateTag` / `revalidatePath` after mutations for on-demand cache refresh
- **Future**: use `unstable_cache` from `next/cache` for expensive queries (e.g., sitemap generation)

### What should NOT be cached
- **Price** — must be fresh on every render (max 1-minute staleness)
- **Status** — same
- **Availability** — same

### What CAN be cached
- **Project description** — changes infrequently
- **Amenities list** — stable
- **Developer info** — very stable
- **SEO metadata** — stable between mutations

## 8. What Must Never Be Duplicated

### Hardcoded prices in components
```tsx
// ❌ FORBIDDEN
<p>Prix: 16,800,000 DA</p>

// ✅ CORRECT
<p>Prix: {formatPrice(apartment.price)} DA</p>
```

### Hardcoded apartment names
```tsx
// ❌ FORBIDDEN
const apartments = [
  { name: "F3 Familial", price: 16800000 },
  ...
];

// ✅ CORRECT
const { data: apartments } = useQuery({ queryKey: ['apartments'], queryFn: fetchApartments });
```

### Duplicated project data
```tsx
// ❌ FORBIDDEN — project data hardcoded in multiple components
const projectInfo = { name: "Résidence Les Oliviers", district: "Chéraga" };

// ✅ CORRECT — single source via API
const { data: project } = useProject(slug);
```

### SEO title hardcoded
```tsx
// ❌ FORBIDDEN
<title>Résidence Les Oliviers — ASAS</title>

// ✅ CORRECT
<title>{project.seoTitle || `${project.name} — ASAS`}</title>
```

## 9. Exceptions (allowed duplication)

### Denormalized lead context
`Lead.projectName` and `Lead.apartmentName` are denormalized — stored on the lead at submission time. This is **intentional**:
- Preserves lead history if the project/apartment is renamed or deleted
- Avoids expensive joins when displaying leads
- The denormalized value is a snapshot at submission time

### SiteContent key-value store
Some site-wide content (hero title, about mission) is stored in `SiteContent` as key-value pairs. This is not "duplication" — it's the canonical source for that specific content.

## 10. Validation: Single Source of Truth Audit

To verify no duplication exists:

```bash
# Search for hardcoded prices in components
grep -rn "[0-9]\{6,\}" src/components/ | grep -v "node_modules"

# Search for hardcoded apartment names
grep -rn "F3 Familial\|F2 Compact\|F4 Standing" src/components/

# Search for hardcoded project names
grep -rn "Résidence Les Oliviers\|residence-les-oliviers" src/components/

# Search for hardcoded DA values
grep -rn "DA\b" src/components/ | grep -v "formatPrice"
```

If any results appear in component files (not in seed.ts or constants), that's a duplication violation.

## 11. Future: Price History Table

**DECISION REQUIRED**: Should we track price history?

If yes, create:
```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  apartmentId String
  apartment   Apartment @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  oldPrice    Int?
  newPrice    Int?
  changedBy   String?  // AdminUser email
  changedAt   DateTime @default(now())

  @@index([apartmentId])
  @@index([changedAt])
}
```

The existing `AuditLog` table with `action=PRICE_CHANGE` + `before`/`after` already captures this. A dedicated `PriceHistory` table would be for fast queries + UI display (e.g., "Price history for A-101").

**Recommendation**: Use `AuditLog` for now (it already captures before/after). Add `PriceHistory` only if there's a UI need to display price history per apartment.
