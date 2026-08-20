# CONTENT_MODEL.md — ASAS Real Estate Content Operating System

> **Phase 2 Blueprint — Content Model Specification**
> This document defines every business entity, its fields, relationships, ownership, lifecycle, public/admin visibility, editable roles, and deletion policy.
> A senior engineer should be able to implement the database schema from this document alone.

## 1. Entity Hierarchy

```
COMPANY (ASAS)
  ↓
DEVELOPER (real-estate company that builds projects)
  ↓
PROJECT (a real-estate development, e.g., "Résidence Les Oliviers")
  ↓
BUILDING (a physical building within a project)
  ↓
APARTMENT / UNIT (a saleable unit)
  ↓
MEDIA (images, videos, plans, brochures)
  ↓
SEO (per-entity metadata)
  ↓
LEADS (inquiries from visitors)
```

Cross-cutting:
- AMENITIES (per-project, structured)
- LOCATION (denormalized into Project + Apartment for fast display)
- PRICING (single source: `Apartment.price`)
- PUBLICATION STATE (per-entity `published` + `archived` flags)
- AUDIT LOG (system-wide, captures all mutations)
- ADMIN USERS + ROLES (system-wide, controls access)

## 2. Entity Inventory

| # | Entity | Purpose | Lifecycle | Public? | Admin? |
|---|---|---|---|---|---|
| 1 | Developer | Real-estate company building the project | Stable (rarely deleted) | Yes (name, description) | Yes (full CRUD ADMIN-only) |
| 2 | Project | Real-estate development | DRAFT → PUBLISHED → ARCHIVED | Yes (if published) | Yes (CRUD: ADMIN+EDITOR) |
| 3 | Building | Physical building within project | Stable while project exists | Yes (via project) | Yes (CRUD: ADMIN+EDITOR) |
| 4 | Apartment | Saleable unit | DRAFT → PUBLISHED → ARCHIVED | Yes (if published) | Yes (CRUD: ADMIN+EDITOR) |
| 5 | ProjectImage | Structured media for project | Stable while project exists | Yes (if project published) | Yes (upload: ADMIN+EDITOR; delete: ADMIN) |
| 6 | ApartmentImage | Structured media for apartment | Stable while apartment exists | Yes (if apartment published) | Yes (upload: ADMIN+EDITOR; delete: ADMIN) |
| 7 | Video | External URL or uploaded MP4 | Stable | Yes (if published) | Yes (CRUD: ADMIN+EDITOR; delete: ADMIN) |
| 8 | ProjectAmenity | Per-project amenity | Stable while project exists | Yes (via project) | Yes (CRUD: ADMIN+EDITOR) |
| 9 | Lead | Contact form submission | NEW → ... → SOLD/LOST | No (write-only via form) | Yes (read: any role; update: ADMIN+EDITOR) |
| 10 | LeadNote | Follow-up note on lead | Stable while lead exists | No | Yes (create: ADMIN+EDITOR; read: any role) |
| 11 | AdminUser | Admin login account | Active/Inactive (soft-delete) | No | Yes (CRUD: ADMIN-only; self-protection) |
| 12 | AuditLog | Mutation log entry | Append-only (never edited/deleted) | No | Yes (read: any role; no mutations) |
| 13 | SiteContent | Key-value CMS store | Stable | Yes (via specific keys) | Yes (CRUD: ADMIN) |
| 14 | NewsletterSubscription | Email subscription | SUBSCRIBED/UNSUBSCRIBED/BOUNCED | No (write-only) | Yes (read: ADMIN) |

## 3. Entity Definitions

### 3.1 Developer

**Purpose**: Represents a real-estate developer company (e.g., "Eser Promotion", "CID Promotion").

