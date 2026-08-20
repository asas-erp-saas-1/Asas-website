# PHASE_2_DECISIONS.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — Open Decisions**
> Items that require business input before implementation. Each marked as **DECISION REQUIRED** with options, recommendation, and trade-offs.

## 1. Publication State Machine

**Question**: Should we use a simple 2-flag system (published + archived) or a full state machine (DRAFT → IN_REVIEW → READY → PUBLISHED → ARCHIVED)?

### Option A: Simple 2-flag (current)
- `published: Boolean` (true=published, false=draft)
- `archived: Boolean` (true=archived, false=active)
- States: DRAFT (published=false, archived=false), PUBLISHED (true, false), ARCHIVED (false, true)

**Pros**: Simple, already implemented, easy to understand
**Cons**: No review/approval workflow, no "ready for review" state

### Option B: Full state machine
- `publicationState: String` (DRAFT, IN_REVIEW, READY, PUBLISHED, ARCHIVED)
- Enables: EDITOR submits (DRAFT→READY), ADMIN approves (READY→PUBLISHED)
- Role-based state transitions

**Pros**: Proper content review workflow, prevents EDITOR from directly publishing
**Cons**: More complex, more states to manage, may be overkill for small team

### Recommendation
**Option A** (simple 2-flag) for now. ASAS has a small team — the review workflow is likely informal (admin reviews before publishing). If ASAS grows to 10+ editors, reconsider Option B.

**DECISION REQUIRED**: Does ASAS need a formal review/approval workflow?

---

## 2. Price History Tracking

**Question**: Should we track price change history per apartment?

### Option A: Audit log only (current)
- `AuditLog` table with `action=PRICE_CHANGE` captures before/after
- No dedicated `PriceHistory` table
- To view history: filter audit log by `action=PRICE_CHANGE` + `entityId`

**Pros**: No new table, already implemented, audit log captures everything
**Cons**: Slow to query (need to parse JSON before/after), no UI for "price history per apartment"

### Option B: Dedicated PriceHistory table
```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  apartmentId String
  apartment   Apartment @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  oldPrice    Int?
  newPrice    Int?
  changedBy   String?
  changedAt   DateTime @default(now())
}
```

**Pros**: Fast queries, UI can show price evolution chart, easy export
**Cons**: New table, potential data duplication with audit log

### Recommendation
**Option A** (audit log only) for now. Add Option B only if there's a UI need to display price history per apartment (e.g., "Price evolution for A-101: 12M → 12.5M → 13M").

**DECISION REQUIRED**: Does ASAS need to display price history per apartment?

---

## 3. Floor Plan Versioning

**Question**: Should floor plans support version history (keep multiple plan versions)?

### Option A: No versioning (current)
- Upload new floor plan → replaces old one (old is deleted)
- Admin can upload multiple images with `type=floor-plan` — the first is "primary"

**Pros**: Simple, no version management
**Cons**: No rollback if new plan is wrong, no audit trail of plan changes

### Option B: Version history
- Each plan upload creates a new version (timestamp + uploader)
- Admin can set "current version" + view/restore old versions
- Requires: `FloorPlan` model with `version: Int`, `isCurrent: Boolean`, `uploadedBy: String?`

**Pros**: Rollback capability, audit trail, comparison view
**Cons**: More complex, more storage, may be unnecessary if plans rarely change

### Recommendation
**Option A** (no versioning) for now. Floor plans rarely change after initial upload. If a plan changes, admin uploads a new one + deletes the old. The audit log (`UPLOAD_MEDIA` + `DELETE_MEDIA`) captures who changed what and when.

**DECISION REQUIRED**: Do floor plans change frequently enough to warrant versioning?

---

## 4. Permission System: Role-based vs Permission-based

**Question**: Should permissions be role-based (3 fixed roles) or permission-based (configurable per role)?

