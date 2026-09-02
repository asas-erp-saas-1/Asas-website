-- Reconcile the live PostgreSQL login rate-limit column with the Prisma PostgreSQL contract.
-- Safe/idempotent: environments created from 0002 already have "lockedUntil";
-- older drifted environments may still have snake_case locked_until.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'login_rate_limits'
      AND column_name = 'locked_until'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'login_rate_limits'
      AND column_name = 'lockedUntil'
  ) THEN
    ALTER TABLE public.login_rate_limits
      RENAME COLUMN locked_until TO "lockedUntil";
  END IF;
END $$;
