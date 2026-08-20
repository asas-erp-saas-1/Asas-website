# ARCHITECTURE — ASAS Real Estate Platform

## 1. High-Level Diagram

```
                        ┌──────────────────────────────┐
                        │       USER (visitor)          │
                        └──────────────┬───────────────┘
                                       │
                                       ↓
                        ┌──────────────────────────────┐
                        │   Browser (single page app)  │
                        │   /                          │
                        │   /#/projects/...            │
                        │   /#/admin                   │
                        └──────────────┬───────────────┘
                                       │
                                       ↓
                ┌──────────────────────────────────────────┐
                │          Next.js 16 (Turbopack)          │
                │   App Router with single / route         │
                │                                          │
                │   Server-side:                           │
                │     - /api/projects, /api/apartments     │
                │     - /api/leads (POST only)             │
                │     - /api/videos                        │
                │     - /api/admin/* (auth required)       │
                │     - /sitemap.xml, /robots.txt          │
                │     - /manifest.webmanifest              │
                └──────────────────┬──────────────────────┘
                                   │
                                   ↓
                ┌──────────────────────────────────────────┐
                │            Prisma ORM 6                  │
                │   schema: 10 models (Project,           │
                │   Apartment, Media, Video, Lead, etc.)  │
                └──────────────────┬──────────────────────┘
                                   │
                                   ↓
                ┌──────────────────────────────────────────┐
                │      SQLite database (single file)       │
                │      /home/z/my-project/db/custom.db     │
                └──────────────────────────────────────────┘
```

## 2. Codebase Layout

```
/home/z/my-project/
├── prisma/
│   ├── schema.prisma      # 10 models
│   └── seed.ts            # 4 projects, 28 apartments, etc.
├── public/
│   ├── images/             # Original seed images (projects, apartments, brand)
│   └── uploads/            # Admin-uploaded media (projects/<slug>/, apartments/<slug>/)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Single route — renders the SPA
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── sitemap.ts      # Sitemap.xml generation
│   │   ├── manifest.ts     # PWA manifest
│   │   ├── globals.css     # Tailwind base + custom utilities
│   │   └── api/
│   │       ├── projects/[slug]/route.ts
│   │       ├── apartments/[slug]/route.ts
│   │       ├── leads/route.ts
│   │       ├── stats/route.ts
│   │       ├── videos/route.ts
│   │       ├── ai-search/route.ts
│   │       ├── newsletter/{subscribe,unsubscribe}/route.ts
│   │       └── admin/
│   │           ├── login/route.ts
│   │           ├── logout/route.ts
│   │           ├── me/route.ts
│   │           ├── media/route.ts
│   │           ├── media/upload/route.ts
│   │           ├── media/[id]/route.ts
│   │           ├── videos/route.ts
│   │           ├── videos/[id]/route.ts
│   │           ├── projects/route.ts
│   │           ├── projects/[slug]/route.ts
│   │           ├── apartments/route.ts
│   │           ├── apartments/[slug]/route.ts
│   │           ├── apartments/[slug]/status/route.ts
│   │           ├── buildings/route.ts
│   │           └── leads/route.ts
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitives (49 components)
│   │   ├── shared/         # App-specific shared components
│   │   │   ├── Navbar.tsx, Footer.tsx, StickyMobileCTA.tsx
│   │   │   ├── ApartmentCard.tsx, ProjectCard.tsx
│   │   │   ├── LeadForm.tsx, CompareBar.tsx, CompareModal.tsx
│   │   │   ├── FloorPlanViewer.tsx, ProjectGallery.tsx
│   │   │   ├── VideoPlayer.tsx, MediaLibrary.tsx (admin)
│   │   │   └── ... (50+ total)
│   │   ├── pages/          # Top-level page components
│   │   │   ├── HomePage.tsx, ProjectsPage.tsx
│   │   │   ├── ProjectDetailPage.tsx, ApartmentDetailPage.tsx
│   │   │   ├── AdminPage.tsx  (with MediaTab, VideoManager, SettingsTab)
│   │   │   └── ... (13 page components)
│   │   └── layout/         # Layout helpers
│   ├── lib/
│   │   ├── db.ts           # Prisma client singleton
│   │   ├── admin-auth.ts   # Session store + bcrypt verify + roles
│   │   ├── router.ts       # Zustand-based hash router
│   │   ├── api.ts          # TanStack Query hooks (useProject, useApartment)
│   │   ├── constants.ts    # ASAS brand info, formatPrice, WhatsApp URL
│   │   ├── seo.ts          # Schema.org generators
│   │   ├── favorites.ts, recently-viewed.ts, ui-store.ts  # Zustand stores
│   │   ├── with-security-headers.ts  # HTTP hardening
│   │   └── ...
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── styles/
├── scripts/
│   └── fix-image-urls.ts  # One-off DB fixer for broken image URLs
├── docs/                   # ← you are here
├── prisma/
├── public/
└── worklog.md              # Session-by-session work log
```

