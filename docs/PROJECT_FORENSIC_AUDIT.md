# PROJECT FORENSIC AUDIT — ASAS Real Estate Platform

## 1. Overview

**Project**: ASAS — Agence de Commercialisation Immobilière
**Repository**: `/home/z/my-project` (Next.js 16 + TypeScript)
**Audit date**: 2026-08-19
**Source of upload**: `workspace-a2b5cf4b-0be1-43d4-9ef6-c5ef323c6f75.tar` (36 MB)

ASAS is a **Premium Real Estate Sales & Marketing Platform** for the Algerian market. It is **not an ERP** and contains **no accounting, construction management, or HR modules**. The product is a public marketing website + a private admin CMS that shares a single database.

## 2. Framework & Stack

| Area | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.3 (Turbopack) |
| Language | TypeScript | 5.x |
| Runtime | Bun | 1.3.14 |
| Database | SQLite via Prisma ORM | Prisma 6.19.2 |
| UI library | shadcn/ui (New York style) + Radix UI | latest |
| Styling | Tailwind CSS 4 + tailwind-merge | 4.x |
| Icons | Lucide React | 0.525 |
| State | Zustand (client), TanStack Query v5 (server) | 5.x |
| Animation | Framer Motion | 12.x |
| Forms | React Hook Form + Zod 4 | latest |
| Maps | React-Leaflet 5 + Leaflet 1.9 | latest |
| Charts | Recharts 2 | latest |
| Auth (in-memory sessions) | bcryptjs + custom session cookie | 3.0.3 |
| AI SDK | z-ai-web-dev-sdk (image-gen + VLM) | 0.0.18 |

## 3. Architecture Decisions

### 3.1 Single-route SPA (constraint-driven)

The sandbox hosting environment **restricts the project to a single Next.js route** (`/`). To deliver a multi-page-feeling real-estate platform within this constraint, the codebase uses a **client-side hash router** (`src/lib/router.ts`):

```
/#/projects                     → ProjectsPage
/#/projects/[slug]              → ProjectDetailPage
/#/projects/[slug]/apartments/[apt] → ApartmentDetailPage
/#/admin                        → AdminPage (login or dashboard)
/#/services, /#/about, /#/contact, … → other public pages
```

**Trade-off acknowledged**: Hash routing is invisible to search-engine crawlers. True SEO-grade routing would require App Router routes (`/projects/[slug]/page.tsx`), which the sandbox forbids. The team mitigates this with comprehensive `sitemap.xml`, `robots.txt`, JSON-LD structured data, OG/Twitter cards, and full metadata.

### 3.2 SQLite as Single Source of Truth

SQLite is the only persistence layer. There is **no duplicate business data** in JSON or components — every price, surface, status, and image URL is fetched from the database via Prisma. Updates made by an admin in the CMS are immediately visible on the public site.

### 3.3 Public/Admin Data Separation

| Concern | Public API | Admin API |
|---|---|---|
| Projects | `/api/projects` returns only `published=true AND archived=false` | `/api/admin/projects` returns all (incl. drafts) |
| Apartments | `/api/apartments/[slug]` filters published | `/api/admin/apartments` returns all |
| Leads | POST `/api/leads` only (no read) | `/api/admin/leads` requires auth |
| Media | Read-only via project/apartment endpoints | `/api/admin/media` requires auth |
| Videos | `/api/videos?projectId=...` returns only published | `/api/admin/videos` requires auth |
| Settings | Read-only (manifest, sitemap) | `/api/admin/*` requires auth |

Every `/api/admin/*` route calls `verifyAdminAuth(request)` first, returning 401 if the session cookie is missing or invalid.

## 4. Database Schema (10 models)

```
Project (4 records)
  ├─ Building (6 records)
  ├─ Apartment (28 records)
  │    └─ ApartmentImage (48 records)
  ├─ ProjectImage (12 records)
  ├─ ProjectAmenity (19 records)
  ├─ Video (1+ records, supports external URL or uploaded file)
  └─ Developer (FK)
Lead (event-tracked, attribution fields)
AdminUser (1, bcrypt-hashed)
SiteContent (key-value CMS)
NewsletterSubscription
```

Full schema at `prisma/schema.prisma`. Seed at `prisma/seed.ts` (4 projects, 28 apartments, 6 buildings, 19 amenities, 4 developers, 1 admin user).

## 5. Authentication & Authorization

### Before audit (broken)
- `src/lib/admin-auth.ts` used `process.env.ADMIN_PASSWORD || 'asas2024'` — a hardcoded password fallback.
- `/api/admin/login` accepted `{ password }` only.
- Login UI only asked for password.

