# DATABASE ARCHITECTURE — ASAS Real Estate Platform

## 1. Engine + ORM

- **Engine**: SQLite (single file at `/home/z/my-project/db/custom.db`)
- **ORM**: Prisma 6.19.2
- **Schema**: `prisma/schema.prisma` (425 lines)
- **Seed**: `prisma/seed.ts` (1889 lines)

> For production, the schema is portable to PostgreSQL. SQLite is the current choice due to sandbox constraints. All foreign keys, indexes, and unique constraints work identically in PostgreSQL.

## 2. Models (12)

### Core Real Estate Entities
1. **Project** — real estate development (4 records seeded)
2. **Building** — project subdivision (6 records)
3. **Apartment** — saleable unit (28 records)
4. **Developer** — real estate company (4 records)
5. **ProjectAmenity** — per-project amenity (19 records)

### Media
6. **ProjectImage** — structured images per project (12 records)
7. **ApartmentImage** — structured images per apartment (48 records)
8. **Video** — YouTube/Vimeo + uploaded MP4 (1+ records)

### Sales + Operations
9. **Lead** — contact form submission (1+ records)
10. **LeadNote** — follow-up notes per lead (0+ records)

### Auth + Audit
11. **AdminUser** — admin login account (4 records: ADMIN/EDITOR/VIEWER + neweditor)
12. **AuditLog** — mutation log (5+ records)

### Bonus
- **SiteContent** — key-value CMS store (3 records)
- **NewsletterSubscription** — email subscriptions

## 3. Schema Diagram

```
Project (4 records)
  ├─ Building (6 records)             [projectId FK, cascade delete]
  │    └─ Apartment (28 records)      [projectId FK cascade, buildingId FK set null]
  │         ├─ ApartmentImage (48)   [apartmentId FK cascade]
  │         ├─ Video                 [apartmentId FK cascade]
  │         └─ LeadNote               [leadId FK cascade]
  ├─ ProjectImage (12 records)       [projectId FK cascade]
  ├─ ProjectAmenity (19 records)     [projectId FK cascade]
  ├─ Video                           [projectId FK cascade]
  └─ Developer (FK optional)

Lead                                 [projectId?, apartmentId? — denormalized projectName/apartmentName]
  └─ LeadNote                         [leadId FK cascade]

AdminUser                            [self-contained, passwordHash bcrypt]
AuditLog                             [self-contained, references entityId as string]

SiteContent                          [key-value CMS]
NewsletterSubscription               [email unique]
```

## 4. Foreign Key Constraints

- `Building.projectId` → `Project.id` (cascade delete)
- `Apartment.projectId` → `Project.id` (cascade delete)
- `Apartment.buildingId` → `Building.id` (set null on delete — preserves apartment)
- `ProjectImage.projectId` → `Project.id` (cascade delete)
- `ApartmentImage.apartmentId` → `Apartment.id` (cascade delete)
- `ProjectAmenity.projectId` → `Project.id` (cascade delete)
- `Video.projectId?` → `Project.id?` (cascade delete, optional)
- `Video.apartmentId?` → `Apartment.id?` (cascade delete, optional)
- `LeadNote.leadId` → `Lead.id` (cascade delete)

## 5. Indexes

- `Lead.status` (admin list filter)
- `Lead.createdAt` (admin list sort)
- `ProjectImage.projectId` (eager load)
- `ProjectImage.type` (filter by type)
- `ApartmentImage.apartmentId` (eager load)
- `ProjectAmenity.projectId` (eager load)
- `Video.projectId` (filter)
- `Video.apartmentId` (filter)
- `LeadNote.leadId` (list notes for lead)
- `LeadNote.createdAt` (sort)
- `AuditLog.actorEmail` (filter by actor)
- `AuditLog.action` (filter by action)
- `AuditLog.entityType + entityId` (filter by entity)
- `AuditLog.createdAt` (sort)
- `NewsletterSubscription.status`
- `NewsletterSubscription.createdAt`

## 6. Unique Constraints

- `Project.slug` — unique (URL identifier)
- `Apartment.slug` — unique
- `Building.slug` — unique
- `Developer.slug` — unique
- `AdminUser.email` — unique (case-insensitive lookup)
- `NewsletterSubscription.email` — unique
- `SiteContent.key` — unique

