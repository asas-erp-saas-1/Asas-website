# TESTING — ASAS Real Estate Platform

> Per system instruction "do not write any test code", this document records the **browser-based E2E verification** performed using `agent-browser` (Playwright-based CLI) and `z-ai vision` (VLM) for visual confirmation.

## 1. Test methodology

### 1.1 Tooling
- **agent-browser** v0.32.3 (headless Chromium via Playwright)
- **z-ai vision** (CLI: `z-ai vision -p "..." -i screenshot.png`) using `glm-5v-turbo` VLM
- **curl** for direct API endpoint testing
- **bun run lint** for code quality

### 1.2 Approach
For each major user flow:
1. Navigate to URL via `agent-browser open`
2. Wait for network idle
3. Capture full-page screenshot
4. Inspect via `agent-browser snapshot -i` for interactive elements
5. VLM-analyze the screenshot for visual quality + missing sections
6. Check `dev.log` for HTTP errors, hydration warnings, console errors
7. Test API endpoints via curl with/without auth cookies

## 2. Public Website tests

### 2.1 Homepage — ✅ VERIFIED
- URL: `http://localhost:3000/`
- HTTP: 200
- Screenshot: `qa-home-2025.png`
- VLM confirmed: premium luxury layout, hero with CTAs, stats bar (24 apartments, 5,650,000 DA starting price, 4 projects, 4 districts), 3 featured project cards, "Comment ça marche" 4-step process, trust section, developer CTA, final CTA with WhatsApp + Phone, comprehensive footer.
- Metadata: title, description, keywords, OG, Twitter, canonical, hreflang all present in HTML.
- Schema.org: `RealEstateAgent` + `WebSite` JSON-LD present.

### 2.2 Projects list page — ✅ VERIFIED
- URL: `/#/projects`
- Screenshot: `qa-projects-list.png`
- VLM confirmed: search bar, district filter pills, sort dropdown, project cards with images, starting prices, availability badges.

### 2.3 Project detail page — ✅ VERIFIED
- URL: `/#/projects/residence-les-oliviers`
- Screenshot: `qa-project-detail-v4.png`
- VLM confirmed: hero with project name, status badge "En commercialisation", tagline "L'élégance au cœur de Chéraga", location "Chéraga, Algiers", starting price "12 000 000 DA" in gold, "10 lots disponibles | Livraison Q4 2025", CTAs (WhatsApp + Voir les lots), 4-card overview (Localisation, Livraison, Type, Appartements, Surface, Parking), Bâtiments section (A & B), description, 10 apartment cards with F2/F3/F4 types, prices (12M-23.5M DA), amenities list, location section with map, lead generation form, footer.

### 2.4 Apartment detail page — ✅ VERIFIED
- URL: `/#/projects/residence-les-oliviers/apartments/les-oliviers-f3-92`
- Screenshot: `qa-apartment-detail.png`
- VLM confirmed: hero with apartment reference, type (F3 Familial), price (16.8M DA), status (Disponible), surface (92 m²), CTAs; information bar (Surface, Étage, Chambres, SDB, Orientation, Balcon, Parking); gallery with floor plan, 3D plan, render; mortgage simulator; lead form; related apartments.

### 2.5 Mobile apartment page — ✅ VERIFIED
- Viewport: 390×844
- Screenshot: `qa-mobile-apartment.png`
- VLM confirmed: single-column responsive layout, sticky bottom conversion bar (WhatsApp + Appeler), no horizontal overflow, touch-friendly CTAs, responsive images.

### 2.6 Sticky footer — ✅ VERIFIED
- Pages tested: `/#/privacy`, `/#/terms` (short content)
- Viewports: 390×600, 1440×900
- Footer sticks to bottom of viewport on short pages, gets pushed naturally on long pages (no overlap, no floating gap).

### 2.7 SEO endpoints — ✅ VERIFIED
- `/sitemap.xml`: valid XML with all major routes (verified via curl)
- `/robots.txt`: proper directives + sitemap reference
- `/manifest.webmanifest`: valid PWA manifest with name, theme_color, icons

