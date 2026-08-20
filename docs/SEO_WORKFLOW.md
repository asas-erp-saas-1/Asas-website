# SEO WORKFLOW — ASAS Real Estate CMS

> How to manage SEO metadata from the admin interface — no developer needed.

## 1. SEO Architecture

### Per-entity SEO fields
Every Project and Apartment has 6 SEO fields:
- `seoTitle` — meta title (50-60 chars recommended)
- `seoDescription` — meta description (150-160 chars recommended)
- `seoKeywords` — comma-separated keywords
- `canonicalUrl` — canonical URL override
- `ogImage` — OpenGraph image URL (1200×630 recommended)
- `robotsIndex` — true = indexable by Google, false = NOINDEX

### Auto-generation fallback
When admin leaves a field empty, the public page auto-generates from:
- Title: project name + district + "ASAS" (or apartment type + surface + project name + "ASAS")
- Description: project tagline (or apartment description)
- OG image: first project/apartment hero image
- Canonical: `https://asas.dz/#/projects/[slug]` (or apartment URL)

## 2. Accessing the SEO Tab

### For a Project
1. Sidebar → **CATALOGUE > Projets**
2. Click the chevron icon on the project row → edit dialog opens
3. Click the **SEO** tab (between Équipements and Publication)

### For an Apartment
1. Sidebar → **CATALOGUE > Appartements**
2. Click the chevron icon → edit dialog opens
3. Click the **SEO** tab (between Description and Publication)

## 3. SEO Tab Fields

### Titre SEO (meta title)
- Recommended: 50-60 characters
- Placeholder example (project): "Résidence Les Oliviers à Chéraga — ASAS"
- Placeholder example (apartment): "F3 Familial 92m² Résidence Les Oliviers — ASAS"
- Leave empty to auto-generate from name

### Description SEO (meta description)
- Recommended: 150-160 characters
- Placeholder example (project): "Découvrez la Résidence Les Oliviers à Chéraga. Appartements F2, F3, F4 neufs à partir de 12M DA."
- Placeholder example (apartment): "Appartement F3 de 92m² à la Résidence Les Oliviers, Chéraga. 3 chambres, balcon. À partir de 16,8M DA."
- Leave empty to auto-generate from tagline (project) or description (apartment)

### Mots-clés (keywords)
- Comma-separated
- Example: "résidence, Chéraga, F3, neuf, Alger"
- Note: Google generally ignores meta keywords, but Bing and other search engines may use them

### URL canonique (canonical)
- Leave empty to auto-generate `https://asas.dz/#/projects/[slug]`
- Set explicitly only if you have a preferred URL (e.g., for A/B testing or migration)

### Image OpenGraph
- URL to the image shown when sharing on Facebook/WhatsApp/Twitter
- Recommended: 1200×630 pixels
- Leave empty to auto-use the hero image
- Example: `/images/projects/les-oliviers-hero.jpg`

### robotsIndex toggle
- TRUE (default) = `index, follow` — Google can index this page
- FALSE = `noindex, follow` — Google will NOT index this page (use for draft/private content)
- Drafts are automatically non-indexable via the public API filter (published=false → 404)

## 4. Sitemap.xml

- **Server-generated** from the database at `/sitemap.xml`
- Includes only PUBLISHED + NON-ARCHIVED projects and apartments
- Updated automatically when admin publishes/unpublishes/archived content
- Located at: `https://votre-domaine.dz/sitemap.xml`

## 5. Robots.txt

- Located at: `/robots.txt`
- Allows: `/`
- Disallows: `/api/`
- References sitemap: `Sitemap: https://asas.dz/sitemap.xml`
- Crawl-delay: 1 second

## 6. Structured Data (Schema.org JSON-LD)

### Homepage
- `RealEstateAgent` schema (name, address, telephone, areaServed, knowsAbout)
- `WebSite` schema (name, url, inLanguage, publisher)

### Project detail page
- `Apartment`/`Residence` schema with:
  - name, description, url
  - address (PostalAddress)
  - geo (GeoCoordinates)
  - numberOfRooms, offers (price range)
  - amenityFeature (list of amenities)
  - image (gallery URLs)

### Apartment detail page
- `Apartment` schema with:
  - name, description, url
  - numberOfRooms (bedrooms)
  - floorSize (surface m²)
  - floorLevel
  - offers (AggregateOffer with price + priceCurrency)
  - image (gallery URLs)
  - containedInPlace (project reference)

### Breadcrumbs
- `BreadcrumbList` on all detail pages

## 7. Per-page Metadata

- Title, description, OG, Twitter cards generated via Next.js Metadata API
- hreflang: fr-DZ, fr, ar-DZ, x-default
- Canonical URLs

## 8. Validation Checklist (Pre-publish)

Before publishing a project, the Publication tab shows:
- ✓/✕ Nom du projet (requis)
- ✓/✕ Localisation (requis)
- ✓/⚠ Description (recommended)
- ✓/✕ Prix de départ (requis)
- ✓/✕ Image hero (requis)
- ⚠/✓ Description SEO (recommended)
- ⚠/✓ Image OpenGraph (recommended)

For apartments, the checklist adds:
- ✓/✕ Type + nom du type (requis)
- ✓/✕ Surface (requis)
- ✓/✕ Étage (requis)
- ✓/✕ Chambres (requis)
- ✓/✕ Prix (requis)
- ⚠/✓ Orientation (recommended)
- ⚠/✓ Description SEO (recommended)

## 9. Best Practices

- ✅ Fill the SEO Title (50-60 chars) — Google truncates longer titles
- ✅ Fill the SEO Description (150-160 chars) — affects click-through rate
- ✅ Set a custom OG Image for branded social sharing
- ✅ Use target keywords naturally (not stuffed)
- ✅ Set robotsIndex=false for draft/private content (though drafts are auto-404)

- ❌ Don't keyword stuff — Google penalizes
- ❌ Don't duplicate descriptions across pages — Google may deduplicate
- ❌ Don't use fake structured data — Google may penalize
- ❌ Don't forget the Alt text on images (image SEO)

## 10. SEO Limitations (sandbox)

- **Hash-based routing** (`/#/projects/...`) — suboptimal for SEO crawlers. Mitigated by sitemap + structured data. For true SEO, migrate to Next.js App Router routes.
- **No server-side rendering of project/apartment pages** — pages are client-rendered after hydration. Google can index client-rendered pages, but SSR is preferred.
- **No `og:image` with absolute URLs** — currently uses relative URLs. For production, use absolute URLs.

To fix these for production:
1. Migrate hash routing to App Router routes (`/projects/[slug]/page.tsx`)
2. Use Next.js `generateMetadata` for true SSR metadata
3. Use absolute URLs for OG images