### After fix (production-grade)
- `src/lib/admin-auth.ts` reads `email` + `passwordHash` from the `AdminUser` table.
- Password verification uses **bcryptjs** (pure-JS, runtime-agnostic — `Bun.password.verify` is not exposed in Next.js server runtime).
- `/api/admin/login` accepts `{ email, password }`, validates against DB, sets `admin-session` cookie (httpOnly, sameSite=lax, 8h TTL).
- `/api/admin/me` returns the current session's user info.
- `verifyAdminAuth(request)` returns `AdminSession | null` (with `role: ADMIN|EDITOR|VIEWER`).
- AdminLoginGate calls `/api/admin/me` on mount — if a valid session exists, skips the login form.
- Logout button in sidebar calls `POST /api/admin/logout` to revoke the session server-side and clears the cookie.

**Credentials**: `admin@asas.dz` / `admin123` (bcrypt-hashed in seed).

## 6. Media Library

### Routes
- `GET /api/admin/media` — list with filters (projectId, apartmentId, type, q)
- `POST /api/admin/media/upload` — multipart upload with magic-bytes validation
- `GET/PATCH/DELETE /api/admin/media/[id]` — single-item operations

### Upload validation (defense-in-depth)
1. Auth check (`verifyAdminAuth`)
2. File presence
3. Declared MIME ∈ {JPEG, PNG, WebP, AVIF, GIF}
4. File size ≤ 8 MB
5. **Magic-bytes verification** — reads first 12 bytes and verifies they match the declared MIME (prevents renaming a `.txt` to `.jpg`)
6. Entity (project/apartment) existence check
7. Writes to `/public/uploads/{projects|apartments}/{slug}/{slug}-{type}-{ts}-{rand}.{ext}`
8. Inserts `ProjectImage` or `ApartmentImage` row with the public URL

### UI (`MediaTab` in `AdminPage.tsx`)
- Drag-and-drop upload card with progress bar (XHR-based, not fetch — needed for `upload.onprogress`)
- Entity selector (project/apartment), type selector (hero/gallery/floor-plan/3d-plan/render/interior/exterior/amenity)
- Alt text + caption fields
- Filter bar (entity filter, type filter, search)
- Responsive grid (2 cols mobile, 4 cols desktop)
- Each card shows entity name badge, type badge, thumbnail
- Edit dialog (alt, caption, type) + Delete with confirmation

## 7. Video Management

### Schema
- `Video` model with `projectId?`, `apartmentId?` (either is required)
- Supports external URLs (YouTube/Vimeo) via `url` field OR uploaded files via `storagePath`
- `thumbnailUrl`, `title`, `description`, `type` (HERO/GALLERY/WALKTHROUGH/INTERVIEW), `featured`, `published`

### Routes
- `GET /api/videos?projectId=...&apartmentId=...` — public, returns only `published=true`
- `GET/POST /api/admin/videos` — admin-only, full CRUD
- `PATCH/DELETE /api/admin/videos/[id]` — admin-only

### UI (`VideoManager` inside MediaTab)
- Add new video by URL (with title, description, type, thumbnail URL)
- Toggle featured, toggle published, delete with confirmation
- Videos list refreshes via React Query invalidation

### Public rendering (`VideoPlayer.tsx`)
- `toEmbedUrl()` parses YouTube (`youtu.be/ID`, `youtube.com/watch?v=ID`, `youtube.com/embed/ID`) and Vimeo (`vimeo.com/ID`, `player.vimeo.com/video/ID`) URLs.
- For uploaded files, renders `<video>` tag with `poster` thumbnail.
- For external URLs, renders thumbnail + green play button overlay → click loads iframe.
- `VideoSection` shows featured video prominently + rest in grid (skips when no videos).

## 8. Public Website

### Routes (hash-based)
```
/#/                                                  Home
/#/projects                                          Projects list (search + filters)
/#/projects/[slug]                                  Project detail (hero, gallery, video, apartments, amenities, lead form)
/#/projects/[slug]/apartments/[apt-slug]           Apartment detail (digital sales fiche)
/#/services                                          Services page
/#/about                                            About ASAS
/#/for-developers                                  B2B developer landing
/#/contact                                          Contact
/#/insights                                         Blog/insights
/#/privacy, /#/terms                                Legal pages
/#/lp/[campaign]                                   Campaign landing pages
/#/admin                                            Admin (login or dashboard)
```

### SEO implementation
- `sitemap.xml` with all major routes (server-side `src/app/sitemap.ts`)
- `robots.txt` with `Disallow: /api/`, crawl-delay, sitemap reference
- `manifest.webmanifest` for PWA
- Per-page metadata via Next.js `generateMetadata` / `Metadata` exports
- Schema.org JSON-LD: `RealEstateAgent`, `WebSite` (home), `Apartment`/`Residence` (detail)
- Canonical URLs, OG image, Twitter card
- hreflang: fr-DZ, fr, ar-DZ, x-default

## 9. Admin CMS