## 3. Lead submission (end-to-end) — ✅ VERIFIED

1. On apartment detail page (`les-oliviers-f3-92`), filled the lead form:
   - Nom: "Test User"
   - Téléphone: "0500000000"
   - Email: "test@example.com"
   - Message: "Bonjour, je suis intéressé par cet appartement. Merci de me recontacter."
2. Clicked "Envoyer ma demande"
3. Server: `POST /api/leads` → **201 Created**
4. Console analytics events fired:
   - `[Analytics] form_start {form_id: 'shared_lead_form'}`
   - `[Analytics] form_submit {form_id: 'shared_lead_form', intent: 'REQUEST_INFORMATION', project_name: 'Résidence Les Oliviers', apartment_name: 'F3 Familial (92 m²)'}`
   - `[Analytics] form_success {form_id: 'shared_lead_form', intent: 'REQUEST_INFORMATION'}`
5. DB row verified via script:
   ```
   name: Test User
   phone: 0500000000
   email: test@example.com
   intent: REQUEST_INFORMATION
   status: NEW
   projectName: Résidence Les Oliviers
   apartmentName: F3 Familial (92 m²)
   ```
6. Admin → Leads tab: lead row visible with all fields, status "Nouveau", date "19 août 2026".

## 4. Admin tests

### 4.1 Login flow — ✅ VERIFIED
- Navigated to `/#/admin` while logged out
- Login form renders with email + password fields
- Submitted `admin@asas.dz` / `admin123`
- POST `/api/admin/login` → 200, set cookie
- Dashboard renders with stat cards, distribution chart, sidebar

### 4.2 Session persistence — ✅ VERIFIED
- Logged in, then reloaded the page
- AdminLoginGate calls `/api/admin/me` on mount
- Returns 200 with user info → skips login form, dashboard renders directly

### 4.3 Logout — ✅ VERIFIED
- Clicked "Déconnexion" in sidebar
- POST `/api/admin/logout` → 200, cookie cleared, session revoked in-memory store
- Reload → login form renders again

### 4.4 Dashboard — ✅ VERIFIED
- Stat cards: 4 Projects, 22 Available, 4 Reserved, 0 new Leads
- Distribution chart for apartments (Available/Reserved/Sold/Total)
- Quick-action buttons (Gérer Projets, Gérer Appartements, Voir Leads)

### 4.5 Projects tab — ✅ VERIFIED
- Table with: name, slug, location, status, published badge (green "Publié" / orange "Brouillon"), apartment count, featured star, starting price, actions (Preview eye, Edit chevron, Archive trash)
- Toggle published: badge changes from green to orange, project immediately invisible on public site
- Archive with confirmation dialog

### 4.6 Apartments tab — ✅ VERIFIED
- Same table layout with project/status/type filters
- Same publish/unpublish/archive/preview actions

### 4.7 Media Library tab — ✅ VERIFIED
- Upload card on left: entity selector, type selector, alt + caption fields, drag-drop zone
- Media grid on right: responsive (2 cols mobile, 4 cols desktop), thumbnails with entity + type badges
- Edit dialog (type, alt, caption) + Delete with confirmation
- Filter bar: entity type, media type, search

### 4.8 Videos (inside Media tab) — ✅ VERIFIED
- Added test video (YouTube URL, type=WALKTHROUGH, featured)
- Video appears in admin list with featured/publish toggle buttons
- Public project detail page renders VideoSection with thumbnail + green play button
- Clicking opens YouTube embed in iframe

### 4.9 Leads tab — ✅ VERIFIED
- Table with: Name, Phone, Email, Intention, Property, Status, Date
- Filter dropdown for status
- Test lead visible with all fields populated

### 4.10 Settings tab — ✅ VERIFIED
- Shows current admin user (name, email, role)
- Role description
- Security summary card

## 5. Red Team / Adversarial tests — ✅ VERIFIED