### Option A: Role-based (current)
- 3 hardcoded roles: ADMIN, EDITOR, VIEWER
- Role-to-permission mapping hardcoded in code
- Cannot add custom roles or modify permissions without code change

**Pros**: Simple, fast, no extra DB tables, easy to understand
**Cons**: Inflexible — cannot create "SUPER_EDITOR" or "LEAD_MANAGER" roles

### Option B: Permission-based
- `Permission` model (id, name)
- `RolePermission` join table
- Admin UI to toggle permissions per role
- Enables custom roles

**Pros**: Flexible, custom roles, fine-grained control
**Cons**: More complex, more tables, more UI, overkill for 3 roles

### Recommendation
**Option A** (role-based) for now. ASAS has 3 roles — configurable permissions are overkill. Add Option B only if ASAS needs custom roles or multi-tenant.

**DECISION REQUIRED**: Does ASAS plan to have custom roles or multi-tenant?

---

## 5. Video Hosting Strategy

**Question**: Should uploaded videos be stored locally, on object storage (S3/Supabase), or use external hosting (YouTube/Vimeo)?

### Option A: External only (current for URL-based)
- Admin pastes YouTube/Vimeo URL
- No uploaded video files

**Pros**: No storage cost, no bandwidth cost, CDN handled by YouTube/Vimeo
**Cons**: Dependent on external platform, no control over video quality/compression

### Option B: Local storage (current for uploaded MP4)
- Admin uploads MP4 file
- Stored in `/public/uploads/videos/...`
- Served directly by Next.js

**Pros**: Full control, no external dependency
**Cons**: Storage grows, bandwidth cost, no transcoding/adaptive streaming

### Option C: Object storage + CDN
- Upload to S3/Supabase Storage
- Serve via CDN
- Optional: HLS transcoding for adaptive streaming

**Pros**: Scalable, CDN delivery, adaptive quality
**Cons**: More infrastructure, transcoding cost, more complex

### Recommendation
**Option A** (external YouTube/Vimeo) for most videos. Use Option B (local MP4) only for short clips. For production at scale, use Option C (object storage + CDN + HLS).

**DECISION REQUIRED**: What is ASAS's expected video volume? Do they need HD streaming?

---

## 6. Admin Search

**Question**: Should admin have a global search (search across projects + apartments + leads + media)?

### Option A: Per-entity search (current)
- Each tab has its own search/filter
- Media library has search (alt/caption)
- No global search

**Pros**: Simple, focused
**Cons**: Employee must navigate to the right tab first

### Option B: Global search (Cmd+K palette)
- Already exists as `SearchCommandPalette` component (currently for public site)
- Extend to admin: search projects, apartments, leads, media

**Pros**: Fast cross-entity search, keyboard accessible
**Cons**: More complex, needs indexing

### Recommendation
**Option B** (global search) — the component already exists. Extend it for admin context.

**DECISION REQUIRED**: Is global admin search a priority?

---

## 7. Cache Invalidation Strategy

**Question**: Should we use Next.js ISR (Incremental Static Regeneration) or on-demand revalidation?

### Option A: Client-side caching only (current)
- React Query with 1-minute staleTime
- No server-side caching
- Admin mutations invalidate React Query cache

**Pros**: Simple, already works
**Cons**: Public site is always dynamic (slower), no CDN caching

### Option B: ISR with revalidateTag
- Public pages use `unstable_cache` or ISR
- Admin mutations call `revalidateTag('projects')` or `revalidatePath('/projects/[slug]')`
- Next.js cache invalidated on-demand

**Pros**: Fast public pages, CDN cacheable, on-demand refresh
**Cons**: More complex, needs tag management, potential stale content if revalidation fails

### Recommendation
**Option B** for production (after migrating to App Router routes). Currently not possible with hash routing (client-side rendered).

**DECISION REQUIRED**: When is the App Router migration planned?

---

## 8. Multi-language Strategy

**Question**: Should the system support full bilingual (FR/AR) or just FR with AR fields?

