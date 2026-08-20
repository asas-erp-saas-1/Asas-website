# ASAS — Vercel + Supabase Production Deployment

## 1. GitHub
Commit the project without `.env`, `db/*.db`, `node_modules`, `.next`, or generated clients.

## 2. Supabase
Create a PostgreSQL project and a Storage bucket named `media`.
For public project/apartment media, make `media` publicly readable.

Use:
- pooled connection (port 6543) as `DATABASE_URL`
- direct connection (port 5432) as `DIRECT_URL`

## 3. Local validation
```bash
bun install
bun run db:generate
bun run lint
bun run typecheck
bun run build
```

## 4. Production schema
From a trusted machine, with the production Supabase variables set:
```bash
bun run db:migrate:deploy:postgres
```

Do not run `prisma db push` against production.

## 5. Existing SQLite content
If `db/custom.db` contains the content you want to preserve:
```bash
bun run db:migrate:data
```
This migration is insert-only/idempotent by table. Verify counts in Supabase Studio.

## 6. Admin bootstrap
Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a strong `ADMIN_BOOTSTRAP_PASSWORD` temporarily, then:
```bash
bun run db:seed:postgres
```
Remove the bootstrap password from the environment after the account is created.

## 7. Vercel
Import the GitHub repository as a Next.js project.

Required production environment variables:
```text
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SESSION_TTL=28800000
ADMIN_SESSION_DRIVER=db
```

Vercel build command is already configured to generate the PostgreSQL Prisma client.

## 8. Critical security rules
- Never expose `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.
- Never commit `.env`.
- Never use the SQLite database as the production runtime database.
- Production media must use Supabase Storage; Vercel's filesystem is not persistent.
- Admin sessions and login rate limiting are database-backed and therefore work across serverless instances.
