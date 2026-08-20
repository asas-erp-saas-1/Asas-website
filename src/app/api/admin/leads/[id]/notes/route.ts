import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

/**
 * /api/admin/leads/[id]/notes
 *
 * GET  — list notes for a lead (admin role required).
 * POST — add a new note. ADMIN + EDITOR only (VIEWER cannot add notes).
 *
 * Body for POST: { body: string }
 */

const noteSchema = z.object({
  body: z.string().min(1, 'Le contenu de la note est requis'),
});

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  const { id } = await params;
  try {
    // Verify lead exists
    const lead = await db.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) {
      return withSecurityHeaders(NextResponse.json({ error: 'Lead introuvable' }, { status: 404 }));
    }
    const notes = await db.leadNote.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });
    return withSecurityHeaders(NextResponse.json({ data: notes }));
  } catch (error) {
    console.error('[API /admin/leads/[id]/notes] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec du chargement' }, { status: 500 }));
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      ));
    }

    // Verify lead exists
    const lead = await db.lead.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!lead) {
      return withSecurityHeaders(NextResponse.json({ error: 'Lead introuvable' }, { status: 404 }));
    }

    const note = await db.leadNote.create({
      data: {
        leadId: id,
        authorEmail: session.email,
        body: parsed.data.body,
      },
    });

    // Audit log
    await logAudit({
      request, session,
      action: 'CREATE_LEAD_NOTE',
      entityType: 'Lead',
      entityId: lead.id,
      entitySlug: lead.name,
      after: { noteId: note.id, body: note.body },
    });

    return withSecurityHeaders(NextResponse.json({ success: true, data: note }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/leads/[id]/notes] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de création' }, { status: 500 }));
  }
}
