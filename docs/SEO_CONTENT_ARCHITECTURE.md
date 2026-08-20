# SEO_CONTENT_ARCHITECTURE.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — SEO Content Model + URL Strategy + Auto-generation Rules**

## 1. SEO Fields Per Entity

### Project (6 fields)
| Field | Type | Required | Auto-Gen if Null | Character Limit |
|---|---|---|---|---|
| seoTitle | String? | no | `{name} — {district} \| ASAS Immobilier` | 50-60 chars recommended |
| seoDescription | String? | no | `{tagline}. À partir de {startingPrice} DA.` | 150-160 chars recommended |
| seoKeywords | String? | no | (no auto-gen — leave empty) | comma-separated |
| canonicalUrl | String? | no | `https://asas.dz/#/projects/{slug}` | URL |
| ogImage | String? | no | First `ProjectImage` with `type=hero` | URL, 1200×630 recommended |
| robotsIndex | Boolean | yes (default true) | (always set) | true=index, false=noindex |

### Apartment (6 fields)
| Field | Type | Required | Auto-Gen if Null | Character Limit |
|---|---|---|---|---|
| seoTitle | String? | no | `{typeName} {surface}m² — {project.name} \| ASAS` | 50-60 chars |
| seoDescription | String? | no | `{typeName} de {surface}m² à {project.name}. {bedrooms} chambres. À partir de {price} DA.` | 150-160 chars |
| seoKeywords | String? | no | (no auto-gen) | comma-separated |
| canonicalUrl | String? | no | `https://asas.dz/#/projects/{project.slug}/apartments/{slug}` | URL |
| ogImage | String? | no | First `ApartmentImage` with `type=hero` | URL |
| robotsIndex | Boolean | yes (default true) | (always set) | true=index, false=noindex |

### Homepage
- **seoTitle**: hardcoded in layout.tsx (can be moved to SiteContent key `homepage_seo_title`)
- **seoDescription**: hardcoded (can be moved to SiteContent)
- **ogImage**: `/images/brand/hero.jpg`
- **canonical**: `https://asas.dz`

### Campaign Landing Pages (future)
- Per-campaign SEO fields (not yet implemented)

### Insights/Blog (future)
- Per-article SEO fields (not yet implemented)

## 2. Auto-Generation Rules

When an admin leaves an SEO field empty, the system auto-generates from entity data:

### Project SEO Title (if null)
```
{project.name} — {project.district} | ASAS Immobilier
```
Example: `Résidence Les Oliviers — Chéraga | ASAS Immobilier`

### Project SEO Description (if null)
```
{project.tagline}. {project.apartmentTypes count} types disponibles. À partir de {project.startingPrice} DA.
```
Example: `L'élégance au cœur de Chéraga. F2, F3, F4 disponibles. À partir de 12 000 000 DA.`

### Apartment SEO Title (if null)
```
{apartment.typeName} {apartment.surface}m² — {project.name} | ASAS
```
Example: `F3 Familial 92m² — Résidence Les Oliviers | ASAS`

### Apartment SEO Description (if null)
```
{apartment.typeName} de {apartment.surface}m² à {project.name}, {project.district}. {apartment.bedrooms} chambres, {apartment.bathrooms} SDB. {status label}. {price} DA.
```
Example: `F3 Familial de 92m² à Résidence Les Oliviers, Chéraga. 3 chambres, 1 SDB. Disponible. 16 800 000 DA.`

### OG Image (if null)
- Project: first `ProjectImage` where `type=hero`
- Apartment: first `ApartmentImage` where `type=hero`
- Fallback: `/images/brand/hero.jpg`

### Canonical URL (if null)
- Project: `https://asas.dz/#/projects/{slug}`
- Apartment: `https://asas.dz/#/projects/{project.slug}/apartments/{slug}`
- Homepage: `https://asas.dz`

## 3. URL Strategy

