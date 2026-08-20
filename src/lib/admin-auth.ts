/**
 * Admin authentication — DB-backed, role-aware session auth.
 *
 * Session drivers:
 *   • 'db'     (production) — sessions persist in the AdminSession table.
 *     Multi-instance safe (Vercel serverless scales lambdas, and any
 *     lambda can verify any session). Adds one DB round-trip per
 *     protected request — acceptable for an admin CMS.
 *   • 'memory' (development) — sessions live in an in-memory Map.
 *     Zero DB round-trips per request. NOT safe for multi-instance.
 *
 * The driver is selected via the ADMIN_SESSION_DRIVER env var, defaulting
 * to 'memory' in dev and 'db' in production.
 *
 * Roles:
 *   ADMIN   — full access (CRUD on projects, apartments, media, leads, users, settings)
 *   EDITOR  — create/edit projects, apartments, media; cannot delete or manage users
 *   VIEWER  — read-only access to admin data
 *
 * Password verification uses bcryptjs (pure-JS, runtime-agnostic).
 * The legacy ADMIN_PASSWORD env fallback is DISABLED — all auth MUST go
 * through the database.
 */
import bcrypt from 'bcryptjs';
import { db } from './db';
import { env } from './env';

export type AdminRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface AdminSession {
  token: string;
  email: string;
  name: string;
  role: AdminRole;
  userId: string;
  expiresAt: number; // epoch ms
}

// ─── Driver selection ────────────────────────────────────────────────────
const SESSION_TTL_MS = env.ADMIN_SESSION_TTL_MS;
const DRIVER: 'db' | 'memory' =
  (process.env.ADMIN_SESSION_DRIVER as 'db' | 'memory' | undefined) ??
  (env.isProduction ? 'db' : 'memory');

// ─── In-memory session store (dev only) ──────────────────────────────────
const sessions: Map<string, AdminSession> = new Map();

function pruneExpiredMemory(): void {
  const now = Date.now();
  for (const [token, s] of sessions) {
    if (s.expiresAt <= now) sessions.delete(token);
  }
}

async function pruneExpiredDb(): Promise<void> {
  try {
    await db.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch {
    /* best-effort — don't fail auth on prune error */
  }
}

/** Create a new session for an authenticated admin user. */
export async function createAdminSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_TTL_MS;

  if (DRIVER === 'db') {
    await db.adminSession.create({
      data: {
        token,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        expiresAt: new Date(expiresAt),
      },
    });
  } else {
    pruneExpiredMemory();
    sessions.set(token, {
      token,
      email: user.email,
      name: user.name,
      role: user.role as AdminRole,
      userId: user.id,
      expiresAt,
    });
  }
  return token;
}

/** Revoke a session (logout). Best-effort. */
export async function revokeAdminSession(token: string): Promise<void> {
  if (DRIVER === 'db') {
    try {
      await db.adminSession.updateMany({
        where: { token },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* best-effort */
    }
  } else {
    sessions.delete(token);
  }
}

/**
 * Verify the session token from a request cookie. Returns the session or null.
 *
 * In production ('db' driver) this queries the AdminSession table.
 * In dev ('memory' driver) it reads from the in-memory Map.
 */
export async function verifyAdminAuth(request: Request): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)admin-session=([^;]*)/);
  if (!match) return null;
  const token = match[1];

  if (DRIVER === 'db') {
    // Opportunistic prune of expired sessions.
    await pruneExpiredDb();
    const row = await db.adminSession.findUnique({ where: { token } });
    if (!row) return null;
    if (row.revokedAt) return null;
    if (row.expiresAt.getTime() <= Date.now()) {
      try { await db.adminSession.delete({ where: { id: row.id } }); } catch { /* best-effort */ }
      return null;
    }
    return {
      token: row.token,
      email: row.email,
      name: row.name,
      role: row.role as AdminRole,
      userId: row.userId,
      expiresAt: row.expiresAt.getTime(),
    };
  }

  // Memory driver
  pruneExpiredMemory();
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return s;
}

/**
 * Backwards-compatible sync wrapper for routes that imported the old sync
 * verifyAdminAuth (which used the in-memory Map). Routes that still call
 * `verifyAdminAuth(request)` synchronously will get a Promise here; they
 * should await it. Most admin routes have been updated to await.
 *
 * To preserve runtime behavior in dev, we expose the memory-backed sync
 * verifier under a different name for any legacy callers that need it.
 */
export function verifyAdminAuthSync(request: Request): AdminSession | null {
  if (DRIVER !== 'memory') {
    throw new Error(
      '[admin-auth] Sync verifier cannot be used with the DB driver. ' +
      'Use `await verifyAdminAuth(request)` instead.',
    );
  }
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)admin-session=([^;]*)/);
  if (!match) return null;
  const token = match[1];
  pruneExpiredMemory();
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return s;
}

/**
 * Authenticate an admin login attempt by verifying email + password against
 * the DB. Returns the new session token + user info on success, or null on
 * failure.
 */
export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: string; email: string; name: string; role: AdminRole } } | null> {
  if (!email || !password) return null;

  const user = await db.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, name: true, role: true, passwordHash: true, active: true },
  });

  if (!user) return null;
  if (!user.active) return null;
  if (user.role !== 'ADMIN' && user.role !== 'EDITOR' && user.role !== 'VIEWER') return null;

  // Verify bcrypt password hash.
  let ok = false;
  try {
    ok = await bcrypt.compare(password, user.passwordHash);
  } catch (err) {
    console.error('[admin-auth] password verify error:', err);
    return null;
  }
  if (!ok) return null;

  const token = await createAdminSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role as AdminRole },
  };
}

/** Authorization helper — returns true if the session has at least one of the allowed roles. */
export function sessionHasRole(session: AdminSession | null, allowed: AdminRole[]): boolean {
  if (!session) return false;
  return allowed.includes(session.role);
}
