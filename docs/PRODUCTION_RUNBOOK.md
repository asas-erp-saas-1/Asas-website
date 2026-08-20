# Production Runbook — ASAS Real Estate Platform

This document supersedes `docs/PRODUCTION_DEPLOYMENT.md`, `docs/FINAL_DEPLOYMENT_GUIDE.md`,
and `docs/DATABASE_BACKUP_RECOVERY.md` for the Phase 2 state.

Cross-references:
- [`ENVIRONMENT.md`](ENVIRONMENT.md) — every env var, classification, defaults.
- [`SECURITY.md`](SECURITY.md) — auth, RBAC, rate limits, known risks.
- [`DATABASE.md`](DATABASE.md) — schema, indexes, pooling, migration strategy.

Audience: on-call operator. Target deploy: Vercel + Supabase.

---

## 1. Pre-deploy checklist (30 items — Phase 2 directive §37)

### Code
- [ ] `bun run lint` → 0 errors.
- [ ] `bun run typecheck` → 0 errors.
- [ ] `bun run build` → succeeds (CI gate; see `.github/workflows/ci.yml`).
- [ ] `rg "NEXT_PUBLIC_.*(SECRET|PASSWORD|SERVICE_ROLE|PRIVATE)" src/` → no matches.
- [ ] `rg "fs\.write|fs\.mkdir" src/` → only `src/lib/storage.ts` matches.
- [ ] `rg "new PrismaClient" src/` → only `src/lib/db.ts` matches.
- [ ] No `console.log` of secrets, tokens, or cookies (manual scan; logger redacts PII).

### Database
- [ ] Supabase project created, region matches target audience.
- [ ] Pooled URL (`…pooler.supabase.com:6543`) copied → `DATABASE_URL`.
- [ ] Direct URL (`…supabase.com:5432`) copied → `DIRECT_URL`.
- [ ] `bunx prisma migrate deploy --schema=prisma/schema.postgres.prisma` succeeds
      (against staging first, then prod).
- [ ] Data migration `bun run scripts/migrate-to-postgres.ts` succeeds (if migrating
      from SQLite); row-count report shows `ok: true` for every model.
- [ ] `bunx prisma db seed` (with `ADMIN_BOOTSTRAP_PASSWORD` set) creates the admin user.
- [ ] `SEED_REFUSE_NON_EMPTY=true` set in production env (Vercel).

### Storage
- [ ] Supabase Storage bucket `media` created; public-read policy applied.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set (Vercel).
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set (Vercel).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (Vercel — server-only, scoped to Production).
- [ ] Smoke test: log in as admin, upload a test image to a project → URL resolves.

### Auth
- [ ] `ADMIN_SESSION_DRIVER=db` (or unset — defaults to `db` in prod).
- [ ] `ADMIN_SESSION_TTL=28800000` (8h).
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` set ONLY in operator shell, run seed once, then unset.
- [ ] Smoke test: log in, refresh, navigate — session persists across cold starts
      (proves DB-backed sessions work).

### Vercel
- [ ] Project imported from GitHub.
- [ ] Build command: `prisma generate && next build` (per `vercel.json`).
- [ ] Install command: `bun install` (per `vercel.json`).
- [ ] Region: `cdg1` (per `vercel.json`).
- [ ] All env vars from `.env.example` set in Vercel → Settings → Environment Variables,
      scoped to Production (and Preview if a preview Supabase project exists).

### DNS + TLS
- [ ] Production domain pointed at Vercel (CNAME or A record).
- [ ] Vercel issues TLS cert (auto).
- [ ] `NEXT_PUBLIC_SITE_URL` matches the canonical production URL.
- [ ] HSTS preload submission queued at https://hstspreload.org (post-launch).

### Observability
- [ ] Vercel log drain configured (Datadog / Logtail / Axiom) to capture NDJSON
      output of `src/lib/logger.ts`.
- [ ] Supabase daily PITR backup verified in project settings.
- [ ] On-call alert on 5xx rate > 1% (configure in Vercel → Monitoring).

---

## 2. Deploy procedure

The deploy is fully automated by Vercel once you push to `main`.

1. **Local pre-flight:**
   ```bash
   bun run lint && bun run typecheck && bun run build
   ```
2. **Commit + push:**
   ```bash
   git add -A && git commit -m "release: <summary>" && git push origin main
   ```
3. **Vercel auto-deploy:** Vercel builds on push to `main`. Watch the build at
   https://vercel.com/<org>/<project> — build time typically 2-4 min.
4. **Migration:** if the release includes a new committed migration under
   `prisma/migrations/postgres/NNNN_*/`, run `prisma migrate deploy` against prod
   (see §3) AFTER the build succeeds but BEFORE promoting the deployment.
5. **Verify (post-deploy):**
   ```bash
   curl -fsS https://<prod-domain>/api/stats   # expect 200 JSON
   curl -fsS https://<prod-domain>/sitemap.xml  # expect 200 XML
   ```
   - Log into admin, verify a recent lead is visible, verify session persists across
     refresh.
6. **Promote:** Vercel auto-promotes Production deploys from `main`. For Preview
   deployments, click "Promote to Production" in the Vercel dashboard.

---

## 3. Migration procedure

**Production migrations are operator-driven, never run from CI** (see
`.github/workflows/ci.yml` header for rationale).

```bash
# 1. Dry-run: list pending migrations
DATABASE_URL=postgresql://...pooler:6543/postgres \
DIRECT_URL=postgresql://...direct:5432/postgres \
bunx prisma migrate status --schema=prisma/schema.postgres.prisma