## 7. Timestamps

Every model has:
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt` (auto-updated by Prisma on every mutation)

## 8. Publish / Archive Workflow

### Project + Apartment
- `published: Boolean @default(true)` — true = visible publicly, false = DRAFT
- `archived: Boolean @default(false)` — true = soft-deleted (invisible everywhere, preserved for historical leads)

### Video
- `published: Boolean @default(true)` — true = visible in public video section

### Public API filtering
- `GET /api/projects` → filters `published=true AND archived=false`
- `GET /api/projects/[slug]` → returns 404 if `published=false OR archived=true`
- `GET /api/apartments/[slug]` → same filter
- `GET /api/videos?projectId=...` → returns only `published=true`

## 9. SEO Fields (per entity)

### Project + Apartment (both)
- `seoTitle: String?` — meta title override
- `seoDescription: String?` — meta description override
- `seoKeywords: String?` — comma-separated keywords
- `canonicalUrl: String?` — canonical URL override
- `ogImage: String?` — OpenGraph image URL
- `robotsIndex: Boolean @default(true)` — false = NOINDEX

When empty, the public page auto-generates from name + tagline/description.

## 10. Audit Log Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  actorEmail  String?  // AdminUser email
  actorRole   String?  // ADMIN/EDITOR/VIEWER
  action      String   // LOGIN, CREATE_PROJECT, PRICE_CHANGE, etc. (24 types)
  entityType  String?  // Project, Apartment, ProjectImage, etc.
  entityId    String?  // id of affected entity
  entitySlug  String?  // slug for quick identification
  before      String?  // JSON-serialized before state (8KB cap)
  after       String?  // JSON-serialized after state (8KB cap)
  ipAddress   String?  // from x-forwarded-for or x-real-ip
  userAgent   String?  // browser user-agent
  createdAt   DateTime @default(now())

  @@index([actorEmail])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

24 action types tracked:
- Authentication: LOGIN, LOGIN_FAILED
- Project: CREATE_PROJECT, UPDATE_PROJECT, ARCHIVE_PROJECT
- Apartment: CREATE_APARTMENT, UPDATE_APARTMENT, UPDATE_APARTMENT_STATUS, ARCHIVE_APARTMENT
- Special: PRICE_CHANGE (when price field changes)
- Media: UPLOAD_MEDIA, DELETE_MEDIA, UPDATE_MEDIA
- Video: CREATE_VIDEO, UPDATE_VIDEO, DELETE_VIDEO
- Lead: UPDATE_LEAD, UPDATE_LEAD_STATUS, CREATE_LEAD_NOTE
- User: CREATE_USER, UPDATE_USER, DEACTIVATE_USER

## 11. Lead Pipeline

Extended pipeline (per directive §13):
```
NEW → CONTACTED → QUALIFIED → VISIT → NEGOTIATION → SOLD
                                                  ↘ LOST
```

Lead model fields:
- `name`, `phone`, `email?`, `preferredContact?`, `intent`, `message?`
- Context: `projectId?`, `projectName?`, `apartmentId?`, `apartmentName?`, `pageUrl?`, `landingPage?`
- Attribution: `utmSource?`, `utmMedium?`, `utmCampaign?`, `utmContent?`, `utmTerm?`, `gclid?`, `fbclid?`, `referrer?`
- `source?` (WEBSITE, WHATSAPP, PHONE, FORM)
- `status` (default NEW, 7-stage pipeline)
- `assignedTo?` (AdminUser email denormalized for fast display)
- `followUpDate?` (DateTime)
- Relations: `notes LeadNote[]`

## 12. Migration Commands

```bash
bun run db:push      # apply schema to SQLite (idempotent, --accept-data-loss flag)
bun run db:generate  # regenerate Prisma Client (after schema changes)
bun run db:seed      # reseed (warning: deletes all data first)
bun run db:reset     # full reset (destructive)
```

## 13. Backup

The entire database is a single file:
```bash
cp /home/z/my-project/db/custom.db /tmp/asas-backup-$(date +%Y%m%d).db
```

For production PostgreSQL migration:
1. Export data via `prisma db pull` (introspect)
2. Update `datasource` to `postgresql`
3. Run `prisma migrate dev` against the new PostgreSQL instance
4. Replicate data via seed.ts or `pg_dump`/`pg_restore`