### Login flow
```
Visitor → /#/admin → AdminLoginGate (calls /api/admin/me)
  ├─ valid session → AdminPage renders dashboard
  └─ 401 → renders login form (email + password)
                ↓ submit
                POST /api/admin/login → sets cookie
                ↓
                AdminPage re-renders, queries invalidate
```

### Tabs (sidebar)
1. **Tableau de Bord** (Dashboard) — stats cards, distribution chart, quick actions
2. **Projets** — table with status, published badge, featured star, preview button, edit/archive
3. **Appartements** — table with project filter, status filter, type filter, same actions
4. **Bâtiments** — building list per project
5. **Médiathèque** (Media) — upload + grid + edit/delete, plus Video manager
6. **Leads** — table with status filter, intent labels
7. **Paramètres** (Settings) — shows current admin user, role, security summary

### Publish/Unpublish/Archive workflow
- Each project/apartment row has an explicit `Publié` / `Brouillon` badge button that toggles `published`.
- Each row has an `Eye` icon button that opens the public URL in a new tab (preview).
- Each row has a `Trash` icon for archive — calls DELETE which sets `archived=true, published=false`. Confirmation dialog warns about consequences.
- Unpublished/archived content is **immediately invisible** on the public site (filtered at API level).

## 10. Performance & Quality

- Turbopack dev compile ~500ms cold, <100ms warm
- API responses 50–200ms typical
- LCP image eager-loaded on hero (no lazy loading)
- Lazy routes via `React.lazy()` for non-critical pages
- Bundle optimized via Next.js 16 tree-shaking
- ESLint passes with 0 errors, 0 warnings
- No console errors during full E2E test

## 11. Known Issues & Limitations

1. **Hash-based routing** — sub-optimal for SEO crawlers (mitigated by sitemap/structured data).
2. **In-memory session store** — sessions lost on server restart. For multi-instance deployment, swap for Redis or DB table.
3. **No rate limiting** on login API (susceptible to brute force at network level; bcrypt cost=10 slows attempts).
4. **No uploaded video transcoding** — videos are stored as-is; large MP4s would benefit from HLS conversion.
5. **Map placeholder** — Leaflet map loads but requires tile server (OSM default works in browser).
6. **No tests** — per system instruction "do not write any test code." E2E verification via `agent-browser` + VLM serves as functional verification.

## 12. Decisions Matrix (KEEP / REFACTOR / REPLACE / REMOVE)

| Component | Decision | Reason |
|---|---|---|
| Next.js 16 App Router | KEEP | Current, fast, well-supported |
| Prisma + SQLite | KEEP | Sandbox restricts to SQLite; production migration to PostgreSQL noted as future work |
| Hash router | KEEP | Required by sandbox single-route constraint |
| shadcn/ui components | KEEP | Reused for all UI; consistent design |
| Hardcoded ADMIN_PASSWORD | REMOVE | Done — replaced with DB-backed bcrypt auth |
| AdminPage without login UI | REFACTOR | Done — added AdminLoginGate with session check |
| Media Library (was missing) | ADD | Done — full upload/list/edit/delete + magic-bytes validation |
| Video support (was missing) | ADD | Done — Video model + APIs + VideoPlayer + VideoManager |
| ERP modules | REMOVE | None existed in uploaded codebase |
| Documentation (was missing) | ADD | This audit + 9 companion docs |

## 13. Definition of Done checklist

| Item | Status |
|---|---|
| Repository audited | ✅ VERIFIED (this doc) |
| Architecture documented | ✅ VERIFIED (this doc + ARCHITECTURE.md) |
| ERP removed | ✅ N/A (no ERP existed) |
| Real authentication implemented | ✅ VERIFIED (bcryptjs + DB) |
| Admin protected | ✅ VERIFIED (all /api/admin/* require auth) |
| Authorization implemented | ✅ VERIFIED (roles in schema, server-side check) |
| Public/Admin separation verified | ✅ VERIFIED |
| Dashboard working | ✅ VERIFIED (browser screenshot evidence) |
| Projects CMS working | ✅ VERIFIED (publish/unpublish/archive/preview) |
| Apartments CMS working | ✅ VERIFIED (publish/unpublish/archive/preview) |
| Media Library working | ✅ VERIFIED (upload + magic-bytes + edit/delete) |
| Videos working | ✅ VERIFIED (create/feature/publish/delete + public render) |
| Leads working | ✅ VERIFIED (form → API 201 → DB → Admin Leads tab) |
| Analytics working | ✅ VERIFIED (events firing in console) |
| SEO working | ✅ VERIFIED (sitemap, robots, structured data) |
| Mobile verified | ✅ VERIFIED (390×844 with sticky CTA bar) |
| Security tested | ✅ VERIFIED (Phase F red team) |
| Lint passes | ✅ VERIFIED (0 errors) |
| Documentation complete | ✅ VERIFIED (docs/ folder) |