### Option A: Bilingual fields (current)
- Each entity has FR + AR fields (name/nameAr, description/descriptionAr, etc.)
- Public site defaults to FR, has language toggle
- Admin edits both

**Pros**: Both languages stored, admin controls content
**Cons**: More fields, admin must fill both (can leave AR empty)

### Option B: Full i18n with separate content
- Each entity has a `locale` field
- Separate records for FR and AR versions
- More complex but cleaner separation

**Pros**: Clean separation, can have different content per locale
**Cons**: Much more complex, duplicate records, harder to manage

### Recommendation
**Option A** (bilingual fields) — simpler, already implemented, works for ASAS's needs. Option B is overkill for a 2-language system.

**DECISION REQUIRED**: Does ASAS need different content per locale (not just translation)?

---

## 9. Lead Pipeline Stages

**Question**: Is the 7-stage pipeline (NEW→CONTACTED→QUALIFIED→VISIT→NEGOTIATION→SOLD→LOST) correct?

### Current implementation
- 7 stages, inline status change dropdown
- No automation (all manual)
- No scheduled follow-up reminders

### Question: Should we add automation?
- Auto-assign leads to specific employees based on project?
- Auto-escalate stale leads (NEW > 48h → flag)?
- Auto-suggest next action based on status?

### Recommendation
Keep manual for now. Add automation if ASAS's lead volume justifies it (>50 leads/week).

**DECISION REQUIRED**: What is ASAS's expected lead volume?

---

## 10. Bulk Operations

**Question**: Which bulk operations are actually needed?

### Candidates
1. Bulk publish/unpublish apartments (select 20 → publish all)
2. Bulk status change (select 15 → set AVAILABLE)
3. Bulk archive (select 5 old projects → archive)
4. Bulk media upload (select 30 images → assign to project)
5. Bulk media reorder (drag-drop sort)
6. Bulk export (export apartments to CSV/Excel)

### Recommendation
Implement in priority order:
1. **Bulk media upload** (HIGH — saves time for employees uploading 40+ images)
2. **Bulk status change** (MEDIUM — useful when marking multiple apartments SOLD)
3. **Bulk publish/unpublish** (MEDIUM)
4. **Bulk export** (LOW — nice to have)
5. **Bulk archive** (LOW — rare operation)
6. **Bulk media reorder** (LOW — drag-drop is complex)

**DECISION REQUIRED**: Which bulk operations does ASAS actually need?

---

## 11. Media: Delete vs Remove from Project

**Question**: Should "delete media" and "remove media from project" be different actions?

### Current
- Delete = remove file from disk + delete DB row (hard-delete)
- No "remove from project" concept — media belongs to exactly one entity

### Proposed distinction
- **Remove from project**: unassign media from project (media still exists in library, can be reassigned)
- **Delete permanently**: remove file + DB row (irreversible)

### Recommendation
This distinction is useful if media can be reused across multiple entities. Currently, each media item belongs to exactly one project OR apartment. If ASAS wants to reuse a single image across multiple projects, the data model needs to change (many-to-many between Media and entities).

**DECISION REQUIRED**: Can a single media asset be used by multiple projects/apartments?

---

## 12. Slug Change Policy

**Question**: Should slugs be editable after creation?

### Current
- Slug is set at creation time (auto-generated from name)
- Not editable in the edit form (can be changed via API but no UI)

### Risk
- Changing slug breaks SEO (old URL → 404)
- Changing slug breaks bookmarks
- Changing slug breaks internal links

### Options
- **A**: Slug is immutable (never changeable)
- **B**: Slug is editable, but warns + creates 301 redirect from old to new
- **C**: Slug is editable, no redirect (SEO penalty)

### Recommendation
**Option A** (immutable) for now. Slugs should be set carefully at creation. If a slug must change, an admin can do it via direct DB access + manual 301 redirect setup.

**DECISION REQUIRED**: Does ASAS need to change slugs after creation?
