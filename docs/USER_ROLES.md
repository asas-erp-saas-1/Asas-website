# USER ROLES — ASAS Real Estate CMS

## Overview

ASAS Admin supports 3 roles with server-side enforcement. Security never depends on UI — if a user lacks permission, the API rejects the request with 403 Forbidden.

## Roles

### ADMIN — Full Access
| Capability | Allowed |
|---|---|
| View dashboard | ✅ |
| Manage users (create/edit/deactivate) | ✅ |
| Create projects | ✅ |
| Edit projects (all fields) | ✅ |
| Archive/delete projects | ✅ |
| Publish/unpublish projects | ✅ |
| Create apartments | ✅ |
| Edit apartments (all fields) | ✅ |
| Archive/delete apartments | ✅ |
| Manage media (upload/edit/delete) | ✅ |
| Manage videos (add/edit/delete) | ✅ |
| Manage prices | ✅ |
| Manage SEO | ✅ |
| Manage leads (status change + notes) | ✅ |
| Manage settings | ✅ |
| View audit log | ✅ |
| Manage team | ✅ |

### EDITOR — Content Manager
| Capability | Allowed |
|---|---|
| View dashboard | ✅ |
| Manage users | ❌ 403 |
| Create projects | ✅ |
| Edit projects (all fields) | ✅ |
| Archive/delete projects | ❌ 403 (ADMIN only) |
| Publish/unpublish projects | ✅ |
| Create apartments | ✅ |
| Edit apartments (all fields) | ✅ |
| Archive/delete apartments | ❌ 403 (ADMIN only) |
| Manage media (upload/edit/delete) | ✅ upload/edit, ❌ 403 delete |
| Manage videos (add/edit/delete) | ✅ add/edit, ❌ 403 delete |
| Manage prices | ✅ |
| Manage SEO | ✅ |
| Manage leads (status change + notes) | ✅ |
| Manage settings | ❌ (read-only) |
| View audit log | ✅ |

**EDITOR cannot**:
- Manage users
- Change administrator permissions
- Access security settings
- Delete critical system data (projects, apartments, media, videos)

### VIEWER — Read-Only
| Capability | Allowed |
|---|---|
| View dashboard | ✅ |
| View projects list | ✅ |
| View project detail | ✅ |
| View apartments list | ✅ |
| View apartment detail | ✅ |
| View media library | ✅ |
| View leads | ✅ |
| View audit log | ✅ |
| View users | ✅ |
| **Any mutation** (create/edit/delete/publish/upload) | ❌ 403 |

**VIEWER cannot**:
- Edit
- Delete
- Publish
- Unpublish
- Change prices
- Upload media
- Modify SEO
- Modify leads
- Add notes

## Server-Side Enforcement

All checks are at the API level — every `/api/admin/*` route starts with:

```typescript
const session = verifyAdminAuth(request);
if (!session) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
// Mutation endpoints also check role:
if (!sessionHasRole(session, ['ADMIN'])) {
  return NextResponse.json({ error: 'Privilèges insuffisants' }, { status: 403 });
}
```

## Permission Matrix per Endpoint

| Endpoint | ADMIN | EDITOR | VIEWER |
|---|---|---|---|
| `GET /api/admin/projects` | ✅ | ✅ | ✅ |
| `POST /api/admin/projects` | ✅ 201 | ✅ 201 | ❌ 403 |
| `PUT /api/admin/projects/[slug]` | ✅ | ✅ | ❌ 403 |
| `DELETE /api/admin/projects/[slug]` | ✅ (archive) | ❌ 403 | ❌ 403 |
| `GET /api/admin/apartments` | ✅ | ✅ | ✅ |
| `POST /api/admin/apartments` | ✅ 201 | ✅ 201 | ❌ 403 |
| `PUT /api/admin/apartments/[slug]` | ✅ | ✅ | ❌ 403 |
| `DELETE /api/admin/apartments/[slug]` | ✅ (archive) | ❌ 403 | ❌ 403 |
| `GET /api/admin/media` | ✅ | ✅ | ✅ |
| `POST /api/admin/media/upload` | ✅ | ✅ | ❌ 403 |
| `PATCH /api/admin/media/[id]` | ✅ | ✅ | ❌ 403 |
| `DELETE /api/admin/media/[id]` | ✅ | ❌ 403 | ❌ 403 |
| `GET /api/admin/videos` | ✅ | ✅ | ✅ |
| `POST /api/admin/videos` | ✅ 201 | ✅ 201 | ❌ 403 |
| `PATCH /api/admin/videos/[id]` | ✅ | ✅ | ❌ 403 |
| `DELETE /api/admin/videos/[id]` | ✅ | ❌ 403 | ❌ 403 |
| `GET /api/admin/leads` | ✅ | ✅ | ✅ |
| `PATCH /api/admin/leads/[id]/status` | ✅ | ✅ | ❌ 403 |
| `GET /api/admin/leads/[id]/notes` | ✅ | ✅ | ✅ |
| `POST /api/admin/leads/[id]/notes` | ✅ | ✅ | ❌ 403 |
| `GET /api/admin/users` | ✅ | ✅ | ✅ |
| `POST /api/admin/users` | ✅ 201 | ❌ 403 | ❌ 403 |
| `PATCH /api/admin/users/[id]` | ✅ | ❌ 403 | ❌ 403 |
| `DELETE /api/admin/users/[id]` | ✅ (deactivate) | ❌ 403 | ❌ 403 |
| `GET /api/admin/audit` | ✅ | ✅ | ✅ |
| `GET /api/admin/me` | ✅ | ✅ | ✅ |

## Self-Protection Rules

1. **Cannot change own role** — prevents privilege escalation or loss.
2. **Cannot deactivate own account** — prevents self-lockout.
3. **Cannot delete own account** — same.

These checks are at the API level (`src/app/api/admin/users/[id]/route.ts`).

## Verification Evidence

All 28 Red Team tests in `docs/TESTING.md` PASS. Highlights:
- VIEWER attempts POST `/api/admin/projects` → 403 ✅
- VIEWER attempts DELETE `/api/admin/projects/[slug]` → 403 ✅
- VIEWER attempts upload → 403 ✅
- VIEWER attempts to change lead status → 403 ✅
- EDITOR attempts DELETE → 403 ✅
- EDITOR can POST/upload → 200/201 ✅
- ADMIN can do everything → 200/201 ✅
