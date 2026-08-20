/**
 * Audit log helper — records admin mutations to the AuditLog table.
 *
 * Usage pattern (in API routes):
 *
 *   import { logAudit } from '@/lib/audit';
 *   await logAudit({
 *     request,
 *     session,
 *     action: 'UPDATE_PROJECT',
 *     entityType: 'Project',
 *     entityId: project.id,
 *     entitySlug: project.slug,
 *     before: oldProject,
 *     after: updatedProject,
 *   });
 *
 * Logs are best-effort: failures are caught + logged, but do not block
 * the original operation. This ensures audit logging never breaks
 * the actual user action.
 */
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
        before: entry.before !== undefined ? safeStringify(entry.before) : null,
        after: entry.after !== undefined ? safeStringify(entry.after) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[audit] Failed to log audit entry:', err instanceof Error ? err.message : err);
  }
}

function safeStringify(value: unknown): string {
  try {
    // Avoid BigInt issues + circular references
    return JSON.stringify(value, (_k, v) =>
      typeof v === 'bigint' ? v.toString() : v
    , 0).slice(0, 8000); // Cap at 8KB per entry
  } catch {
    return '[unserializable]';
  }
}
