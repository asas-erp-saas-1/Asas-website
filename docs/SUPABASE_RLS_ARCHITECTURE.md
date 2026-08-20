# SUPABASE_RLS_ARCHITECTURE.md — Row-Level Security Policies

> **Phase 3 Step 13 — Supabase RLS Design**
> Every table's RLS policy documented. Service-role key NEVER exposed to browser.

## 1. RLS Principle

Row-Level Security (RLS) is enforced at the PostgreSQL level. Even if the application has a bug, the database itself prevents unauthorized access.

**Three access tiers**:
1. **Public (anon key)** — can read published content + submit leads
2. **Authenticated admin** — can read all content (ADMIN/EDITOR/VIEWER)
3. **Service role** — bypasses RLS (server-only, NEVER in browser)

## 2. Role Mapping

Supabase Auth provides JWT claims. The ASAS `AdminUser.role` (ADMIN/EDITOR/VIEWER) is stored as a custom claim in the JWT.

```sql
-- Custom claim: role = 'ADMIN' | 'EDITOR' | 'VIEWER'
-- Accessible via: auth.jwt() ->> 'role'
```

## 3. RLS Policy Summary

| Table | Public SELECT | Admin SELECT | Admin INSERT | Admin UPDATE | Admin DELETE |
|---|---|---|---|---|---|
| Developer | ✅ | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| Project | ✅ (published only) | ✅ (all) | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| Building | ✅ (via published project) | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| Apartment | ✅ (published only) | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| ProjectImage | ✅ (via published project) | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| ApartmentImage | ✅ (via published apt) | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| Video | ✅ (published only) | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| ProjectAmenity | ✅ (via project) | ✅ | ADMIN+EDITOR | ADMIN+EDITOR | ADMIN |
| Lead | ❌ (INSERT only) | ✅ | Public (INSERT only) | ADMIN+EDITOR | ADMIN |
| LeadNote | ❌ | ✅ | ADMIN+EDITOR | ❌ (append-only) | ❌ |
| AdminUser | ❌ | ✅ | ADMIN | ADMIN | ADMIN |
| AuditLog | ❌ | ✅ | ❌ (system only) | ❌ | ❌ |
| SiteContent | ✅ (specific keys) | ✅ | ADMIN | ADMIN | ADMIN |
| NewsletterSubscription | ❌ | ✅ | Public (INSERT only) | ADMIN | ADMIN |
| PriceHistory | ❌ | ✅ | System (trigger) | ❌ | ❌ |
| AnalyticsEvent | ❌ | ✅ | Public (INSERT only) | ❌ | ❌ |

## 4. Detailed RLS Policies

### 4.1 Developer
```sql
-- Public: read all developers (they're not sensitive)
CREATE POLICY "public_read_developers" ON developers FOR SELECT TO anon USING (true);
-- Admin: full read
CREATE POLICY "admin_read_developers" ON developers FOR SELECT TO authenticated USING (true);
-- Admin+EDITOR: insert + update
CREATE POLICY "editor_write_developers" ON developers FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'));
-- ADMIN only: delete
CREATE POLICY "admin_delete_developers" ON developers FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN');
```

### 4.2 Project
```sql
-- Public: read published + non-archived
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon
  USING (published = true AND archived = false);
-- Admin: read all
CREATE POLICY "admin_read_projects" ON projects FOR SELECT TO authenticated USING (true);
-- ADMIN+EDITOR: insert + update
CREATE POLICY "editor_write_projects" ON projects FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR')
    AND NOT (published = true AND archived = true));
-- ADMIN only: delete (archive)
CREATE POLICY "admin_delete_projects" ON projects FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN');
```

### 4.3 Apartment
```sql
-- Public: read published + non-archived
CREATE POLICY "public_read_apartments" ON apartments FOR SELECT TO anon
  USING (published = true AND archived = false);
-- Admin: read all
CREATE POLICY "admin_read_apartments" ON apartments FOR SELECT TO authenticated USING (true);
-- ADMIN+EDITOR: insert + update (with CHECK constraint on publish state)
CREATE POLICY "editor_write_apartments" ON apartments FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR')
    AND NOT (published = true AND archived = true));
-- ADMIN only: delete
CREATE POLICY "admin_delete_apartments" ON apartments FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN');
```

### 4.4 Lead (special: public INSERT, admin SELECT/UPDATE)
```sql
-- Public: INSERT only (no SELECT)
CREATE POLICY "public_insert_leads" ON leads FOR INSERT TO anon WITH CHECK (true);
-- Admin: SELECT all
CREATE POLICY "admin_read_leads" ON leads FOR SELECT TO authenticated USING (true);
-- ADMIN+EDITOR: UPDATE status
CREATE POLICY "editor_update_leads" ON leads FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'));
-- ADMIN only: DELETE
CREATE POLICY "admin_delete_leads" ON leads FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN');
```

### 4.5 AuditLog (append-only, no UPDATE/DELETE)
```sql
-- Admin: SELECT only
CREATE POLICY "admin_read_audit" ON audit_logs FOR SELECT TO authenticated USING (true);
-- No INSERT/UPDATE/DELETE via RLS — only service role can INSERT
-- (application uses service role key server-side to log audit entries)
```

### 4.6 AdminUser (admin-only)
```sql
-- Admin: SELECT
CREATE POLICY "admin_read_users" ON admin_users FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR', 'VIEWER'));
-- ADMIN only: INSERT + UPDATE
CREATE POLICY "admin_write_users" ON admin_users FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');
-- Self-protection: user cannot change own role or deactivate self
-- (enforced at application level, not RLS — RLS can't express "not self")
```

## 5. Service Role Usage

The `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL RLS policies. It is used ONLY in:
- Server-side API routes (`src/app/api/admin/*`)
- Audit log insertion (`src/lib/audit.ts`)
- Database migrations

**NEVER exposed to browser**: no `NEXT_PUBLIC_` prefix, never imported in client components.

## 6. Enabling RLS

```sql
-- Enable RLS on all tables
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
```

## 7. Testing RLS

After enabling RLS, test with:
1. **Anonymous user** — can only read published content
2. **VIEWER** — can read all admin data, cannot mutate
3. **EDITOR** — can create/update, cannot delete
4. **ADMIN** — can do everything
5. **Service role** — bypasses all RLS (server-only)

**Test case**: A VIEWER attempts `DELETE FROM projects WHERE id = 'xxx'` → should be rejected with 403/RLS error.

## 8. Storage RLS (Supabase Storage)

Supabase Storage buckets also need access policies:

### Bucket: `renders`
```sql
-- Public read
CREATE POLICY "public_read_renders" ON storage.objects FOR SELECT
  USING (bucket_id = 'renders');
-- Admin upload
CREATE POLICY "admin_upload_renders" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'renders' AND auth.jwt() ->> 'role' IN ('ADMIN', 'EDITOR'));
-- Admin delete
CREATE POLICY "admin_delete_renders" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'renders' AND auth.jwt() ->> 'role' = 'ADMIN');
```

### Buckets: `plans`, `gallery`
Same pattern as `renders`.

## 9. Security Boundary Summary

| Access Level | Can Read | Can Write | Can Delete |
|---|---|---|---|
| Public (anon) | Published content only | Leads (INSERT only), Newsletter (INSERT only), Analytics (INSERT only) | Nothing |
| VIEWER | All admin data | Nothing | Nothing |
| EDITOR | All admin data | Create + Update (no delete) | Nothing |
| ADMIN | All admin data | Everything | Everything (except own account) |
| Service Role | Everything | Everything | Everything (bypasses RLS) |
