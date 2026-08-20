# DATABASE_BACKUP_RECOVERY.md — ASAS Backup Strategy

> **Phase 3 Step 26 — Backup + Recovery**

## 1. Current State (SQLite)

### Backup
```bash
cp /home/z/my-project/db/custom.db /backup/asas-$(date +%Y%m%d-%H%M%S).db
```

### Restore
```bash
cp /backup/asas-YYYYMMDD-HHMMSS.db /home/z/my-project/db/custom.db
```

### Backup frequency: Manual (before each migration or destructive operation)

## 2. Production Target (PostgreSQL/Supabase)

### Supabase-managed backups:
| Plan | Retention | PITR | Cost |
|---|---|---|---|
| Free | None (7-day pause) | No | $0 |
| Pro | 7 days | Yes (1-min precision) | $25/month |
| Team | 14 days | Yes | $25+/month |
| Enterprise | 30 days | Yes | Custom |

### Recommended: Pro plan
- 7-day automated daily backups
- Point-in-time recovery (rollback to any second)
- Daily automatic backups (no manual script needed)

### Manual backup script:
```bash
#!/bin/bash
# scripts/backup-prod.sh
DATE=$(date +%Y%m%d-%H%M%S)
pg_dump "$DATABASE_URL" | gzip > /backups/asas-prod-$DATE.sql.gz
# Keep last 30 backups
ls -t /backups/asas-prod-*.sql.gz | tail -n +31 | xargs rm -f
```

### Restore procedure:
```bash
# 1. Download backup from Supabase Dashboard OR
# 2. Restore from dump:
gunzip < /backups/asas-prod-YYYYMMDD.sql.gz | psql "$DATABASE_URL"

# 3. For PITR: use Supabase Dashboard → Database → Backups → Restore to timestamp
```

## 3. Media Backup

### Current (local files):
```bash
tar -czf /backups/asas-media-$(date +%Y%m%d).tar.gz public/uploads/ public/images/
```

### Production (Supabase Storage):
- Supabase provides automatic storage replication
- No manual backup needed for storage
- For extra safety: `supabase storage download --recursive`

## 4. Disaster Recovery

### Scenario: Database completely lost
1. Supabase Dashboard → restore from latest backup (max 7 days old)
2. Run `bun run db:push` to verify schema
3. Restart application
4. Verify row counts match expected (from DATABASE_MIGRATION_PLAN.md)

### Scenario: Media files lost
1. Supabase Storage → restore from backup
2. Verify all media URLs resolve (run `scripts/fix-image-urls.ts`)
3. Replace any permanently lost files

### Scenario: Application deployment fails
1. Vercel → Rollback to previous deployment
2. Database remains untouched (Vercel deploy doesn't affect DB)

## 5. Backup Schedule (production)

| Type | Frequency | Retention | Method |
|---|---|---|---|
| Database (automated) | Daily | 7 days | Supabase managed |
| Database (manual) | Before each migration | 30 days | `pg_dump` script |
| Media (automated) | Continuous | Unlimited | Supabase Storage replication |
| Media (manual) | Weekly | 4 weeks | `supabase storage download` |
| Full system | Before major version upgrades | 90 days | DB dump + media + code |

## 6. Sandbox Status

**Current**: SQLite single file. Manual backup only.
**Production target**: Supabase Pro with automated daily backups + PITR.

**The system must not depend on "we can recreate it."** Every production environment must have automated backups.
