/**
 * Production admin bootstrap for Supabase/PostgreSQL.
 *
 * This intentionally does NOT seed demo content. It creates or updates exactly
 * one admin account from ADMIN_EMAIL / ADMIN_NAME / ADMIN_BOOTSTRAP_PASSWORD.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com \
 *   ADMIN_NAME="ASAS Admin" \
 *   ADMIN_BOOTSTRAP_PASSWORD="long-random-password" \
 *   bun run db:seed:postgres
 */
import { PrismaClient } from '../src/generated/prisma-postgres';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[bootstrap] Missing ${name}`);
  return value;
}

async function main() {
  const email = required('ADMIN_EMAIL').toLowerCase();
  const name = required('ADMIN_NAME');
  const password = required('ADMIN_BOOTSTRAP_PASSWORD');

  if (password.length < 16) {
    throw new Error('[bootstrap] ADMIN_BOOTSTRAP_PASSWORD must be at least 16 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash, role: 'ADMIN', active: true },
    update: { name, passwordHash, role: 'ADMIN', active: true },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log(`[bootstrap] Admin ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error('[bootstrap] Failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