# 2. Apply pending migrations
DATABASE_URL=postgresql://...pooler:6543/postgres \
DIRECT_URL=postgresql://...direct:5432/postgres \
bunx prisma migrate deploy --schema=prisma/schema.postgres.prisma

# 3. Verify: list applied migrations
bunx prisma migrate status --schema=prisma/schema.postgres.prisma
```

If a migration fails partway: Prisma's `_prisma_migrations` table records the failed
state. Roll back the failing migration manually (read the down-SQL if present, or
restore from PITR — see §5), fix the SQL, commit, re-run `migrate deploy`.

**Never run `prisma db push` against production.** It bypasses migration history.

---

## 4. Rollback procedure

### 4.1 Code rollback (broken deploy)
1. In Vercel → Project → Deployments, find the previous good deployment.
2. Click the `⋯` menu → **Promote to Production**. Instant (~10s).
3. The previous deployment becomes live; the broken one remains in history for
   forensics.

### 4.2 Database rollback (bad migration)
1. **Stop the bleed:** promote the previous deployment (§4.1) so the new schema
   isn't being exercised.
2. **Restore Postgres from PITR:**
   - Supabase Dashboard → Project → Database → Backups.
   - Pick a restore point in time BEFORE the bad migration was applied.
   - Restore to a NEW database instance (Supabase does not overwrite the live DB
     for PITR; it creates a clone). Verify the clone, then repoint `DATABASE_URL`
     and `DIRECT_URL` in Vercel → Promote.
3. **Notify:** any leads captured between the bad migration and the restore are
   LOST. Recover from the audit log if possible (`AuditLog` records inserts in its
   `after` JSON column).

### 4.3 Storage rollback (broken upload)
- `src/lib/storage.ts` writes are immutable (filenames include `Date.now()` + 6-char
  random). Uploads never overwrite existing files. Rollback is N/A.
- For `deleteBlob` mistakes (admin deletes a media item): the DB row is the source
  of truth. Restore from Supabase Storage's per-bucket versioning if enabled, or
  re-upload from source.

---

## 5. Backup procedure

### 5.1 Database (automatic)
- **Provider:** Supabase daily PITR, 7-day retention on free tier (longer on Pro).
- **Verified by:** Supabase Dashboard → Project → Database → Backups → "PITR" enabled.
- **Manual snapshot before risky changes:**
  ```bash
  # Trigger a manual backup via Supabase CLI
  supabase db dump --data-only > backups/$(date +%Y%m%d-%H%M%S).sql
  ```
- **Restore:** see §4.2.

### 5.2 Storage (Supabase Storage)
- Supabase Storage does NOT auto-version by default. Enable per-bucket "File
  versioning" in Dashboard → Storage → bucket → Settings if you need upload
  history.
- For accidental deletes: re-upload from source (the canonical image files are
  committed in `/public/images/...` for hero/brand/apartments — uploaded media is
  the only category that lives exclusively in Storage).

### 5.3 Audit log (export)
- `AuditLog` is the forensic record. Export nightly:
  ```bash
  bunx prisma studio --schema=prisma/schema.postgres.prisma  # or pg_dump the table
  ```
- 24 action types, 8KB cap per `before`/`after` field (see `src/lib/audit.ts`).

---

## 6. Troubleshooting

| Symptom                                          | Likely cause                          | Fix                                                                          |
| ------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------- |
| Build fails in Vercel: `prisma generate` error   | `DATABASE_URL` not set in build env   | Set `DATABASE_URL` (pooled) in Vercel → Settings → Environment Variables     |
| Build fails: `cannot find module @prisma/client`  | `postinstall` hook didn't run          | Vercel caches `node_modules`; force a clean install via "Redeploy" → "use existing build cache: off" |
| Cold start 500s with "Missing required env var"  | `src/lib/env.ts` validation fired     | Check Vercel env var scope (Production vs Preview vs Development); ensure all required vars are set for the deployment's scope |
| Admin login returns 429 immediately              | Rate-limit lockout active (15 min)    | Wait 15 min, or temporarily lower `MAX_FAILED_BEFORE_LOCKOUT` for the affected IP — but better, fix the underlying issue (bad password / brute-force attempt) |
| Admin login 401 with valid creds                  | `ADMIN_SESSION_DRIVER` mismatch        | Verify `ADMIN_SESSION_DRIVER` is `db` (or unset, which defaults to `db` in prod); verify the `AdminSession` table exists (`migrate deploy` was run) |
| Upload returns 503 "Production deployment requires Supabase Storage" | `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` missing | Set both in Vercel → Settings → Environment Variables → Production scope |
| Upload returns 415 "magic bytes mismatch"        | File extension doesn't match content  | Re-export the image from source with the correct format; do NOT weaken `verifyMagicBytes` |
| Upload returns 413 "Fichier trop volumineux"      | File > 8 MB                            | Compress/resize the image (target: ≤ 2 MB JPEG for hero, ≤ 500 KB for gallery) |
| Public read endpoints return stale data           | `withPublicCache` 60s window            | Wait 60s, or purge the Vercel cache for the affected path (Vercel → Project → Settings → Edge Cache) |
| Lead submission silently returns 200 `duplicate:true` | Same phone within 5 min                | Expected behavior (idempotent dedup). Check `Lead` table for the existing row |
| Leads stop arriving                              | Possible rate-limit block OR client error | Check Vercel logs for `Lead submission failed` (logger.error); check `/api/leads` 429 rate; verify the LeadForm honeypot field is empty in real submissions |
| `prisma migrate deploy` fails with "P001: migration failed" | Schema drift                          | Restore from PITR (§4.2); fix the migration SQL; commit; re-run |
| Postgres connection limit exhausted              | Too many lambdas holding pooled conns   | Verify `DATABASE_URL` is the pooler URL (port 6543), not the direct URL (port 5432). Confirm Supabase plan's connection limit. |
| `AdminSession` table growing fast                | Pruning not happening                  | Verify `DRIVER=db` (in-memory Map doesn't prune the table); check `verifyAdminAuth` is called on protected routes (it triggers opportunistic prune). Manual: `DELETE FROM "AdminSession" WHERE "expiresAt" < NOW()` |

---

## 7. On-call playbook

### 7.1 "Leads stopped arriving"
1. Check Vercel → Project → Monitoring → error rate. Look for 5xx spikes on `/api/leads`.
2. Tail logs: filter `route = /api/leads`. Look for:
   - `Lead submission failed` (logger.error) → check the stack trace; usually a DB connection issue.
   - `Lead honeypot triggered` (logger.warn) → bots are flooding; consider enabling Cloudflare Turnstile.
   - `Lead duplicate` (logger.info) → check if the same phone is being retried; might be a client-side bug.
3. Verify `Lead` table insert path: `SELECT COUNT(*) FROM "Lead" WHERE "createdAt" > NOW() - INTERVAL '1 hour'`.
4. If zero inserts: check `DATABASE_URL` is reachable from Vercel (run `prisma migrate status` from a Vercel CLI shell).

### 7.2 "Admin login fails for everyone"
1. Check `/api/admin/login` error rate in Vercel.
2. If 429: lockout active. Wait 15 min OR temporarily restart isn't possible on Vercel — wait it out.
3. If 401 with valid creds: `AdminSession` table may not exist (migration missing). Run `prisma migrate status` and `migrate deploy` if needed.
4. If 500: check logs for "password verify error" — bcryptjs may have failed to load. Verify `node_modules/bcryptjs` is in the build (postinstall runs `prisma generate`; bcryptjs is a regular dep).
5. Last resort: bootstrap a new admin user via `ADMIN_BOOTSTRAP_PASSWORD=newpass bunx prisma db seed` (idempotent upsert).

### 7.3 "Uploads return 503"
1. Verify `NEXT_PUBLIC_SUPABASE_URL` AND `SUPABASE_SERVICE_ROLE_KEY` are both set in Vercel → Settings → Environment Variables → Production scope.
2. Verify the `media` bucket exists in Supabase Storage.
3. Verify the service_role key has not been rotated (Supabase → Settings → API → service_role).
4. Tail logs for `[storage] Supabase upload failed:` — the Supabase error message follows the colon.

### 7.4 "Public site is slow"
1. Check Vercel → Monitoring → function duration for `/api/projects`, `/api/apartments`, `/api/stats`.
2. If duration > 1s: cold starts are spiking. Confirm `vercel.json` regions = `["cdg1"]` (single region → fewer cold starts).
3. Verify `withPublicCache` is applied (response header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`).
4. Check Supabase → Database → Query Performance for slow queries; add indexes if missing.

### 7.5 "Audit log shows suspicious admin actions"
1. Query `AuditLog` for the suspicious actor:
   ```sql
   SELECT * FROM "AuditLog" WHERE "actorEmail" = 'suspect@...' ORDER BY "createdAt" DESC LIMIT 100;
   ```
2. Force-logout all their sessions:
   ```sql
   UPDATE "AdminSession" SET "revokedAt" = NOW() WHERE "userId" = (SELECT id FROM "AdminUser" WHERE email = 'suspect@...');
   ```
3. Deactivate the user:
   ```sql
   UPDATE "AdminUser" SET "active" = false WHERE email = 'suspect@...';
   ```
4. Review every `before`/`after` diff in their audit entries; revert any malicious mutations.

---

## 8. Contact

- **Primary:** project lead (see internal org chart).
- **Escalation:** Supabase support (status.supabase.com), Vercel support
  (vercel.com/support), and the on-call rotation for incidents lasting > 30 min.
