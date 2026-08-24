import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

const VALID_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'COMING_SOON', 'OFF_MARKET', 'DRAFT'] as const;

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['AVAILABLE', 'COMING_SOON', 'OFF_MARKET'],
  COMING_SOON: ['AVAILABLE', 'OFF_MARKET'],
  AVAILABLE: ['RESERVED', 'SOLD', 'OFF_MARKET'],
  RESERVED: ['AVAILABLE', 'SOLD', 'OFF_MARKET'],
  SOLD: ['OFF_MARKET'],
  OFF_MARKET: ['AVAILABLE', 'COMING_SOON', 'DRAFT'],
};

/** PUT /api/admin/apartments/[slug]/status */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' }, { status: 403 }));
  }

  try {
    const { slug } = await params;
    const body = await request.json();

    if (!body.status) {
      return withSecurityHeaders(NextResponse.json({ error: 'Missing required field: status' }, { status: 400 }));
    }
    const requestedStatus = String(body.status).toUpperCase();
    if (!VALID_STATUSES.includes(requestedStatus as typeof VALID_STATUSES[number])) {
      return withSecurityHeaders(NextResponse.json({ error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` }, { status: 400 }));
    }

    // Apartment slugs are unique only within a project. Resolve the record
    // first, then mutate by stable primary key to avoid assuming global slug uniqueness.
    const apartment = await db.apartment.findFirst({ where: { slug } });
    if (!apartment) {
      return withSecurityHeaders(NextResponse.json({ error: 'Apartment not found' }, { status: 404 }));
    }

    // Production historically contains both lowercase and uppercase status values.
    // Normalize for the state machine while preserving the existing stored value unless
    // a transition is explicitly requested.
    const currentStatus = apartment.status.toUpperCase();
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowedTransitions.includes(requestedStatus)) {
      return withSecurityHeaders(NextResponse.json({ error: `Invalid status transition: ${currentStatus} → ${requestedStatus}`, currentStatus, allowedTransitions }, { status: 400 }));
    }

    const updated = await db.apartment.update({ where: { id: apartment.id }, data: { status: requestedStatus } });

    await logAudit({
      request,
      session,
      action: 'UPDATE_APARTMENT_STATUS',
      entityType: 'Apartment',
      entityId: apartment.id,
      entitySlug: apartment.slug,
      before: { status: apartment.status },
      after: { status: requestedStatus },
    });

    return withSecurityHeaders(NextResponse.json({ data: updated }));
  } catch (error) {
    console.error('[API /admin/apartments/[slug]/status] PUT error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update apartment status' }, { status: 500 }));
  }
}