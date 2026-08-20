# ROLE_PERMISSION_MATRIX.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — Role + Permission Model**
> Defines granular permissions, role-to-permission matrix, and server-side enforcement strategy.

## 1. Roles

| Role | Purpose | Description |
|---|---|---|
| ADMIN | Full system access | Can do everything — manage users, projects, apartments, media, videos, leads, settings, audit log |
| EDITOR | Content manager | Can create/edit projects, apartments, media, videos, leads — but cannot delete or manage users |
| VIEWER | Read-only auditor | Can read all admin data but cannot mutate anything |

## 2. Permission Model

### Granular Permissions

```
project.read          project.create        project.update
project.publish       project.unpublish     project.archive
project.delete        project.manage_seo

apartment.read        apartment.create      apartment.update
apartment.publish     apartment.unpublish   apartment.archive
apartment.delete      apartment.change_price  apartment.change_status
apartment.manage_seo

building.read         building.create       building.update
building.delete

media.read            media.upload          media.update
media.delete          media.replace        media.reorder

video.read            video.create         video.update
video.delete          video.publish

lead.read             lead.update_status   lead.add_note
lead.delete           lead.export

user.read             user.create          user.update
user.deactivate       user.change_role     user.reset_password

audit.read

settings.read         settings.update
```

## 3. Role-to-Permission Matrix

| Permission | ADMIN | EDITOR | VIEWER |
|---|---|---|---|
| project.read | ✅ | ✅ | ✅ |
| project.create | ✅ | ✅ | ❌ |
| project.update | ✅ | ✅ | ❌ |
| project.publish | ✅ | ✅ | ❌ |
| project.unpublish | ✅ | ✅ | ❌ |
| project.archive | ✅ | ❌ | ❌ |
| project.delete | ✅ | ❌ | ❌ |
| project.manage_seo | ✅ | ✅ | ❌ |
| apartment.read | ✅ | ✅ | ✅ |
| apartment.create | ✅ | ✅ | ❌ |
| apartment.update | ✅ | ✅ | ❌ |
| apartment.publish | ✅ | ✅ | ❌ |
| apartment.unpublish | ✅ | ✅ | ❌ |
| apartment.archive | ✅ | ❌ | ❌ |
| apartment.delete | ✅ | ❌ | ❌ |
| apartment.change_price | ✅ | ✅ | ❌ |
| apartment.change_status | ✅ | ✅ | ❌ |
| apartment.manage_seo | ✅ | ✅ | ❌ |
| building.read | ✅ | ✅ | ✅ |
| building.create | ✅ | ✅ | ❌ |
| building.update | ✅ | ✅ | ❌ |
| building.delete | ✅ | ❌ | ❌ |
| media.read | ✅ | ✅ | ✅ |
| media.upload | ✅ | ✅ | ❌ |
| media.update | ✅ | ✅ | ❌ |
| media.delete | ✅ | ❌ | ❌ |
| media.replace | ✅ | ✅ | ❌ |
| media.reorder | ✅ | ✅ | ❌ |
| video.read | ✅ | ✅ | ✅ |
| video.create | ✅ | ✅ | ❌ |
| video.update | ✅ | ✅ | ❌ |
| video.delete | ✅ | ❌ | ❌ |
| video.publish | ✅ | ✅ | ❌ |
| lead.read | ✅ | ✅ | ✅ |
| lead.update_status | ✅ | ✅ | ❌ |
| lead.add_note | ✅ | ✅ | ❌ |
| lead.delete | ✅ | ❌ | ❌ |
| lead.export | ✅ | ✅ | ❌ |
| user.read | ✅ | ✅ | ✅ |
| user.create | ✅ | ❌ | ❌ |
| user.update | ✅ | ❌ | ❌ |
| user.deactivate | ✅ | ❌ | ❌ |
| user.change_role | ✅ | ❌ | ❌ |
| user.reset_password | ✅ | ❌ | ❌ |
| audit.read | ✅ | ✅ | ✅ |
| settings.read | ✅ | ✅ | ✅ |
| settings.update | ✅ | ❌ | ❌ |

## 4. Self-Protection Rules

| Rule | Rationale |
|---|---|
| Cannot change own role | Prevents privilege escalation (EDITOR → ADMIN) or loss (ADMIN → VIEWER self-lockout) |
| Cannot deactivate own account | Prevents self-lockout |
| Cannot delete own account | Same — preserves audit log referential integrity |
| Cannot reset own password via admin UI | Password reset requires entering current password (use /admin/settings → change password) |

## 5. Server-Side Enforcement Strategy

### Current Implementation (verified)
Every `/api/admin/*` route starts with:
```typescript
const session = verifyAdminAuth(request);
if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

// Mutation routes also check role:
if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
  return NextResponse.json({ error: 'Privilèges insuffisants' }, { status: 403 });
}
// DELETE routes are ADMIN-only:
if (!sessionHasRole(session, ['ADMIN'])) {
  return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
}
```

