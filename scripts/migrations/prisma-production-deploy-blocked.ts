/**
 * Temporary safety gate for Prisma production migrations.
 *
 * The repository currently contains multiple historical migration trees and the
 * PostgreSQL baseline has not yet been normalized. Failing closed prevents an
 * accidental `prisma migrate deploy` from executing the obsolete root history
 * against production.
 *
 * This file must be removed/replaced only after Phase 2 establishes one
 * deterministic migration path and verifies the baseline strategy.
 */

console.error(
  "Prisma production migrations are intentionally blocked until Phase 2 migration-path and baseline reconciliation is complete. " +
    "Do not run prisma migrate deploy against production yet."
);
process.exit(1);