### Current (sandbox constraint)
Hash-based routing:
```
/                              → Home
/#/projects                   → Projects list
/#/projects/{slug}            → Project detail
/#/projects/{slug}/apartments/{apt-slug}  → Apartment detail
/#/admin                      → Admin
```

### Target (production)
Semantic App Router URLs:
```
/                              → Home
/projects                     → Projects list
/projects/{slug}              → Project detail (SSR via generateMetadata)
/projects/{slug}/apartments/{apt-slug}  → Apartment detail (SSR)
/admin                        → Admin (client-side SPA)
```

**Migration path** (when sandbox allows):
1. Create `src/app/projects/page.tsx` (server component)
2. Create `src/app/projects/[slug]/page.tsx` with `generateMetadata`
3. Create `src/app/projects/[slug]/apartments/[apartmentSlug]/page.tsx`
4. Remove hash router — use Next.js Link navigation
5. Update sitemap.xml to use semantic URLs
6. 301 redirect old hash URLs to new URLs (via middleware or Caddy)

### Slug Rules
- Format: kebab-case (lowercase, hyphens, no special chars)
- Example: `residence-les-oliviers`, `les-oliviers-f3-92`
- Unique per entity type
- Should NOT be changed after creation (breaks SEO + bookmarks)
- If slug change is needed: create 301 redirect from old to new

### 404 Behavior
- Non-existent slug → 404 page with "Projet introuvable" + search suggestions
- Unpublished slug → 404 (same as non-existent — no information leak)
- Archived slug → 404 (same)

### Redirect Rules
- `/#/projects/{old-slug}` → `/projects/{new-slug}` (301 permanent, after slug migration)
- `/#/admin` → `/admin` (after hash router removal)

## 4. Sitemap Behavior

### Current
`src/app/sitemap.ts` generates XML sitemap from database:
- Includes all `published=true AND archived=false` projects + apartments
- Also includes: home, projects list, services, about, contact, insights, privacy, terms
- `lastmod` = current timestamp (or entity updatedAt)
- Priority: home=1.0, projects=0.9, project detail=0.8, apartment detail=0.7, legal=0.3

### Target
- Use Next.js `sitemap()` function for dynamic generation
- Only published + non-archived content
- Auto-exclude `robotsIndex=false` entities
- Submit to Google Search Console

## 5. Robots.txt Behavior

### Current
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://asas.dz/sitemap.xml
Crawl-delay: 1
```

### Target
- Also disallow `/admin` (currently via hash route, but after migration: `/admin`)
- Add specific rules for AI crawlers if needed

## 6. Structured Data (Schema.org JSON-LD)

### Homepage
```json
{
  "@type": "RealEstateAgent",
  "name": "ASAS — Agence de Commercialisation Immobilière",
  "description": "...",
  "url": "https://asas.dz",
  "telephone": "+213 770 51 82 88",
  "email": "asas.agency.dz@gmail.com",
  "address": { "@type": "PostalAddress", "addressLocality": "Alger", "addressCountry": "DZ" },
  "areaServed": [...],
  "knowsAbout": [...]
}
+
{
  "@type": "WebSite",
  "name": "ASAS",
  "url": "https://asas.dz",
  "inLanguage": "fr-DZ"
}
```

### Project Detail
```json
{
  "@type": "Apartment",
  "name": "{project.name}",
  "description": "{seoDescription or auto-gen}",
  "url": "{canonicalUrl}",
  "address": { "@type": "PostalAddress", "addressLocality": "{city}", "addressRegion": "{district}", "addressCountry": "DZ" },
  "geo": { "@type": "GeoCoordinates", "latitude": {latitude}, "longitude": {longitude} },
  "numberOfRooms": {apartmentCount},
  "offers": { "@type": "AggregateOffer", "priceCurrency": "DZD", "lowPrice": {startingPrice} },
  "amenityFeature": [...amenities],
  "image": [...gallery image URLs]
}
```

### Apartment Detail
```json
{
  "@type": "Apartment",
  "name": "{typeName} {surface}m²",
  "description": "{seoDescription or auto-gen}",
  "url": "{canonicalUrl}",
  "numberOfRooms": {bedrooms},
  "floorSize": { "@type": "QuantitativeValue", "value": {surface}, "unitCode": "MTK" },
  "floorLevel": "{floor}",
  "offers": { "@type": "Offer", "price": {price}, "priceCurrency": "DZD", "availability": "{schema availability}" },
  "image": [...gallery image URLs],
  "containedInPlace": { "@type": "Apartment", "name": "{project.name}" }
}
```

### Breadcrumbs
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://asas.dz" },
    { "@type": "ListItem", "position": 2, "name": "Projets", "item": "https://asas.dz/projects" },
    { "@type": "ListItem", "position": 3, "name": "{project.name}", "item": "{canonicalUrl}" }
  ]
}
```

