# ASAS — Production Deployment Runbook

> Honest, step-by-step runbook for shipping ASAS Real Estate to
> **GitHub → Vercel → Supabase (PostgreSQL + Storage)**.

This document supersedes any prior `FINAL_DEPLOYMENT_GUIDE.md` or
`FINAL_PRODUCTION_REPORT.md`. It reflects the actual repository state
after the Phase 4 forensic audit and remediation.

---

## 0. Prerequisites

- A GitHub account (free is fine).
- A Vercel account (free tier works for the first deploy).
- A Supabase account (free tier is enough for launch).
- Bun 1.x installed locally.
- The production domain (e.g. `asas.dz`) — optional, can be added post-launch.

---

## 1. Create the Supabase project

1. Sign in to <https://supabase.com>, click **New project**.
2. Pick a name (`asas-production`), a strong DB password, and a region close
   to your users (e.g. `eu-central-1` for North-Africa/Europe traffic).
3. Wait ~2 minutes for provisioning to complete.
4. Go to **Project Settings → Database → Connection string**.
   Copy TWO URLs:
   - **Transaction pooler** (`…pooler.supabase.com:6543/postgres`) — used as
     `DATABASE_URL` for runtime queries.
   - **Session** / direct (`…supabase.com:5432/postgres`) — used as
     `DIRECT_URL` for Prisma migrations.
5. Go to **Storage → Create a new bucket** named `media`. Set it public
   (read public, write via service-role only).

---

## 2. Push the production schema to Supabase

From your local checkout (with `DATABASE_URL` and `DIRECT_URL` exported
in your shell or `.env`):

```bash
# Apply the PostgreSQL-native schema to Supabase.
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres \
DIRECT_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].supabase.com:5432/postgres \
bunx prisma db push --schema=prisma/schema.postgres.prisma

# (Optional, until a baseline migration exists) — once you have run db push
# once, create the baseline:
# bunx prisma migrate diff --from-schema-datasource prisma/schema.postgres.prisma \
#   --to-schema prisma/schema.postgres.prisma --script > prisma/migrations/0_init/migration.sql
```

Verify in Supabase Studio → **Table Editor** that all 14 tables exist:
`AdminUser`, `Apartment`, `ApartmentImage`, `AuditLog`, `Building`,
`Developer`, `Lead`, `LeadNote`, `NewsletterSubscription`,
`Project`, `ProjectAmenity`, `ProjectImage`, `SiteContent`, `Video`.

---

## 3. Migrate the seed/demo data (if you want to keep it)

If you want to ship the existing demo content (4 projects, 28 apartments,
admin user, 60 images, audit log) to production:

```bash
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres \
bun run scripts/migrate-to-postgres.ts
```

The script is idempotent — re-running it won't duplicate rows. It reports a
per-table row-count comparison at the end and exits non-zero on any mismatch.

If you want to start with a clean production database, run a fresh seed
against the production URL instead:

```bash
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres \
bunx prisma db seed
```

---

## 4. Configure Supabase Storage (for media uploads)

The production media pipeline writes to Supabase Storage instead of the local
filesystem. To enable this, the storage layer needs to be wired to Supabase
in `src/lib/storage.ts` (the file has clearly marked TODO comments showing
exactly which lines to swap — the `saveBlob`, `deleteBlob`, and
`getPublicUrl` functions each have a Supabase implementation sketched in
the comments).

After wiring, set these env vars in Vercel:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Project Settings → API → anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Project Settings → API → service_role — **server-only, never in browser**) |

The RLS policy on the `media` bucket should be:
- **SELECT:** `true` (public read)
- **INSERT / UPDATE / DELETE:** `auth.role() = 'service_role'`

---

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "Production-ready: ASAS Real Estate Platform"
git branch -M main
git remote add origin git@github.com:your-org/asas-real-estate.git
git push -u origin main
```

The `.gitignore` excludes:
- `node_modules/`
- `.next/` (build artifacts)
- `db/*.db` (the dev SQLite DB)
- `public/uploads/` (user-generated content)
- `.env` (secrets — only `.env.example` is committed)
- `tool-results/`, `qa-*.png`, `upload/`, `download/` (sandbox artifacts)

---

## 6. Deploy to Vercel

1. Go to <https://vercel.com/new>, import the GitHub repo.
2. Vercel auto-detects Next.js — keep the defaults.
3. **Add the environment variables** (Project Settings → Environment Variables):

   | Variable | Value | Environment |
   | --- | --- | --- |
   | `DATABASE_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres` | Production + Preview |
   | `DIRECT_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-[region].supabase.com:5432/postgres` | Production + Preview |
   | `NEXT_PUBLIC_SITE_URL` | `https://asas.dz` (your domain) | Production |
   | `ADMIN_SESSION_TTL` | `28800000` (8 hours) | All |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | All |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon public key) | All |
   | `SUPABASE_SERVICE_ROLE_KEY` | (service_role key) | Production + Preview |

4. Click **Deploy**. The build runs `prisma generate && next build`
   (per `vercel.json`), takes ~90 seconds, and ships to a
   `*.vercel.app` URL.
5. (Optional) Add your custom domain under Project Settings → Domains.

---

## 7. Smoke-test the production deployment

- [ ] `/` loads with the homepage (hero, projects, testimonials).
- [ ] `/api/projects` returns JSON.
- [ ] `/sitemap.xml` returns XML.
- [ ] `/robots.txt` returns text.
- [ ] `/#/admin` shows the login form.
- [ ] Login as `admin@asas.dz` / `admin123` → dashboard renders.
- [ ] Create a project (DRAFT) → publish → appears on `/api/projects`.
- [ ] Upload an image via the media tab → file appears in Supabase Storage.
- [ ] Log out → confirms session cleared.

---

## 8. Post-launch hardening (recommended)

- Change the `admin123` password immediately via the Users tab.
- Rotate the Supabase service_role key if it was leaked.
- Enable Vercel's DDoS protection (Pro plan).
- Add Sentry for runtime error monitoring.
- Set up a daily Supabase DB backup (PITR on Pro+).
- Move `ADMIN_SESSION_TTL` down to 4 hours if compliance requires.

---

## 9. Rollback

Vercel keeps every deployment immutable. To roll back:
1. Vercel Dashboard → Deployments → pick the last known-good deploy.
2. Click "…" → **Promote to Production**.

Database rollbacks require restoring the Supabase daily backup
(Project Settings → Database → Backups → Restore).