### Future: Permission-based (not role-based)
Instead of checking roles, check individual permissions:
```typescript
if (!hasPermission(session, 'apartment.change_price')) {
  return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
}
```

This requires a `Permission` model + role-to-permission mapping table. **DECISION REQUIRED**: Is this needed for ASAS's scale (3 roles, 1 organization)?

**Recommendation**: Keep role-based for now (3 roles is simple enough). Add permission-based only if ASAS needs custom roles or multi-tenant.

## 6. API Endpoint → Permission Mapping

| Endpoint | Method | Required Permission | Role Check |
|---|---|---|---|
| /api/admin/login | POST | (public) | None |
| /api/admin/logout | POST | (authenticated) | Any |
| /api/admin/me | GET | (authenticated) | Any |
| /api/admin/projects | GET | project.read | Any |
| /api/admin/projects | POST | project.create | ADMIN+EDITOR |
| /api/admin/projects/[slug] | GET | project.read | Any |
| /api/admin/projects/[slug] | PUT | project.update | ADMIN+EDITOR |
| /api/admin/projects/[slug] | DELETE | project.archive | ADMIN |
| /api/admin/apartments | GET | apartment.read | Any |
| /api/admin/apartments | POST | apartment.create | ADMIN+EDITOR |
| /api/admin/apartments/[slug] | GET | apartment.read | Any |
| /api/admin/apartments/[slug] | PUT | apartment.update | ADMIN+EDITOR |
| /api/admin/apartments/[slug] | DELETE | apartment.archive | ADMIN |
| /api/admin/apartments/[slug]/status | PATCH | apartment.change_status | ADMIN+EDITOR |
| /api/admin/buildings | GET | building.read | Any |
| /api/admin/buildings | POST | building.create | ADMIN+EDITOR |
| /api/admin/media | GET | media.read | Any |
| /api/admin/media/upload | POST | media.upload | ADMIN+EDITOR |
| /api/admin/media/[id] | GET | media.read | Any |
| /api/admin/media/[id] | PATCH | media.update | ADMIN+EDITOR |
| /api/admin/media/[id] | DELETE | media.delete | ADMIN |
| /api/admin/videos | GET | video.read | Any |
| /api/admin/videos | POST | video.create | ADMIN+EDITOR |
| /api/admin/videos/[id] | PATCH | video.update | ADMIN+EDITOR |
| /api/admin/videos/[id] | DELETE | video.delete | ADMIN |
| /api/admin/leads | GET | lead.read | Any |
| /api/admin/leads/[id]/status | PATCH | lead.update_status | ADMIN+EDITOR |
| /api/admin/leads/[id]/notes | GET | lead.read | Any |
| /api/admin/leads/[id]/notes | POST | lead.add_note | ADMIN+EDITOR |
| /api/admin/users | GET | user.read | Any |
| /api/admin/users | POST | user.create | ADMIN |
| /api/admin/users/[id] | GET | user.read | Any |
| /api/admin/users/[id] | PATCH | user.update | ADMIN |
| /api/admin/users/[id] | DELETE | user.deactivate | ADMIN |
| /api/admin/audit | GET | audit.read | Any |

## 7. UI Role-Based Rendering

The admin UI should hide/disable actions the user cannot perform. But this is **defense-in-depth only** — the API is the real security boundary.

### Current implementation
- All admin tabs are visible to all authenticated users (VIEWER sees the same sidebar as ADMIN)
- Action buttons (Create, Edit, Delete) are visible to all — the API rejects unauthorized attempts with 403
- **Future improvement**: hide/disable action buttons based on role for better UX (but API enforcement remains the real boundary)

## 8. Session Structure

```typescript
interface AdminSession {
  token: string;      // UUID v4
  email: string;      // AdminUser email
  name: string;       // Display name
  role: AdminRole;    // ADMIN | EDITOR | VIEWER
  userId: string;     // AdminUser id
  expiresAt: number;  // epoch ms (8h TTL)
}
```

Stored in-memory `Map<token, AdminSession>`. For production: Redis.

## 9. Audit Log for Role Changes

Every user role change is logged:
- `action: UPDATE_USER`
- `before: { role: 'EDITOR' }`
- `after: { role: 'ADMIN' }`
- `actorEmail`: the ADMIN who made the change
- `entitySlug`: the affected user's email

Self-protection prevents self-role-change (returns 400).

## 10. Future: Configurable Permissions

**DECISION REQUIRED**: Should permissions be configurable per-role via admin UI?

If yes:
- Create `Permission` model (id, name, description)
- Create `RolePermission` join table (roleId, permissionId)
- Admin UI to toggle permissions per role
- More flexible but more complex

**Recommendation**: Keep hardcoded role-to-permission mapping for now. ASAS has 3 roles — configurable permissions are overkill for this scale.
