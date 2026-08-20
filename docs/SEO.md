# SEO — ASAS Real Estate Platform

## 1. Metadata strategy

### 1.1 Site-wide metadata (`src/app/layout.tsx`)
- `title`: "ASAS — Agence de Commercialisation Immobilière | Alger, Algérie"
- `description`: "ASAS commercialise vos projets immobiliers avec excellence. Découvrez les programmes neufs à Alger : appartements F2, F3, F4 à Chéraga, Bordj El Bahri, Dar El Beïda et plus."
- `keywords`: ASAS, immobilier Alger, appartement neuf Alger, F2/F3/F4, Chéraga, Bordj El Bahri, Dar El Beïda, etc.
- `canonical`: `https://asas.dz`
- `hreflang`: fr-DZ, fr, ar-DZ, x-default
- `robots`: `index, follow` (Googlebot: `max-video-preview:-1, max-image-preview:large, max-snippet:-1`)
- `format-detection: address=no` (no auto-link iOS phone numbers)
- `category: Real Estate`
- `application-name`, `author`, `publisher`, `creator`: ASAS

### 1.2 OpenGraph
- `og:title`, `og:description`, `og:url`, `og:site_name=ASAS`
- `og:locale=fr_DZ`
- `og:type=website`
- `og:image`: multiple (hero + per-project)

### 1.3 Twitter cards
- `twitter:card=summary_large_image`
- `twitter:creator=@asas`
- `twitter:title`, `twitter:description`, `twitter:image`

### 1.4 Icons
- `favicon.ico` (any size)
- `favicon.svg` (vector)
- `apple-touch-icon: /favicon.svg`

## 2. Per-page metadata

Each public page component exports its own `metadata` (or `generateMetadata` for dynamic) — see `src/components/pages/*.tsx` and `src/app/page.tsx`.

### Project detail page
- Title: `{project.name} — {district} | ASAS Immobilier`
- Description: project tagline + starting price
- Canonical: `https://asas.dz/#/projects/{slug}`
- OG image: project hero image
- JSON-LD: `Apartment`/`Residence` structured data

### Apartment detail page
- Title: `{apartment.typeName} — {surface}m² — {price} DA | ASAS`
- Description: apartment features + project name
- Canonical: `https://asas.dz/#/projects/{project.slug}/apartments/{apartment.slug}`
- OG image: apartment hero or project hero
- JSON-LD: `Apartment` structured data with `numberOfRooms`, `floorSize`, `offers.price`

## 3. Sitemap (`src/app/sitemap.ts`)

Generated dynamically from the database — lists all published projects + apartments + key pages:
```
https://asas.dz                                (priority 1.0)
https://asas.dz/#/projects                    (priority 0.9)
https://asas.dz/#/services                    (priority 0.8)
https://asas.dz/#/about                       (priority 0.7)
https://asas.dz/#/contact                     (priority 0.7)
https://asas.dz/#/projects/residence-...     (priority 0.8 per project)
https://asas.dz/#/privacy                     (priority 0.3)
https://asas.dz/#/terms                       (priority 0.3)
```
`lastmod` set to current time (or DB `updatedAt`).

## 4. Robots (`/public/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /api/

# Sitemap
Sitemap: https://asas.dz/sitemap.xml

# Crawl-delay
Crawl-delay: 1
```

## 5. Structured data (Schema.org JSON-LD)

### 5.1 Homepage (`HomePage.tsx`)
Two schemas:
1. `RealEstateAgent`
   - `name`, `description`, `url`, `telephone`, `email`
   - `address` (PostalAddress with `addressLocality: Alger`, `addressCountry: DZ`)
   - `areaServed` (Algiers + districts)
   - `knowsAbout` (Commercialisation immobilière, etc.)
2. `WebSite`
   - `name`, `url`, `inLanguage: fr-DZ`
   - `publisher` (Organization)

### 5.2 Project detail
`Apartment`/`Residence` schema with:
- `name`, `description`, `url`
- `address` (PostalAddress)
- `geo` (GeoCoordinates)
- `numberOfRooms` (count of apartment types)
- `offers` (price range)
- `amenityFeature` (list of amenities)
- `image` (gallery URLs)

### 5.3 Apartment detail
`Apartment` schema with:
- `name`, `description`, `url`
- `numberOfRooms` (bedrooms)
- `floorSize` (surface m²)
- `floorLevel` (floor number)
- `offers` (AggregateOffer with price + priceCurrency)
- `image` (gallery URLs)
- `containedInPlace` (project reference)

### 5.4 Breadcrumbs
`BreadcrumbList` on all detail pages with proper hierarchy:
```
Home → Projects → Résidence Les Oliviers → F3 Familial (92 m²)
```

## 6. URLs

- All URLs use kebab-case slugs
- Project URL: `/#/projects/residence-les-oliviers`
- Apartment URL: `/#/projects/residence-les-oliviers/apartments/les-oliviers-f3-92`

> ⚠️ Trade-off acknowledged: hash-based routing (`/#/...`) is suboptimal for SEO crawlers because Google historically has not indexed hash-fragment URLs. Mitigations:
> 1. Comprehensive `sitemap.xml` with explicit URLs (including hash fragments)
> 2. Server-side rendered metadata (in `<head>`)
> 3. Schema.org structured data
> 4. Canonical tags
>
> For true SEO production, migrate to Next.js App Router routes (`/projects/[slug]/page.tsx`) — the sandbox forbids this, but the codebase is structured for an easy migration (just move `ProjectDetailPage` into `src/app/projects/[slug]/page.tsx` and remove the hash router).

## 7. Internal linking

- Homepage features 3 projects → links to project detail pages
- Project detail page → lists all its apartments → apartment detail pages
- Apartment detail page → "Related apartments" section → cross-links
- Breadcrumbs on all detail pages
- Footer links to all major pages

## 8. Image SEO

- All images have `alt` text (accessibility + image search)
- Images served from same domain (no CDN — mitigates cross-origin issues)
- AVIF/WebP formats configured in `next.config.ts`:
  ```ts
  images: { formats: ['image/avif', 'image/webp'] }
  ```
- Hero images eager-loaded (improves LCP)
- Gallery images lazy-loaded (reduces initial payload)

## 9. Performance considerations

- Turbopack dev server: 500ms cold compile, <100ms warm
- API responses: 50-200ms typical
- Lazy-loaded page components: reduce initial JS bundle
- React Query: 1-minute staleTime to reduce refetches
- gzip compression enabled in Next.js config
- Standalone output for minimal deployment footprint

## 10. Verification

### Direct tests (via curl)
- ✅ `/sitemap.xml` returns valid XML sitemap with all major routes
- ✅ `/robots.txt` returns proper directives + sitemap reference
- ✅ `/manifest.webmanifest` returns valid PWA manifest
- ✅ Homepage HTML contains all meta tags + JSON-LD

### Recommendations for production
1. Migrate hash routing to App Router routes (`/projects/[slug]`) for true SEO
2. Add Google Search Console verification
3. Submit sitemap to Google Search Console
4. Add `og:image` with absolute URLs to social media previews
5. Consider server-side rendering for project/apartment pages (currently client-side rendered after hydration)
6. Add breadcrumb structured data on all detail pages (some already have it, others use the Breadcrumbs component without JSON-LD)
7. Consider internationalization with `hreflang` for separate French and Arabic versions
