import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';

const idSchema = z.string().trim().min(1).max(100);
const updateSchema = z.object({
  projectId: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  nameAr: z.string().trim().max(200).nullable().optional(),
  code: z.string().trim().min(1).max(100).optional(),
  floors: z.coerce.number().int().min(1).max(200).optional(),
  hasElevator: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(100000).optional(),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
}).strict();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminAuth(request))) return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  const id = idSchema.safeParse((await params).id);
  if (!id.success) return withSecurityHeaders(NextResponse.json({ error: 'Identifiant de bâtiment invalide' }, { status: 400 }));
  try {
    const building = await db.building.findUnique({
      where: { id: id.data },
      include: {
        project: { select: { id: true, slug: true, name: true } },
        _count: { select: { apartments: true } },
        apartments: { select: { id: true, slug: true, apartmentNumber: true, unitNumber: true, type: true, status: true, published: true }, orderBy: { apartmentNumber: 'asc' }, take: 100 },
      },
    });
    if (!building) return withSecurityHeaders(NextResponse.json({ error: 'Bâtiment introuvable' }, { status: 404 }));
    return withSecurityHeaders(NextResponse.json({ data: { id: building.id, slug: building.slug, name: building.name, nameAr: building.nameAr, code: building.code, floors: building.floors, hasElevator: building.hasElevator, order: building.order, project: building.project, apartmentCount: building._count.apartments, apartments: building.apartments } }));
  } catch (error) {
    console.error('[API /admin/buildings/[id]] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch building' }, { status: 500 }));
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminAuth(request);
  if (!session) return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  if (!sessionHasRole(session, ['ADMIN', 'EDITOR'])) return withSecurityHeaders(NextResponse.json({ error: 'Privilèges insuffisants.' }, { status: 403 }));
  const id = idSchema.safeParse((await params).id);
  if (!id.success) return withSecurityHeaders(NextResponse.json({ error: 'Identifiant de bâtiment invalide' }, { status: 400 }));
  try {
    const body = updateSchema.safeParse(await request.json());
    if (!body.success) return withSecurityHeaders(NextResponse.json({ error: 'Données de bâtiment invalides' }, { status: 400 }));
    if (Object.keys(body.data).length === 0) return withSecurityHeaders(NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 }));
    const existing = await db.building.findUnique({ where: { id: id.data }, select: { id: true, slug: true, projectId: true, name: true, nameAr: true, code: true, floors: true, hasElevator: true, order: true } });
    if (!existing) return withSecurityHeaders(NextResponse.json({ error: 'Bâtiment introuvable' }, { status: 404 }));
    if (body.data.projectId && !(await db.project.findUnique({ where: { id: body.data.projectId }, select: { id: true } }))) return withSecurityHeaders(NextResponse.json({ error: 'Projet introuvable' }, { status: 404 }));
    if (body.data.slug && body.data.slug !== existing.slug) {
      const conflict = await db.building.findUnique({ where: { slug: body.data.slug }, select: { id: true } });
      if (conflict && conflict.id !== existing.id) return withSecurityHeaders(NextResponse.json({ error: 'Un bâtiment avec ce slug existe déjà' }, { status: 409 }));
    }
    const building = await db.building.update({ where: { id: existing.id }, data: body.data });
    await logAudit({ request, session, action: 'UPDATE_BUILDING', entityType: 'Building', entityId: building.id, entitySlug: building.slug, before: existing, after: body.data });
    return withSecurityHeaders(NextResponse.json({ data: building }));
  } catch (error) {
    console.error('[API /admin/buildings/[id]] PATCH error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update building' }, { status: 500 }));
  }
}
