import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

/**
 * PATCH /api/admin/leads/[id]/status
 * Update a lead's status, assignedTo, and/or followUpDate.
 * VIEWER cannot mutate leads; ADMIN + EDITOR can.
 *
 * Body: { status?, assignedTo?, followUpDate? }
 *   - status: NEW, CONTACTED, QUALIFIED, VISIT, NEGOTIATION, SOLD, LOST
 *   - assignedTo: string (admin user email) or null
 *   - followUpDate: ISO date string or null
 */

const VALID_LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'VISIT', 'NEGOTIATION', 'SOLD', 'LOST'] as const;
type LeadStatus = (typeof VALID_LEAD_STATUSES)[number];

// Canonical pipeline: forward progression; LOST is reachable from any active stage.
// SOLD and LOST are terminal in the current data model; reopening is not supported.
const LEAD_STATUS_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ['NEW', 'CONTACTED', 'LOST'],
  CONTACTED: ['CONTACTED', 'QUALIFIED', 'LOST'],
  QUALIFIED: ['QUALIFIED', 'VISIT', 'LOST'],
  VISIT: ['VISIT', 'NEGOTIATION', 'LOST'],
  NEGOTIATION: ['NEGOTIATION', 'SOLD', 'LOST'],
  SOLD: ['SOLD'],
  LOST: ['LOST'],
};

const updateSchema = z.object({
  status: z.enum(VALID_LEAD_STATUSES).optional(),
  assignedTo: z.string().trim().min(1).nullable().optional(),
  followUpDate: z.string().datetime({ offset: true }).nullable().optional(),
});

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Privilèges insuffisants. Réservé aux administrateurs et éditeurs.' },
      { status: 403 }
    ));
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      ));
    }

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return withSecurityHeaders(NextResponse.json({ error: 'Lead introuvable' }, { status: 404 }));
    }

    if (parsed.data.status !== undefined) {
      const currentStatus = existing.status as LeadStatus;
      const allowedTargets = LEAD_STATUS_TRANSITIONS[currentStatus];
      if (!allowedTargets || !allowedTargets.includes(parsed.data.status)) {
        return withSecurityHeaders(NextResponse.json(
          { error: `Transition de statut non autorisée: ${existing.status} → ${parsed.data.status}` },
          { status: 409 }
        ));
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.assignedTo !== undefined) updateData.assignedTo = parsed.data.assignedTo || null;
    if (parsed.data.followUpDate !== undefined) {
      updateData.followUpDate = parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null;
    }

    const updated = await db.lead.update({ where: { id }, data: updateData });

    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) { before.status = existing.status; after.status = updated.status; }
    if (parsed.data.assignedTo !== undefined) { before.assignedTo = existing.assignedTo; after.assignedTo = updated.assignedTo; }
    if (parsed.data.followUpDate !== undefined) {
      before.followUpDate = existing.followUpDate;
      after.followUpDate = updated.followUpDate;
    }
    await logAudit({
      request, session,
      action: parsed.data.status !== undefined && parsed.data.status !== existing.status
        ? 'UPDATE_LEAD_STATUS'
        : 'UPDATE_LEAD',
      entityType: 'Lead',
      entityId: updated.id,
      entitySlug: existing.name,
      before: Object.keys(before).length ? before : undefined,
      after: Object.keys(after).length ? after : undefined,
    });

    return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
  } catch (error) {
    console.error('[API /admin/leads/[id]/status] PATCH error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de mise à jour' }, { status: 500 }));
  }
}
