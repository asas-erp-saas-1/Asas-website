import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

/**
 * Valid apartment statuses
 */
const VALID_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'COMING_SOON', 'OFF_MARKET', 'DRAFT'] as const;

/**
 * Valid status transitions (from → allowed to states)
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['AVAILABLE', 'COMING_SOON', 'OFF_MARKET'],
  COMING_SOON: ['AVAILABLE', 'OFF_MARKET'],
  AVAILABLE: ['RESERVED', 'SOLD', 'OFF_MARKET'],
  RESERVED: ['AVAILABLE', 'SOLD', 'OFF_MARKET'],
  SOLD: ['OFF_MARKET'], // Sold can only go off market
  OFF_MARKET: ['AVAILABLE', 'COMING_SOON', 'DRAFT'],
};

/**
 * PUT /api/admin/apartments/[slug]/status
 * Change apartment status with transition validation
 *
 * Authorization: ADMIN or EDITOR. VIEWER cannot mutate status.
 * Audit-logged as UPDATE_APARTMENT_STATUS with before/after diff.
 *
 * Body: { status: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' },
      { status: 403 },
    ));
  }
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!body.status) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      ));
    }

    // Validate the target status
    if (!VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
      return withSecurityHeaders(NextResponse.json(
        { error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      ));
    }

    const apartment = await db.apartment.findUnique({ where: { slug } });
    if (!apartment) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      ));
    }

    // Validate transition
    const currentStatus = apartment.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(body.status)) {
      return withSecurityHeaders(NextResponse.json(
        {
          error: `Invalid status transition: ${currentStatus} → ${body.status}`,
          currentStatus,
          allowedTransitions,
        },
        { status: 400 }
      ));
    }

    const updated = await db.apartment.update({
      where: { slug },
      data: { status: body.status },
    });

    // Audit log the status transition (with before/after).
    await logAudit({
      request,
      session,
      action: 'UPDATE_APARTMENT_STATUS',
      entityType: 'Apartment',
      entityId: apartment.id,
      entitySlug: apartment.slug,
      before: { status: currentStatus },
      after: { status: body.status },
    });

    return withSecurityHeaders(NextResponse.json({ data: updated }));
  } catch (error) {
    console.error('[API /admin/apartments/[slug]/status] PUT error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to update apartment status' },
      { status: 500 }
    ));
  }
}
