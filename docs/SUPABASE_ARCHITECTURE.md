# SUPABASE_ARCHITECTURE.md — Project Configuration Blueprint

> Supabase project architecture for ASAS production deployment.

## 1. Supabase Project Configuration

| Setting | Value | Notes |
|---|---|---|
| Project name | `asas-immobilier` | |
| Database | PostgreSQL 15+ | Supabase managed |
| Region | `eu-central-1` (Frankfurt) | Closest to Algeria |
| Database plan | Pro (for daily backups) | Free tier = 7-day pause |
| Auth | Email/password | bcrypt-compatible |
| Storage | `renders`, `plans`, `gallery` buckets | 3 buckets |
| API URL | `https://xxx.supabase.co` | |
| Anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe for browser |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` | SERVER-ONLY |

## 2. Auth Configuration

- Email/password authentication
- Custom JWT claim: `role` = ADMIN/EDITOR/VIEWER
- Session duration: 8 hours
- Password hashing: bcrypt (compatible with existing AdminUser.passwordHash)
- Email confirmation: disabled (admin accounts created by ADMIN)

## 3. Storage Buckets

| Bucket | Public | Purpose | MIME types |
|---|---|---|---|
| `renders` | Yes (read) | Project hero, gallery, renders | image/jpeg, image/png, image/webp, image/avif |
| `plans` | Yes (read) | Floor plans, furnished plans | image/jpeg, image/png, image/webp, application/pdf |
| `gallery` | Yes (read) | Interior/exterior photos | image/jpeg, image/png, image/webp |
| `videos` | Yes (read) | Uploaded MP4 files | video/mp4 |
| `documents` | Yes (read) | Brochures | application/pdf |

## 4. Connection Strategy

### Client-side (browser):
- Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase JS client (`@supabase/supabase-js`)
- RLS policies enforce access control

### Server-side (API routes):
- Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Direct Prisma connection via `DATABASE_URL` (connection pooling)
- Service role key for audit log insertion + admin operations

## 5. Connection Pooling

Supabase provides PgBouncer connection pooling:
- **Pool URL**: `postgresql://...@db.xxx.supabase.co:6543/postgres` (pooled, for app)
- **Direct URL**: `postgresql://...@db.xxx.supabase.co:5432/postgres` (direct, for migrations)

Set in `.env`:
```
DATABASE_URL=postgresql://...@db.xxx.supabase.co:6543/postgres  # pooled
DIRECT_URL=postgresql://...@db.xxx.supabase.co:5432/postgres    # direct
```
