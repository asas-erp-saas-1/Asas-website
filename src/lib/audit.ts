/**
 * Audit log helper — records admin mutations to the AuditLog table.
 *
 * Logs are best-effort: failures are caught + logged, but do not block
 * the original operation. This ensures audit logging never breaks
 * the actual user action.
 */
import { Prisma } from '@/generated/prisma-postgres';
import { db } from './db';
import type { AdminSession } from './admin-auth';

export interface AuditEntry {
  request?: Request;
  session?: AdminSession | null;
  action: string;
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Insert an audit log entry. Best-effort — never throws.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const ipAddress = entry.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? entry.request?.headers.get('x-real-ip') ?? null;
    const userAgent = entry.request?.headers.get('user-agent') ?? null;

    await db.auditLog.create({
      data: {
        actorEmail: entry.session?.email ?? null,
        actorRole: entry.session?.role ?? null,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        entitySlug: entry.entitySlug ?? null,
        // Prisma's nullable JSON fields require an explicit DbNull sentinel
        // for SQL NULL; JavaScript null is not accepted by generated Prisma types.
        before: entry.before !== undefined ? safeJson(entry.before) : Prisma.DbNull,
        after: entry.after !== undefined ? safeJson(entry.after) : Prisma.DbNull,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[audit] Failed to log audit entry:', err instanceof Error ? err.message : err);
  }
}

function safeJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  try {
    const serialized = JSON.stringify(value, (_k, v) =>
      typeof v === 'bigint' ? v.toString() : v,
    );
    if (serialized === undefined) return Prisma.JsonNull;
    return JSON.parse(serialized.slice(0, 8000)) as Prisma.InputJsonValue;
  } catch {
    return Prisma.JsonNull;
  }
}