**Fields**:
| Field | Type | Required | Default | Validation | Notes |
|---|---|---|---|---|---|
| id | String (cuid) | yes | auto-generated | — | PK |
| slug | String | yes | — | unique, kebab-case | URL identifier |
| name | String | yes | — | non-empty | Display name (FR) |
| nameAr | String? | no | null | — | Arabic name (RTL) |
| description | String? | no | null | — | Long-form description (FR) |
| descriptionAr | String? | no | null | — | Arabic description |
| logo | String? | no | null | URL | Developer logo |
| website | String? | no | null | URL | Developer website |
| createdAt | DateTime | yes | now() | — | auto |
| updatedAt | DateTime | yes | auto | — | auto |

**Relationships**: `projects Project[]` (one-to-many)

**Ownership**: ASAS admin (who creates the developer record)

**Lifecycle**: Stable — developers are rarely deleted. If a developer is removed, projects retain `developerId` as null (set null on delete).

**Public visibility**: Name + description visible on project pages.

**Admin visibility**: Full CRUD in admin (ADMIN-only for delete).

**Editable roles**: ADMIN (full), EDITOR (create/update), VIEWER (read).

**Deletion policy**: Soft-restrict — prefer keeping the developer record. If deleted, projects' `developerId` is set to null.

---

### 3.2 Project

**Purpose**: A real-estate development being marketed and sold by ASAS.

**Fields — IDENTITY**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| slug | String | yes | — | unique, kebab-case |
| reference | String? | no | null | internal reference code |
| name | String | yes | — | non-empty |
| nameAr | String? | no | null | RTL |
| tagline | String? | no | null | short marketing tagline |
| taglineAr | String? | no | null | RTL |
| description | String? | no | null | long-form description |
| descriptionAr | String? | no | null | RTL |
| projectType | String | yes | "RESIDENTIAL" | enum: RESIDENTIAL, MIXED_USE, COMMERCIAL |
| status | String | yes | "AVAILABLE" | enum: AVAILABLE, COMING_SOON, SOLD_OUT, DRAFT |

**Fields — LOCATION**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| city | String | yes | — | non-empty |
| cityAr | String? | no | null | RTL |
| district | String | yes | — | non-empty |
| districtAr | String? | no | null | RTL |
| address | String? | no | null | — |
| addressAr | String? | no | null | RTL |
| latitude | Float? | no | null | -90 to 90 |
| longitude | Float? | no | null | -180 to 180 |
| mapUrl | String? | no | null | URL — optional Google Maps link |

**Fields — COMMERCIAL**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| startingPrice | Int? | no | null | > 0 (in DA) |
| priceOnRequest | Boolean | yes | false | if true, hides starting price publicly |
| deliveryYear | Int? | no | null | > 2000 |
| deliveryQuarter | String? | no | null | enum: Q1, Q2, Q3, Q4 |
| apartmentTypes | String | yes | "[]" | JSON array: ["F2","F3","F4"] |
| minSurface | Int? | no | null | > 0 (m²) |
| maxSurface | Int? | no | null | > 0 (m²) |
| paymentPlan | String? | no | null | text — payment terms |
| reservationInfo | String? | no | null | text — reservation process |

**Fields — AMENITIES** (as flags):
| Field | Type | Required | Default |
|---|---|---|---|
| hasParking | Boolean | yes | false |
| hasElevator | Boolean | yes | false |
| hasGarden | Boolean | yes | false |
| hasPool | Boolean | yes | false |
| hasSecurity | Boolean | yes | false |
| hasClim | Boolean | yes | false |

**Fields — RELATIONS**:
| Field | Type | Notes |
|---|---|---|
| developerId | String? | FK to Developer (set null on delete) |

**Fields — PUBLICATION**:
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| published | Boolean | yes | false | DRAFT=false, PUBLISHED=true |
| archived | Boolean | yes | false | soft-delete flag |
| featured | Boolean | yes | false | show on homepage |
| order | Int | yes | 0 | manual sort order |