### Status → Schema availability mapping
| Apartment status | Schema `availability` |
|---|---|
| AVAILABLE | `https://schema.org/InStock` |
| RESERVED | `https://schema.org/BackOrder` |
| SOLD | `https://schema.org/SoldOut` |
| COMING_SOON | `https://schema.org/PreOrder` |
| OFF_MARKET | (omit structured data) |
| DRAFT | (omit — not public) |

## 7. Index/Noindex Behavior

| State | robotsIndex | Public API | Sitemap | Structured Data |
|---|---|---|---|---|
| Published (published=true, archived=false) | true (default) | ✅ Returns | ✅ Included | ✅ Rendered |
| Published + robotsIndex=false | false | ✅ Returns | ❌ Excluded | ✅ Rendered with noindex |
| Draft (published=false) | (irrelevant) | ❌ 404 | ❌ Excluded | ❌ Not rendered |
| Archived (archived=true) | (irrelevant) | ❌ 404 | ❌ Excluded | ❌ Not rendered |

## 8. Next.js Metadata Integration

### Current (hash routing)
- `src/app/layout.tsx` exports static `Metadata` for homepage
- Page components set metadata via React Helmet or inline `<title>` (not ideal)

### Target (App Router)
- `src/app/projects/[slug]/page.tsx` uses `generateMetadata`:
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await db.project.findUnique({ where: { slug: params.slug } });
  if (!project || !project.published || project.archived) {
    return { title: 'Projet introuvable', robots: { index: false } };
  }
  return {
    title: project.seoTitle || `${project.name} — ${project.district} | ASAS`,
    description: project.seoDescription || autoGenDescription(project),
    canonical: project.canonicalUrl || `https://asas.dz/projects/${project.slug}`,
    openGraph: {
      title: project.seoTitle || project.name,
      description: project.seoDescription || autoGenDescription(project),
      images: [project.ogImage || project.images[0]?.url].filter(Boolean),
    },
    robots: { index: project.robotsIndex, follow: true },
  };
}
```

## 9. SEO Validation

### Pre-publish checklist (in Publication tab)
- ⚠ SEO title empty → auto-generated (acceptable, but manual override recommended)
- ⚠ SEO description empty → auto-generated
- ⚠ OG image empty → auto-uses hero image
- ✅ robotsIndex=true (indexable)

### Google Rich Results eligibility
- **Apartment** schema is NOT a Google-recognized rich result type (as of 2026)
- **RealEstateAgent** schema IS recognized (for the organization, not individual listings)
- **BreadcrumbList** IS recognized → eligible for breadcrumb rich result
- **FAQPage** schema (if FAQ section exists on project page) → eligible for FAQ rich result

**Rule**: Only output structured data for schemas Google actually supports. Do NOT invent rich result expectations.

## 10. SEO Content Workflow

1. Admin creates project → leaves SEO fields empty → auto-generation handles it
2. Admin fills SEO fields → manual override takes precedence
3. Admin toggles `robotsIndex=false` → page gets `<meta name="robots" content="noindex">`
4. Admin publishes → sitemap includes URL, structured data renders
5. Admin unpublishes → sitemap excludes URL, public API returns 404, no structured data
6. Admin archives → everything disappears, 404 on direct access
