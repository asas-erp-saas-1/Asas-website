# ASAS — GitHub → Vercel deployment

1. Create/open the repository `asas-erp-saas-1/Asas-website`.
2. Upload the CONTENTS of this folder to the branch
   `production/asas-vercel-supabase-ready`.
3. Do NOT upload `.env`, `.env.local`, database files, `node_modules`, or `.next`.
4. In Vercel, import the GitHub repository and select the production branch.
5. Add the required Supabase/Postgres environment variables in Vercel.
6. Deploy. Vercel should use the repository's package manager lockfile and run the configured build.
7. Verify the deployment before merging to `main`.

Required public variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Server-only secrets, when required:
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL
- DIRECT_URL
