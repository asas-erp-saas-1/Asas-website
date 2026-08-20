import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';

/**
 * GET /api/admin/audit
 * List audit log entries. Auth required (any admin role can read).
 *
 * Query params:
 *   - action   : filter by action (e.g. PRICE_CHANGE, LOGIN_FAILED)
 *   - actorEmail : filter by actor
 *   - entityType : filter by entity type
 *   - entityId  : filter by entity id
 *   - limit    : default 100, max 500
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const actorEmail = searchParams.get('actorEmail');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10) || 100, 500);

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (actorEmail) where.actorEmail = actorEmail;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const entries = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return withSecurityHeaders(NextResponse.json({ data: entries, total: entries.length }));
  } catch (error) {
    console.error('[API /admin/audit] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec du chargement' }, { status: 500 }));
  }
}
