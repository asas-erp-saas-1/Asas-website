# SECURITY_BOUNDARY.md — ASAS Real Estate CMS

> **Phase 2 Blueprint — Public/Admin Security Boundary + RLS Strategy + Access Boundaries**

## 1. Security Boundary Principle

> **Security must never depend on UI. The API is the real boundary. Hiding a button is NOT security.**

If a VIEWER cannot perform an action, the API must reject it with 403 — even if the button is hidden in the UI.

## 2. Access Boundaries

### PUBLIC (unauthenticated visitors)
| Can | Cannot |
|---|---|
| Read published projects | Read unpublished/draft projects |
| Read published apartments | Read unpublished apartments |
| Read public media (hero, gallery, plans) | Read private/admin media |
| Read published videos | Read unpublished videos |
| Submit leads (POST /api/leads) | Read leads |
| Subscribe to newsletter | Read subscriptions |
| View sitemap.xml | View admin pages |
| View robots.txt | Access /api/admin/* |
| View structured data (JSON-LD) | |

### AUTHENTICATED (any admin role: ADMIN, EDITOR, VIEWER)
| Can | Cannot |
|---|---|
| Access /#/admin | Access admin APIs without session |
| View dashboard, lists, detail views | (depends on role) |
| View audit log (read-only) | Modify audit log (append-only) |
| View users list | (modify depends on role) |
| Logout | |

### ADMIN (full access)
| Can |
|---|
| Everything AUTHENTICATED can do |
| Create/update/archive projects |
| Create/update/archive apartments |
| Upload/update/delete media |
| Create/update/delete videos |
| Update lead status + add notes |
| Create/update/deactivate users |
| Read audit log |
| All settings |

### EDITOR (content manager)
| Can | Cannot |
|---|---|
| Create/update projects | Delete/archive projects |
| Create/update apartments | Delete/archive apartments |
| Upload/update media | Delete media |
| Create/update videos | Delete videos |
| Update lead status + add notes | Delete leads |
| Manage SEO | Manage users |
| Publish/unpublish content | Change security settings |

### VIEWER (read-only)
| Can | Cannot |
|---|---|
| Read all admin data | Create/update anything |
| View audit log | Delete anything |
| View users | Publish/unpublish |
| Export (future) | Upload media |

## 3. Public API Contract

### What public APIs return

| Endpoint | Returns | Filters |
|---|---|---|
| GET /api/projects | Projects where `published=true AND archived=false` | None (already filtered) |
| GET /api/projects/[slug] | Single project + relations | `published=true AND archived=false` (404 if not) |
| GET /api/apartments/[slug] | Single apartment + relations | `published=true AND archived=false` (404 if not) |
| GET /api/stats | Aggregate counts | Only published entities |
| GET /api/videos | Videos where `published=true` | None |
| POST /api/leads | Creates lead | None (write-only) |
| POST /api/newsletter/subscribe | Creates subscription | None (write-only) |

### What public APIs NEVER return
- Admin user data (emails, passwords, roles)
- Audit log entries
- Lead records (write-only via POST)
- Draft/unpublished content
- Archived content
- Private media (unpublished)
- Internal notes (LeadNote)
- AdminUser passwordHash
- Session tokens

### Filtering is server-side
```typescript
// ✅ CORRECT — server filters
const projects = await db.project.findMany({
  where: { published: true, archived: false }
});

// ❌ FORBIDDEN — client filters (data leak risk)
const allProjects = await db.project.findMany();
const published = allProjects.filter(p => p.published);
```

## 4. Admin API Contract

### Authentication
Every `/api/admin/*` route starts with:
```typescript
const session = verifyAdminAuth(request);
if (!session) return 401;
```

### Authorization
Mutation routes also check role:
```typescript
// POST/upload routes (ADMIN + EDITOR):
if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) return 403;

// DELETE/archive routes (ADMIN only):
if (!sessionHasRole(session, ['ADMIN'])) return 403;
```

### Self-Protection
```typescript
// User management self-protection:
if (existing.email === session.email) {
  if (parsed.data.role !== undefined && parsed.data.role !== existing.role) {
    return 400; // "Vous ne pouvez pas modifier votre propre rôle"
  }
  if (parsed.data.active === false) {
    return 400; // "Vous ne pouvez pas désactiver votre propre compte"
  }
}
```

## 5. Session Management

### Current (in-memory)
```typescript
const sessions: Map<string, AdminSession> = new Map();
// TTL: 8 hours
// pruneExpired() runs on every auth check
```

### Future (Redis or DB-backed)
For multi-instance deployment:
- Store sessions in Redis with TTL
- Or store in `AdminSession` DB table with `expiresAt` + periodic cleanup
- Enables: session revocation, concurrent session limits, "last active" tracking

### Cookie
```
admin-session={token}
  httpOnly: true       // not readable by JS
  sameSite: 'lax'      // CSRF mitigation
  secure: true (prod)  // HTTPS only
  path: '/'            // available on all routes
  maxAge: 28800        // 8 hours
```

## 6. File Upload Security (Defense-in-Depth)

### 6-Layer Validation
1. **Auth**: `verifyAdminAuth(request)` → 401 if no session
2. **Authorization**: `sessionHasRole(session, ['ADMIN', 'EDITOR'])` → 403 if VIEWER
3. **Declared MIME**: `file.type` must be in allow-list (JPEG/PNG/WebP/AVIF/GIF)
4. **File size**: `file.size ≤ 8MB`
5. **Magic bytes**: Read first 12 bytes, verify against declared MIME format
6. **Entity existence**: `entityId` must exist in DB

### Path Traversal Prevention
```typescript
const destDir = path.join(process.cwd(), 'public', 'uploads', entityType + 's', entitySlug);
// No user-supplied path components — only validated slug + generated filename
const filename = `${entitySlug}-${type}-${Date.now()}-${random()}.${ext}`;
const publicUrl = `/uploads/${entityType}s/${entitySlug}/${filename}`;
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(path.join(destDir, filename), bytes);
```

Delete route:
```typescript
const filePath = path.join(process.cwd(), 'public', found.img.url);
if (filePath.startsWith(path.join(process.cwd(), 'public'))) {
  fs.unlinkSync(filePath); // Only delete if within public dir
}
```

## 7. SQL Injection Prevention

All database access via Prisma ORM:
```typescript
// ✅ CORRECT — parameterized queries
const project = await db.project.findUnique({ where: { slug } });

// ❌ FORBIDDEN — raw SQL with string interpolation
const result = await db.$queryRaw(`SELECT * FROM Project WHERE slug = '${slug}'`);
```

Prisma uses parameterized queries by default — SQL injection is not possible through normal Prisma operations.

## 8. XSS Prevention

- All user-supplied content rendered via React JSX (auto-escaped)
- NO `dangerouslySetInnerHTML` calls (grep confirmed)
- Lead `message` field escaped when rendered in admin Leads tab
- Rich text (future): use a sanitization library (DOMPurify) before rendering

## 9. CSRF Prevention

- Session cookie uses `sameSite: 'lax'` → blocks cross-origin POST
- All state-changing endpoints require the session cookie (not readable cross-origin)
- Acceptable for this threat model (admin-only endpoints)
- Future: add CSRF tokens if threat model changes (e.g., public form submissions)

## 10. Secret Management

### No secrets in source code
- No `ADMIN_PASSWORD` env var (removed in Phase A)
- No service_role keys
- No API keys in client bundles
- `z-ai-web-dev-sdk` imported only in server-side code

### .env contents
```
DATABASE_URL=file:/home/z/my-project/db/custom.db
```
That's the entire `.env` — no secrets.

### Future (production)
```
DATABASE_URL=postgresql://...        # Supabase connection string
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...            # public key (NEXT_PUBLIC_ prefix OK)
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # SERVER-ONLY (never NEXT_PUBLIC_)
```

## 11. HTTP Security Headers

Applied via `withSecurityHeaders()`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

Next.js config:
- `poweredByHeader: false`
- `compress: true`

Future:
- `Content-Security-Policy: default-src 'self'; ...` (CSP header)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)

## 12. Future: Supabase RLS Strategy

When migrating to Supabase PostgreSQL, enable Row-Level Security (RLS) on all tables.

### Public-accessible tables (RLS policies)
```sql
-- Projects: public can read published + non-archived
CREATE POLICY "public_read_published_projects" ON projects
  FOR SELECT USING (published = true AND archived = false);

-- Apartments: public can read published + non-archived
CREATE POLICY "public_read_published_apartments" ON apartments
  FOR SELECT USING (published = true AND archived = false);

-- Leads: public can INSERT (but not SELECT)
CREATE POLICY "public_insert_leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Media: public can read media for published entities
CREATE POLICY "public_read_project_images" ON project_images
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE published = true AND archived = false
    )
  );
```

### Admin-accessible tables (RLS policies)
```sql
-- Admin can read everything
CREATE POLICY "admin_read_all" ON projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Only ADMIN role can delete
CREATE POLICY "admin_delete_projects" ON projects
  FOR DELETE TO authenticated USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );
```

### Service role key
- NEVER exposed to client/browser
- Used only in server-side API routes for admin operations
- Stored as `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix)

## 13. Rate Limiting (future)

### Login API
- 5 attempts per IP per minute
- After 10 failed attempts: 15-minute lockout per IP
- After 50 failed attempts: 1-hour lockout per email

### Lead API
- 10 submissions per IP per hour
- After 50: 1-hour cooldown

### Media upload
- 20 uploads per admin per hour

### Implementation
- Cloudflare rate limiting (easiest)
- OR Caddy rate limiting middleware
- OR application-level rate limiter (e.g., `rate-limiter-flexible`)

## 14. Audit Log as Security Tool

The AuditLog table is not just for compliance — it's an active security tool:

- **Detect brute-force**: filter `action=LOGIN_FAILED` by IP in last hour
- **Detect privilege escalation attempts**: filter `action=UPDATE_USER` where `after.role=ADMIN` and `before.role!=ADMIN`
- **Detect suspicious price changes**: filter `action=PRICE_CHANGE` where `after.price < before.price * 0.5` (50%+ price drop)
- **Detect mass deletions**: filter `action=DELETE_MEDIA` count per actor per hour

## 15. Security Red Team (37 tests PASS)

See `RED_TEAM_REVIEW.md` for the full 37-test battery. Summary:
- 0 critical issues
- 0 high-severity issues
- 3 medium-severity issues (mitigated: in-memory sessions, no rate limiting, no CSRF tokens)
- 2 low-severity issues (no video transcoding, no audit retention policy)