## 3. Request Lifecycle

### Public page load (e.g. /#/projects/residence-les-oliviers)
1. Browser requests `/` → Next.js returns SSR HTML (router starts at `home`).
2. Client mounts, `syncFromHash()` reads `window.location.hash` and updates Zustand route store.
3. `<Router/>` switch renders `<ProjectDetailPage projectSlug="residence-les-oliviers" />` via `React.lazy`.
4. `useProject(projectSlug)` TanStack Query hook fetches `GET /api/projects/residence-les-oliviers`.
5. Prisma executes `findUnique` with eager-load of `buildings`, `apartments`, `images`, `amenities`, `developer`.
6. Server returns JSON; React renders hero, gallery, apartments grid, amenities, lead form.
7. `useEffect` triggers `GET /api/videos?projectId=...`; if videos exist, `VideoSection` renders.

### Admin login + dashboard
1. Browser → `/#/admin` → `AdminPage` renders `AdminLoginGate`.
2. Gate `useEffect` calls `GET /api/admin/me` with cookies.
3. If 401, renders login form (email + password).
4. User submits → `POST /api/admin/login` → server verifies via `bcryptjs.compare(password, db.passwordHash)`.
5. Server creates session in `Map<token, AdminSession>`, sets `admin-session` cookie (httpOnly, sameSite=lax, path=/).
6. Client `setIsAuthenticated(true)` + `queryClient.invalidateQueries(['admin'])`.
7. All four admin queries (`projects`, `apartments`, `buildings`, `leads`) refetch with the cookie; server returns 200.

### Admin media upload
1. User selects file in `MediaUploadCard`, fills alt/caption, picks entity + type.
2. `doUpload()` creates `FormData`, opens `XMLHttpRequest` (for `upload.onprogress`).
3. Server `POST /api/admin/media/upload`:
   - `verifyAdminAuth(request)` → 401 if no session
   - Reads `formData.file`
   - Validates declared MIME
   - Validates size ≤ 8 MB
   - Reads bytes, verifies magic bytes (defense-in-depth against MIME spoofing)
   - Validates project/apartment exists in DB
   - Writes file to `public/uploads/{entityType}s/{slug}/{filename}`
   - Inserts `ProjectImage` or `ApartmentImage` row
4. Returns `{ success, id, url }` → client invalidates `['admin', 'media']` query.

## 4. Data Flow Principles

- **Single source of truth**: Prisma/SQLite. No duplicated business data in JSON or components.
- **Read-time filtering**: Public APIs filter `published=true AND archived=false` at query level. Drafts never leak.
- **Write-time authorization**: All `/api/admin/*` routes call `verifyAdminAuth()` first.
- **Cache invalidation**: React Query keys are stable per resource; mutations call `invalidateQueries` to refresh.
- **Soft delete**: Projects/apartments/archived via `archived=true` flag (preserves referential integrity for historical leads).

## 5. Security Layers

1. **Network**: Caddy gateway with `XTransformPort` query param routing.
2. **HTTP**: `withSecurityHeaders` adds `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`.
3. **Auth**: `verifyAdminAuth` on every `/api/admin/*` route.
4. **Authorization**: `sessionHasRole()` helper for role-aware checks (ADMIN/EDITOR/VIEWER).
5. **Input validation**: Zod schemas on POST/PATCH bodies (leads, videos, etc.).
6. **File upload**: Multi-layer validation (auth → MIME → size → magic-bytes → entity existence).
7. **No service_role secrets in client**: `z-ai-web-dev-sdk` only imported in server files; no `NEXT_PUBLIC_SUPABASE_*` keys exposed.

## 6. Build & Deployment

### Dev server
```bash
bun run dev    # Next.js 16 Turbopack on port 3000
```

### Database
```bash
bun run db:push     # prisma db push
bun run db:seed     # bunx prisma db seed → bun prisma/seed.ts
bun run db:generate # prisma generate (regenerate client after schema changes)
```

### Lint
```bash
bun run lint       # eslint .  → 0 errors, 0 warnings
```

### Production considerations (not executed in sandbox)
- `bun run build` produces `.next/standalone/` (configured via `output: 'standalone'` in `next.config.ts`).
- `bun run start` runs the standalone server.
- Vercel deployment would require `vercel` CLI credentials (not available in sandbox).
