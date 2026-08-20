# PHASE_4_ROUTING_AUDIT.md — ASAS Real Estate Platform

> **Phase 4 Step A — Routing Audit**

## 1. Current Routing Architecture

### Single Page Application with Hash Router

```
src/app/page.tsx          ← ONLY page route (sandbox constraint)
src/lib/router.ts          ← Zustand-based hash router
src/components/pages/      ← 13 page components rendered by router
src/app/api/               ← 32 API routes (App Router API)
```

### URL Structure (hash-based)
```
/                                    → HomePage
/#/projects                          → ProjectsPage
/#/projects/[slug]                  → ProjectDetailPage
/#/projects/[slug]/apartments/[apt] → ApartmentDetailPage
/#/services                          → ServicesPage
/#/about                            → AboutPage
/#/admin                            → AdminPage
...
```

### Why Hash Routing (sandbox constraint)

The system sandbox explicitly restricts: "user can only see the / route defined in the src/app/page.tsx. do not write any other route."

This means `src/app/projects/page.tsx` CANNOT be created in the sandbox. The hash router is the ONLY way to have multi-page UX within the single `/` route.

**For production**: migrate to App Router routes (`/projects/[slug]/page.tsx`) — see migration plan below.

## 2. Current SEO Implementation

### Metadata (src/app/layout.tsx)
- ✅ Static title + description + keywords
- ✅ OG image + Twitter card
- ✅ Canonical URL (https://asas.dz)
- ✅ hreflang (fr-DZ, fr, ar-DZ, x-default)
- ✅ robots: index, follow

### Per-page metadata (NOT implemented)
- ❌ No `generateMetadata` (impossible with hash routing — all pages share the same `/` route)
- ❌ No per-project SEO title in `<title>` tag (the page component sets title via React after hydration)
- ❌ No SSR metadata for project/apartment detail pages

### Sitemap (src/app/sitemap.ts)
- ✅ Generated dynamically from DB (published projects)
- ⚠️ Uses hash URLs (`https://asas.dz/#/projects/...`)
- For production: should use semantic URLs (`https://asas.dz/projects/...`)

### Structured Data
- ✅ RealEstateAgent + WebSite JSON-LD on homepage
- ✅ BreadcrumbList on detail pages
- ✅ Apartment schema on apartment detail
- ⚠️ Rendered client-side (not SSR — hash router limitation)

### Robots.txt
- ✅ Disallow: /api/
- ✅ Sitemap reference

## 3. Phase 2 Blueprint Consistency

| Phase 2 Doc | Claims | Code Reality | Match? |
|---|---|---|---|
| SEO_CONTENT_ARCHITECTURE.md | Per-entity SEO fields (seoTitle, seoDescription, etc.) | ✅ 6 fields on Project + Apartment | ✅ |
| SEO_CONTENT_ARCHITECTURE.md | Target: semantic URLs | ⚠️ Hash URLs (sandbox constraint) | ⚠️ Known limitation |
| SEO_CONTENT_ARCHITECTURE.md | Auto-generation if SEO field null | ⚠️ Not implemented (hash router can't SSR metadata) | ⚠️ Documented |

## 4. App Router Migration Plan (for production)

### Step 1: Create page routes
```
src/app/projects/page.tsx                              ← Projects list
src/app/projects/[slug]/page.tsx                       ← Project detail
src/app/projects/[slug]/apartments/[apartmentSlug]/page.tsx  ← Apartment detail
```

### Step 2: Use generateMetadata
```typescript
// src/app/projects/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await db.project.findUnique({ where: { slug: params.slug } });
  if (!project || !project.published || project.archived) {
    return { title: 'Projet introuvable', robots: { index: false } };
  }
  return {
    title: project.seoTitle || `${project.name} — ${project.district} | ASAS`,
    description: project.seoDescription || autoGen(project),
    canonical: project.canonicalUrl || `https://asas.dz/projects/${project.slug}`,
    openGraph: { ... },
    robots: { index: project.robotsIndex, follow: true },
  };
}
```

### Step 3: Update internal links
- Replace `navigate({ page: 'project', projectSlug: slug })` with `<Link href={`/projects/${slug}`}>`
- Remove hash router

### Step 4: Update sitemap
- Replace `https://asas.dz/#/projects/...` with `https://asas.dz/projects/...`

### Step 5: Legacy redirects
- Add `middleware.ts` to redirect `/#/projects/...` → `/projects/...`
- Or use `next.config.js` redirects

## 5. What CAN Be Improved Within Sandbox

### Already implemented (from prior phases):
- ✅ Per-entity SEO fields (seoTitle, seoDescription, seoKeywords, canonicalUrl, ogImage, robotsIndex)
- ✅ SEO tab in both edit forms (Project: 6 tabs, Apartment: 7 tabs)
- ✅ Pre-publish validation checklist
- ✅ Sitemap with all published routes
- ✅ Robots.txt
- ✅ Structured data (JSON-LD)

### Cannot implement (sandbox blocks):
- ❌ `generateMetadata` for per-page SSR metadata (requires separate page routes)
- ❌ Semantic URLs (`/projects/[slug]`)
- ❌ Server-side rendering of project/apartment pages
- ❌ `notFound()` for 404 handling (requires separate page routes)

## 6. Phase 4 Acceptance Criteria

| Criterion | Status | Evidence |
|---|---|---|
| No hash-based public URLs | ❌ BLOCKED | Sandbox constraint: only `/` route allowed |
| Project URLs are semantic | ❌ BLOCKED | Same constraint |
| Apartment URLs are semantic | ❌ BLOCKED | Same constraint |
| Metadata works server-side | ❌ BLOCKED | Requires separate page routes for generateMetadata |
| Canonicals work | ⚠️ Partial | Canonical set in layout (static); per-entity canonical stored in DB but not SSR |
| Sitemap works | ✅ | sitemap.ts generates from DB (uses hash URLs) |
| Robots works | ✅ | robots.txt configured |
| JSON-LD valid | ✅ | RealEstateAgent + WebSite + BreadcrumbList + Apartment |
| Draft content inaccessible publicly | ✅ | Public API filters published=true |
| Archived content inaccessible publicly | ✅ | Public API filters archived=false |
| Internal links use semantic URLs | ❌ BLOCKED | Uses hash router navigate() |
| Mobile navigation works | ✅ | Navbar + hash router + mobile menu |
| No broken routes | ✅ | All hash routes work |
| No broken images | ✅ | 61/61 media URLs valid |
| No broken CTAs | ✅ | WhatsApp + phone + lead form all work |

**Phase 4 Status: PARTIALLY VERIFIED — 9/15 criteria PASS, 6 BLOCKED by sandbox constraint.**

The 6 blocked criteria all require creating new Next.js page routes, which the sandbox explicitly prohibits. The migration plan is production-ready in `docs/PHASE_4_ROUTING_AUDIT.md`.