**Fields — SEO** (per-entity overrides):
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| seoTitle | String? | no | null | 50-60 chars recommended; auto-gen if null |
| seoDescription | String? | no | null | 150-160 chars; auto-gen if null |
| seoKeywords | String? | no | null | comma-separated |
| canonicalUrl | String? | no | null | override canonical |
| ogImage | String? | no | null | OpenGraph image URL |
| robotsIndex | Boolean | yes | true | false = NOINDEX |

**Fields — TIMESTAMPS**:
| Field | Type | Default |
|---|---|---|
| createdAt | DateTime | now() |
| updatedAt | DateTime | auto-updated |

**Relationships**:
- `developer Developer?` (many-to-one, optional)
- `buildings Building[]` (one-to-many, cascade delete)
- `apartments Apartment[]` (one-to-many, cascade delete)
- `amenities ProjectAmenity[]` (one-to-many, cascade delete)
- `images ProjectImage[]` (one-to-many, cascade delete)
- `videos Video[]` (one-to-many, cascade delete)

**Ownership**: ASAS admin (creates the project record).

**Lifecycle**: DRAFT (published=false) → PUBLISHED (published=true) → ARCHIVED (archived=true, published=false). See `PUBLISHING_WORKFLOW.md`.

**Public visibility**: Only `published=true AND archived=false` projects appear on public site + sitemap + structured data.

**Admin visibility**: All projects visible in admin (filtered by `archived=false` by default; archived items accessible via filter).

**Editable roles**:
- ADMIN: full CRUD (create, update, publish, unpublish, archive, delete)
- EDITOR: create, update, publish, unpublish (cannot archive/delete)
- VIEWER: read-only

**Deletion policy**: Soft-delete via archive (`archived=true, published=false`). Hard-delete NOT supported via UI (would break audit log referential integrity). Cascading: buildings, apartments, amenities, images, videos are cascade-deleted if project is hard-deleted (DB-level only).

---

### 3.3 Building

**Purpose**: A physical building within a project (e.g., "Bâtiment A", "Tour Nord").

**Fields**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| slug | String | yes | — | unique, kebab-case |
| projectId | String | yes | — | FK to Project (cascade delete) |
| name | String | yes | — | non-empty (e.g., "Bâtiment A") |
| nameAr | String? | no | null | RTL |
| code | String | yes | — | short code (e.g., "A", "B", "NORD") |
| floors | Int | yes | — | > 0 (total floors) |
| hasElevator | Boolean | yes | false | — |
| order | Int | yes | 0 | manual sort |
| createdAt | DateTime | yes | now() | — |
| updatedAt | DateTime | yes | auto | — |

**Relationships**:
- `project Project` (many-to-one, cascade delete)
- `apartments Apartment[]` (one-to-many, set null on delete — preserves apartment)

**Ownership**: Inherits from Project.

**Lifecycle**: Stable while project exists.

**Public visibility**: Visible via project detail page (if project is published).

**Admin visibility**: Full CRUD in admin (ADMIN+EDITOR create/update, ADMIN delete).

**Deletion policy**: Hard-delete allowed (admin only). On delete, apartments' `buildingId` is set to null (preserves apartment — it becomes "unassigned to a building").

---

### 3.4 Apartment / Unit

**Purpose**: A saleable unit within a project. This is the most commercially important entity.

**Fields — IDENTITY**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| slug | String | yes | — | unique, kebab-case |
| projectId | String | yes | — | FK to Project (cascade delete) |
| buildingId | String? | no | null | FK to Building (set null on delete) |
| unitNumber | String? | no | null | e.g., "A-101", "B-205" |
| reference | String? | no | null | internal reference |
| apartmentType | String | yes | "F3" | enum: F2, F3, F4, F5, Duplex, Studio, Villa |
| typeName | String | yes | — | e.g., "F3 Familial" |
| typeNameAr | String? | no | null | RTL |

