# PRODUCTION_ENVIRONMENT.md — Environment Configuration

> **Phase 3 Step 25 — Production Environment Variables**

## 1. Environment Variables

### Development (current — `.env`)
```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

### Production target (`.env.production`)
```env
# Database (Supabase PostgreSQL — pooled connection)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Direct connection (for migrations)
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].supabase.com:5432/postgres

# Supabase (public — safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (SERVER-ONLY — NEVER in browser, NEVER NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL (for canonical URLs, sitemap)
NEXT_PUBLIC_SITE_URL=https://asas.dz

# Auth
ADMIN_SESSION_TTL=28800000  # 8 hours in milliseconds
```

## 2. Variable Classification

| Variable | Prefix | Exposed to Browser? | Purpose |
|---|---|---|---|
| DATABASE_URL | None | ❌ No | Server-only DB connection |
| DIRECT_URL | None | ❌ No | Server-only migration connection |
| NEXT_PUBLIC_SUPABASE_URL | NEXT_PUBLIC_ | ✅ Yes | Supabase API URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | NEXT_PUBLIC_ | ✅ Yes | Public anon key (RLS-protected) |
| SUPABASE_SERVICE_ROLE_KEY | None | ❌ NO! | Bypasses RLS — server-only |
| NEXT_PUBLIC_SITE_URL | NEXT_PUBLIC_ | ✅ Yes | Canonical URL base |

## 3. Secret Management Rules

1. **NEVER** put `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*`
2. **NEVER** commit `.env.local` or `.env.production` to Git
3. **NEVER** log secrets to console
4. **NEVER** hardcode secrets in source code
5. `.env.example` should contain placeholder values only (no real keys)

## 4. `.env.example` (for new developers)

```env
# Database
DATABASE_URL=file:./db/custom.db

# Supabase (optional — for production)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Auth
ADMIN_SESSION_TTL=28800000
```

## 5. Vercel Environment Variables

When deploying to Vercel, set in the Vercel dashboard:

| Scope | Variables |
|---|---|
| Production | DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL |
| Preview | Same as production (but separate Supabase project recommended) |
| Development | DATABASE_URL=file:./db/custom.db |

## 6. Backup Configuration

### Supabase PostgreSQL backups:
- **Automatic daily backups** (Pro plan — 7-day retention)
- **Point-in-time recovery** (PITR — Pro plan, 1-minute precision)
- **Manual backup**: `pg_dump` via Supabase SQL editor or CLI

### Media file backups:
- **Supabase Storage**: automatic replication
- **Local backup**: `rsync` or `tar` of `/public/uploads/` directory

### Full system backup:
```bash
#!/bin/bash
# backup-asas.sh
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/backups/asas-$DATE

# 1. Database dump
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db.sql"

# 2. Media files
rsync -a /public/uploads/ "$BACKUP_DIR/uploads/"

# 3. Compress
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "Backup: $BACKUP_DIR.tar.gz"
```

## 7. Recovery Strategy

### Database recovery (from Supabase backup):
1. Supabase Dashboard → Database → Backups
2. Select backup date
3. Click "Restore"
4. Verify application works against restored database

### Database recovery (from pg_dump):
```bash
# Restore from dump
psql "$DATABASE_URL" < backup.sql
```

### Media recovery:
```bash
# Restore uploads from backup
rsync -a /backups/asas-YYYYMMDD/uploads/ /public/uploads/
```

### Migration rollback:
1. Revert `prisma/schema.prisma` datasource to `sqlite`
2. Restore `DATABASE_URL` to SQLite path
3. Restore SQLite backup: `cp /backup/custom-*.db db/custom.db`
4. Restart dev server

## 8. Monitoring

### Database:
- Supabase Dashboard → Database → Health
- Monitor: connection count, query time, table size, index usage

### Application:
- Vercel Analytics (if deployed)
- Console logs via `dev.log`
- Error tracking: Sentry (recommended for production)

### Alerts:
- Supabase: set up email alerts for database issues
- Vercel: set up deployment failure alerts
