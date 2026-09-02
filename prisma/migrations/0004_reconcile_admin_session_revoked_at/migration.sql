-- Reconcile PostgreSQL admin session column with the Prisma schema contract.
-- Idempotent: only renames the legacy snake_case column when the Prisma-style
-- quoted identifier does not already exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_sessions'
      AND column_name = 'revoked_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_sessions'
      AND column_name = 'revokedAt'
  ) THEN
    ALTER TABLE public.admin_sessions RENAME COLUMN revoked_at TO "revokedAt";
  END IF;
END $$;