**Fields — SPECIFICATIONS**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| surface | Int | yes | — | > 0 (m², total area) |
| livingArea | Int? | no | null | > 0 (m², if different from surface) |
| floor | Int? | no | null | >= 0 |
| totalFloors | Int? | no | null | > 0 (building's total floors) |
| orientation | String? | no | null | enum: Nord, Sud, Est, Ouest, Nord-Est, Nord-Ouest, Sud-Est, Sud-Ouest |
| view | String? | no | null | text (e.g., "Vue mer", "Vue jardin") |

**Fields — ROOMS**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| bedrooms | Int | yes | — | >= 0 |
| bathrooms | Int? | no | null | >= 0 |
| balconies | Int? | no | null | >= 0 |
| balconySurface | Int? | no | null | > 0 (m²) |
| hasTerrace | Boolean | yes | false | — |
| terraceSurface | Int? | no | null | > 0 (m²) |
| hasGarden | Boolean | yes | false | — |
| gardenSurface | Int? | no | null | > 0 (m²) |
| hasLivingRoom | Boolean | yes | true | — |
| hasKitchen | Boolean | yes | true | — |
| hasDressing | Boolean | yes | false | — |
| hasMasterSuite | Boolean | yes | false | — |
| hasLaundry | Boolean | yes | false | — |
| hasStorage | Boolean | yes | false | — |

**Fields — PARKING**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| hasParking | Boolean | yes | false | — |
| parkingSpots | Int? | no | null | >= 0 |
| box | String? | no | null | parking box reference |

**Fields — COMMERCIAL** (single source of truth for price):
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| price | Int? | no | null | > 0 (DA, sale price) — **single source of truth** |
| priceOnRequest | Boolean | yes | false | if true, hides price publicly |
| oldPrice | Int? | no | null | > 0 (DA, previous price for display) |
| paymentPlan | String? | no | null | text (e.g., "30% à la signature, solde sur 24 mois") |
| paymentPlanAr | String? | no | null | RTL |
| status | String | yes | "AVAILABLE" | enum: AVAILABLE, RESERVED, SOLD, COMING_SOON, OFF_MARKET, DRAFT |

**Fields — CONTENT**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| description | String? | no | null | long-form description (FR) |
| descriptionAr | String? | no | null | RTL |
| features | String? | no | "[]" | JSON array: ["Climatisation", "Double vitrage", ...] |
| featuresAr | String? | no | "[]" | JSON array (Arabic) |
| rooms | String? | no | null | JSON: [{name, nameAr, surface}] — room breakdown |

**Fields — PUBLICATION**:
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| published | Boolean | yes | false | DRAFT=false, PUBLISHED=true |
| archived | Boolean | yes | false | soft-delete flag |
| order | Int | yes | 0 | manual sort order |

**Fields — SEO** (per-entity overrides):
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| seoTitle | String? | no | null | 50-60 chars; auto-gen if null |
| seoDescription | String? | no | null | 150-160 chars; auto-gen if null |
| seoKeywords | String? | no | null | comma-separated |
| canonicalUrl | String? | no | null | override canonical |
| ogImage | String? | no | null | OpenGraph image URL |
| robotsIndex | Boolean | yes | true | false = NOINDEX |

**Fields — TIMESTAMPS**:
| Field | Type | Default |
|---|---|---|
| createdAt | DateTime | now() |
| updatedAt | DateTime | auto-updated |

**Relationships**:
- `project Project` (many-to-one, cascade delete)
- `building Building?` (many-to-one, set null on delete)
- `images ApartmentImage[]` (one-to-many, cascade delete)
- `videos Video[]` (one-to-many, cascade delete)

**Ownership**: Inherits project's owner. Apartments belong to their project.

**Lifecycle**: DRAFT → PUBLISHED → ARCHIVED (same as Project). See `PUBLISHING_WORKFLOW.md`.

**Public visibility**: Only `published=true AND archived=false` apartments appear on public site. Even within a published project, unpublished apartments are filtered out.

**Admin visibility**: All apartments visible in admin.

**Editable roles**:
- ADMIN: full CRUD + archive
- EDITOR: create, update, publish, unpublish (cannot archive/delete)
- VIEWER: read-only

**Deletion policy**: Soft-delete via archive. Hard-delete is DB-only (cascade preserves referential integrity for historical leads via denormalized `apartmentName` in Lead).

**Inherited fields** (computed from project, not stored):
- Project location (city, district) → apartment inherits via project relation
- Developer → apartment inherits via project.developer
- Project amenities → apartment inherits via project.amenities

These are NOT stored on the apartment — they're computed at query time via the project relation. This avoids data duplication.

---

### 3.5 ProjectImage

**Purpose**: Structured image attached to a project.

**Fields**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| projectId | String | yes | — | FK to Project (cascade delete) |
| url | String | yes | — | relative or absolute URL |
| alt | String? | no | null | accessibility text (recommended) |
| altAr | String? | no | null | RTL |
| caption | String? | no | null | display caption |
| captionAr | String? | no | null | RTL |
| type | String | yes | "gallery" | enum: hero, gallery, exterior, interior, amenity, document, architecture |
| order | Int | yes | 0 | sort order |
| width | Int? | no | null | pixels |
| height | Int? | no | null | pixels |
| createdAt | DateTime | yes | now() | — |
| updatedAt | DateTime | yes | auto | — |

**Relationships**: `project Project` (many-to-one, cascade delete)

**Ownership**: Inherits from project.

**Lifecycle**: Stable while project exists.

**Public visibility**: Visible via project (if project is published).

**Admin visibility**: Full CRUD (upload: ADMIN+EDITOR; delete: ADMIN-only).

**Deletion policy**: Hard-delete allowed (ADMIN-only). File removed from disk + DB row deleted. Confirmation dialog shows "used in N locations" warning.

---

### 3.6 ApartmentImage

Same structure as ProjectImage, scoped to `apartmentId` FK. Types include: `hero, gallery, floor-plan, 3d-plan, render, interior, exterior, view, document`.

---

### 3.7 Video

**Purpose**: External video (YouTube/Vimeo) or uploaded MP4, attached to a project or apartment.

**Fields**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| projectId | String? | no | null | FK to Project (cascade) — either projectId OR apartmentId required |
| apartmentId | String? | no | null | FK to Apartment (cascade) |
| url | String? | no | null | external URL (YouTube/Vimeo) |
| storagePath | String? | no | null | uploaded file path (/uploads/videos/...) |
| thumbnailUrl | String? | no | null | thumbnail image URL |
| title | String | yes | — | non-empty |
| description | String? | no | null | — |
| type | String | yes | "GALLERY" | enum: HERO, GALLERY, WALKTHROUGH, INTERVIEW, PROJECT_OVERVIEW, APARTMENT_TOUR, LOCATION, OTHER |
| featured | Boolean | yes | false | shows prominently |
| published | Boolean | yes | true | false = hidden from public |
| order | Int | yes | 0 | sort order |
| createdAt | DateTime | yes | now() | — |
| updatedAt | DateTime | yes | auto | — |

**Constraint**: At least one of `projectId` / `apartmentId` must be set (app-layer enforced).

**Relationships**:
- `project Project?` (many-to-one, cascade delete, optional)
- `apartment Apartment?` (many-to-one, cascade delete, optional)

**Ownership**: Inherits from parent entity.

**Lifecycle**: Stable.

**Public visibility**: Only `published=true` videos appear in public video sections.

**Admin visibility**: Full CRUD (create/update: ADMIN+EDITOR; delete: ADMIN-only).

**Deletion policy**: Hard-delete allowed (ADMIN-only).

---

### 3.8 ProjectAmenity

**Purpose**: Per-project amenity (e.g., "Parking souterrain", "Sécurité 24h/24").

**Fields**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| projectId | String | yes | — | FK to Project (cascade delete) |
| name | String | yes | — | non-empty |
| nameAr | String? | no | null | RTL |
| icon | String? | no | null | Lucide icon name |
| description | String? | no | null | — |
| descriptionAr | String? | no | null | RTL |
| createdAt | DateTime | yes | now() | — |
| updatedAt | DateTime | yes | auto | — |

**Relationships**: `project Project` (many-to-one, cascade delete)

**Deletion policy**: Hard-delete (cascade from project).

---

### 3.9 Lead

**Purpose**: A contact form submission from a visitor.

**Fields — CONTACT**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| name | String | yes | — | non-empty |
| phone | String | yes | — | non-empty |
| email | String? | no | null | email format |
| preferredContact | String? | no | null | enum: PHONE, WHATSAPP, EMAIL |
| intent | String | yes | — | enum: REQUEST_INFORMATION, REQUEST_PRICE, REQUEST_FLOOR_PLAN, BOOK_VISIT, WHATSAPP, CALL, RESERVATION |
| message | String? | no | null | — |

**Fields — CONTEXT** (auto-filled):
| Field | Type | Notes |
|---|---|---|
| projectId | String? | FK to Project (no cascade — denormalized for history) |
| projectName | String? | denormalized — preserves lead history if project renamed/deleted |
| apartmentId | String? | FK to Apartment |
| apartmentName | String? | denormalized |
| pageUrl | String? | where the lead came from |
| landingPage | String? | campaign landing page URL |

**Fields — ATTRIBUTION**:
| Field | Type | Notes |
|---|---|---|
| utmSource, utmMedium, utmCampaign, utmContent, utmTerm | String? | UTM params from URL |
| gclid, fbclid | String? | Google/Facebook click IDs |
| referrer | String? | HTTP Referer |

**Fields — PIPELINE**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| source | String? | no | null | enum: WEBSITE, WHATSAPP, PHONE, FORM |
| status | String | yes | "NEW" | enum: NEW, CONTACTED, QUALIFIED, VISIT, NEGOTIATION, SOLD, LOST |
| assignedTo | String? | no | null | AdminUser email (denormalized) |
| followUpDate | DateTime? | no | null | scheduled follow-up date |

**Fields — TIMESTAMPS**: createdAt, updatedAt

**Relationships**: `notes LeadNote[]` (one-to-many, cascade delete)

**Ownership**: ASAS sales team. Assigned to a specific employee via `assignedTo`.

**Lifecycle**: NEW → CONTACTED → QUALIFIED → VISIT → NEGOTIATION → SOLD (or LOST at any stage).

**Public visibility**: NO — leads are write-only via the public form (`POST /api/leads`). Public users cannot read leads.

**Admin visibility**: All leads visible in admin (filtered by status).

**Editable roles**:
- ADMIN: full CRUD (read, update status, add notes, delete)
- EDITOR: read, update status, add notes (cannot delete)
- VIEWER: read-only

**Deletion policy**: Hard-delete allowed (ADMIN-only) — but discouraged (preserves sales history). Prefer status=LOST.

---

### 3.10 LeadNote

**Purpose**: Follow-up note added by an admin to a lead.

**Fields**:
| Field | Type | Required | Default |
|---|---|---|---|
| id | String (cuid) | yes | auto |
| leadId | String | yes | FK to Lead (cascade delete) |
| authorEmail | String? | no | null (AdminUser email) |
| body | String | yes | non-empty |
| createdAt | DateTime | yes | now() |

**Relationships**: `lead Lead` (many-to-one, cascade delete)

**Lifecycle**: Append-only (notes are never edited or deleted).

**Public visibility**: NO.

**Admin visibility**: Visible via lead notes drawer.

**Editable roles**: ADMIN + EDITOR can create notes. VIEWER can read.

---

### 3.11 AdminUser

**Purpose**: Admin login account.

**Fields**:
| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| email | String | yes | — | unique, email format, case-insensitive |
| name | String | yes | — | non-empty |
| passwordHash | String | yes | — | bcrypt ($2b$10$...) |
| role | String | yes | "VIEWER" | enum: ADMIN, EDITOR, VIEWER |
| active | Boolean | yes | true | false = login disabled |
| lastLoginAt | DateTime? | no | null | last successful login timestamp |
| createdAt | DateTime | yes | now() | — |
| updatedAt | DateTime | yes | auto | — |

**Lifecycle**: Active → Inactive (soft-delete via `active=false`).

**Public visibility**: NO.

**Admin visibility**: Full CRUD (ADMIN-only). Self-protection: cannot change own role or deactivate own account.

**Deletion policy**: Soft-delete only (set `active=false`). Hard-delete NOT supported (would break audit log referential integrity).

---

### 3.12 AuditLog

**Purpose**: Append-only log of all admin mutations.

**Fields**:
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | String (cuid) | yes | auto | — |
| actorEmail | String? | no | null | AdminUser email (null if unauthenticated) |
| actorRole | String? | no | null | ADMIN/EDITOR/VIEWER |
| action | String | yes | — | 24 action types (see below) |
| entityType | String? | no | null | Project, Apartment, ProjectImage, etc. |
| entityId | String? | no | null | id of affected entity |
| entitySlug | String? | no | null | slug for quick identification |
| before | String? | no | null | JSON-serialized before state (8KB cap) |
| after | String? | no | null | JSON-serialized after state (8KB cap) |
| ipAddress | String? | no | null | from x-forwarded-for or x-real-ip |
| userAgent | String? | no | null | browser user-agent |
| createdAt | DateTime | yes | now() | — |

**Action types** (24):
- Authentication: LOGIN, LOGIN_FAILED
- Project: CREATE_PROJECT, UPDATE_PROJECT, ARCHIVE_PROJECT
- Apartment: CREATE_APARTMENT, UPDATE_APARTMENT, UPDATE_APARTMENT_STATUS, ARCHIVE_APARTMENT
- Price: PRICE_CHANGE (special action when price field changes)
- Media: UPLOAD_MEDIA, DELETE_MEDIA, UPDATE_MEDIA
- Video: CREATE_VIDEO, UPDATE_VIDEO, DELETE_VIDEO
- Lead: UPDATE_LEAD, UPDATE_LEAD_STATUS, CREATE_LEAD_NOTE
- User: CREATE_USER, UPDATE_USER, DEACTIVATE_USER

**Lifecycle**: Append-only. NEVER edited or deleted.

**Public visibility**: NO.

**Admin visibility**: Read-only for all admin roles (filter by action, actor, entity).

**Deletion policy**: Never deleted. For production, add a retention policy (e.g., 1 year) + periodic cleanup.

---

### 3.13 SiteContent

**Purpose**: Key-value CMS store for editable site-wide content (e.g., `hero_title`, `about_mission`).

**Fields**: id, key (unique), value, valueAr, updatedAt.

**Public visibility**: Yes (specific keys returned via public API).

**Admin visibility**: Full CRUD (ADMIN-only).

---

### 3.14 NewsletterSubscription

**Purpose**: Email subscription for newsletter.

**Fields**: id, email (unique), source, locale, pageUrl, utm params, status (SUBSCRIBED/UNSUBSCRIBED/BOUNCED), confirmedAt, unsubscribedAt, createdAt, updatedAt.

**Public visibility**: NO (write-only via `POST /api/newsletter/subscribe`).

**Admin visibility**: Read-only (ADMIN).

---

## 4. Entity Relationship Summary

```
Developer 1───∞ Project 1───∞ Building 1───∞ Apartment
                       │                   │
                       │                   ├───∞ ApartmentImage
                       │                   └───∞ Video
                       ├───∞ ProjectImage
                       ├───∞ ProjectAmenity
                       └───∞ Video

Lead ∞───1 Project (optional)
Lead ∞───1 Apartment (optional)
Lead 1───∞ LeadNote

AdminUser (standalone)
AuditLog (standalone, references entityId as string)
SiteContent (standalone)
NewsletterSubscription (standalone)
```

## 5. Enums Summary

| Entity | Field | Values |
|---|---|---|
| Project | projectType | RESIDENTIAL, MIXED_USE, COMMERCIAL |
| Project | status | AVAILABLE, COMING_SOON, SOLD_OUT, DRAFT |
| Project | deliveryQuarter | Q1, Q2, Q3, Q4 |
| Apartment | apartmentType | F2, F3, F4, F5, Duplex, Studio, Villa |
| Apartment | status | AVAILABLE, RESERVED, SOLD, COMING_SOON, OFF_MARKET, DRAFT |
| Apartment | orientation | Nord, Sud, Est, Ouest, Nord-Est, Nord-Ouest, Sud-Est, Sud-Ouest |
| ProjectImage | type | hero, gallery, exterior, interior, amenity, document, architecture |
| ApartmentImage | type | hero, gallery, floor-plan, 3d-plan, render, interior, exterior, view, document |
| Video | type | HERO, GALLERY, WALKTHROUGH, INTERVIEW, PROJECT_OVERVIEW, APARTMENT_TOUR, LOCATION, OTHER |
| Lead | status | NEW, CONTACTED, QUALIFIED, VISIT, NEGOTIATION, SOLD, LOST |
| Lead | intent | REQUEST_INFORMATION, REQUEST_PRICE, REQUEST_FLOOR_PLAN, BOOK_VISIT, WHATSAPP, CALL, RESERVATION |
| AdminUser | role | ADMIN, EDITOR, VIEWER |
| AuditLog | action | 24 types (see §3.12) |

> **Note on SQLite**: SQLite has no enum type — these are enforced at the application layer via Zod validation. For PostgreSQL migration, use `@map` to native enums.

## 6. Single Source of Truth Rules

See `DATA_SINGLE_SOURCE_OF_TRUTH.md` for the complete no-duplication rules.

**Critical rule**: `Apartment.price` is the ONLY source of truth for apartment prices. It is never hardcoded in components, JSON, or static arrays. When admin changes the price, it propagates everywhere via the database + cache invalidation.

## 7. What Should Never Be Duplicated

- **Price** — only in `Apartment.price` + optional `Apartment.oldPrice`
- **Surface** — only in `Apartment.surface`
- **Status** — only in `Apartment.status`
- **Project name** — only in `Project.name` (denormalized into `Lead.projectName` for historical preservation, but that's an exception)
- **Developer** — only in `Developer` table, referenced via FK
- **Location** — only in `Project` (apartment inherits via relation)
- **Hero image** — only in `ProjectImage` / `ApartmentImage` with `type=hero`
- **SEO title** — only in entity's `seoTitle` field (auto-generated if null)

## 8. What Should Be Derived (not stored)

- **Price per m²** — derived: `Apartment.price / Apartment.surface`
- **Project starting price** — derived: `MIN(Apartment.price WHERE projectId = X AND published = true AND status = AVAILABLE)` — unless explicitly overridden via `Project.startingPrice`
- **Apartment location** — derived: via `Apartment.project.city` + `Apartment.project.district`
- **SEO title (if null)** — derived: from entity name + location + "ASAS"
- **OG image (if null)** — derived: first hero image of the entity

## 9. What Must Be Immutable

- `AuditLog` entries — never edited or deleted
- `LeadNote` entries — append-only
- Entity `id` + `slug` — should not be changed after creation (slug change breaks SEO + bookmarks)

## 10. What Should Be Versioned (future work)

- **Floor plans** — version history (keep multiple plan versions with timestamps) — DECISION REQUIRED
- **Price history** — `PriceHistory` table tracking (price, changedBy, changedAt) — DECISION REQUIRED

## 11. What Should Be Auditable

Every mutation on:
- Project (create, update, archive)
- Apartment (create, update, status change, price change, archive)
- Media (upload, update, delete)
- Video (create, update, delete)
- Lead (status change, note creation)
- AdminUser (create, update, deactivate)

See `ROLE_PERMISSION_MATRIX.md` for who can do what, and `SECURITY_BOUNDARY.md` for access boundaries.