### 5.1 Unauthenticated API access
| Endpoint | Expected | Actual |
|---|---|---|
| GET /api/admin/projects | 401 | 401 ✅ |
| GET /api/admin/apartments | 401 | 401 ✅ |
| GET /api/admin/leads | 401 | 401 ✅ |
| GET /api/admin/buildings | 401 | 401 ✅ |
| GET /api/admin/media | 401 | 401 ✅ |
| GET /api/admin/videos | 401 | 401 ✅ |
| GET /api/admin/me | 401 | 401 ✅ |

### 5.2 Login attacks
| Test | Expected | Actual |
|---|---|---|
| Login with old password `asas2024` | 401 | 401 ✅ |
| Login with wrong password | 401 | 401 ✅ |
| Login with wrong email | 401 | 401 ✅ |
| Login with empty body | 400 | 400 ✅ |
| Login with correct credentials | 200 + cookie | 200 + cookie ✅ |

### 5.3 File upload attacks
| Test | Expected | Actual |
|---|---|---|
| Upload `.txt` renamed as `image/jpeg` | 415 MIME mismatch | 415 ✅ |
| Upload `.txt` renamed as `image/gif` | 415 MIME mismatch | 415 ✅ |
| Upload without auth cookie | 401 | 401 ✅ |
| Upload valid JPEG with auth | 200, file saved | 200 ✅ |

### 5.4 Public access to private data
| Test | Expected | Actual |
|---|---|---|
| Unpublished project via `/api/projects/[slug]` | 404 | 404 ✅ |
| Unpublished video via `/api/videos` | filtered out | filtered out ✅ |
| Draft apartment via `/api/apartments/[slug]` | 404 | 404 ✅ |

### 5.5 SQL injection attempts (lead form)
| Input | Expected | Actual |
|---|---|---|
| `' OR 1=1 --` as name | stored as text, no SQL executed | stored as text ✅ |
| `Robert'); DROP TABLE Lead;--` as name | stored as text, no SQL executed | stored as text ✅ |

(Prisma uses parameterized queries — no SQL injection vector.)

### 5.6 XSS attempts (lead form)
| Input | Expected | Actual |
|---|---|---|
| `<script>alert(1)</script>` as message | stored as text, escaped when rendered | stored as text, escaped ✅ |
| `<img src=x onerror=alert(1)>` as message | stored as text, escaped | stored as text, escaped ✅ |

(React JSX auto-escapes; no `dangerouslySetInnerHTML` in codebase.)

### 5.7 Mobile overflow tests
| Viewport | Page | Expected | Actual |
|---|---|---|---|
| 360×640 | Homepage | no overflow | ✅ |
| 390×844 | Apartment detail | no overflow, sticky CTA | ✅ |
| 430×932 | Project detail | no overflow | ✅ |
| 768×1024 | Projects list | tablet layout works | ✅ |
| 1440×900 | All | desktop layout intact | ✅ |

## 6. Code quality — ✅ VERIFIED

- **ESLint**: `bun run lint` → 0 errors, 0 warnings
- **TypeScript**: strict mode, Next.js 16 type checking enabled
- **No `any` types** in admin-auth, video routes, media routes (only in legacy shared components where data shapes are dynamic)
- **No `dangerouslySetInnerHTML`** anywhere (grep confirmed)
- **No `eval()` or `Function()`** anywhere

## 7. Test coverage gaps

The following are NOT tested (per system instruction "do not write any test code"):
- Unit tests for `admin-auth.ts` (bcrypt verification, session creation/revocation)
- Integration tests for `/api/admin/*` endpoints
- E2E Playwright tests for the full admin workflow
- Visual regression tests
- Accessibility (axe-core) tests
- Performance (Lighthouse) audits

**Mitigation**: Browser-based E2E via `agent-browser` + VLM screenshot analysis serves as functional verification, covering the golden paths and several adversarial cases.

## 8. Continuous integration recommendations

For production CI/CD:
1. Add `bun run lint` step
2. Add `bun run db:push` step (verify schema is in sync)
3. Add Playwright E2E tests (smoke test each public route + admin login)
4. Add Lighthouse CI for performance budgets
5. Add axe-core for accessibility checks
6. Add Snyk/Dependabot for dependency vulnerability scanning
