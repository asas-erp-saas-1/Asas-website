# FINAL_DEPLOYMENT_GUIDE.md — ASAS Real Estate Platform

> **Final Deployment Guide — for DevOps engineer**

## 1. Prerequisites
- Supabase project (PostgreSQL + Auth + Storage)
- Vercel account
- Domain (asas.dz or similar)

## 2. Environment Variables
```env
DATABASE_URL=postgresql://...@supabase.co:6543/postgres
DIRECT_URL=postgresql://...@supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER in browser
NEXT_PUBLIC_SITE_URL=https://asas.dz
```

## 3. Database Setup
1. Update `prisma/schema.prisma` datasource to `postgresql`
2. Run `bun run db:push` (creates all tables)
3. Execute CHECK constraints SQL (from POSTGRESQL_ARCHITECTURE.md)
4. Execute RLS policies SQL (from SUPABASE_RLS_ARCHITECTURE.md)
5. Run `bun run db:seed` (imports 139 rows)
6. Verify row counts (from DATABASE_MIGRATION_PLAN.md)

## 4. Storage Setup
1. Create buckets: renders, plans, gallery, videos, documents
2. Apply storage RLS policies (from SUPABASE_RLS_ARCHITECTURE.md)
3. Upload local images to Supabase Storage
4. Update media URLs in database

## 5. App Router Migration (Phase 4 — after sandbox constraint lifted)
1. Create `src/app/projects/page.tsx`
2. Create `src/app/projects/[slug]/page.tsx` with `generateMetadata`
3. Create `src/app/projects/[slug]/apartments/[apartmentSlug]/page.tsx`
4. Remove hash router
5. Add legacy redirects (`/#/projects/...` → `/projects/...`)

## 6. Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables (from .env.production)
3. Deploy
4. Verify production URL
5. Submit sitemap to Google Search Console

## 7. Post-Deployment Verification
1. Test homepage, projects, apartment detail
2. Test admin login + CRUD operations
3. Test media upload + replace
4. Test lead submission
5. Run Red Team (54 tests from FINAL_RED_TEAM_REPORT.md)
6. Verify mobile at 7 viewports
7. Set up Vercel Analytics + Sentry for error tracking

## 8. Rollback Strategy
1. Revert Prisma schema to SQLite
2. Restore DATABASE_URL to SQLite path
3. Restore SQLite backup
4. Restart dev server
