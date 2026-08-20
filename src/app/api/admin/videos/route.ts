import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth, sessionHasRole } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

/**
 * GET /api/admin/videos
 *   Query: ?projectId=...&apartmentId=...
 *   Returns: { data: Video[] }
 *
 * POST /api/admin/videos
 *   Body: { projectId?, apartmentId?, url?, title, description?, type?, thumbnailUrl?, featured? }
 *   Admin-only.
 */

const videoSchema = z.object({
  projectId: z.string().optional().nullable(),
  apartmentId: z.string().optional().nullable(),
  url: z.string().url().optional().nullable(),
  storagePath: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional().nullable(),
  type: z.enum(['HERO', 'GALLERY', 'WALKTHROUGH', 'INTERVIEW']).optional().default('GALLERY'),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
}).refine(v => v.projectId || v.apartmentId, {
  message: 'Au moins un projectId ou apartmentId est requis',
});

export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const apartmentId = searchParams.get('apartmentId');

  const where: { projectId?: string; apartmentId?: string } = {};
  if (projectId) where.projectId = projectId;
  if (apartmentId) where.apartmentId = apartmentId;

  const data = await db.video.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
  return withSecurityHeaders(NextResponse.json({ data }));
}

export async function POST(request: NextRequest) {
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
  try {
    const body = await request.json();
    const parsed = videoSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      ));
    }
    const data = parsed.data;
    const video = await db.video.create({
      data: {
        projectId: data.projectId || null,
        apartmentId: data.apartmentId || null,
        url: data.url || null,
        storagePath: data.storagePath || null,
        thumbnailUrl: data.thumbnailUrl || null,
        title: data.title,
        description: data.description || null,
        type: data.type,
        featured: data.featured,
        published: data.published,
      },
    });
    await logAudit({
      request, session,
      action: 'CREATE_VIDEO',
      entityType: 'Video',
      entityId: video.id,
      entitySlug: video.url ?? undefined,
      before: null,
      after: { title: video.title, projectId: video.projectId, apartmentId: video.apartmentId, type: video.type },
    });
    return withSecurityHeaders(NextResponse.json({ success: true, data: video }, { status: 201 }));
  } catch (error) {
    console.error('[API /admin/videos] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Échec de création' }, { status: 500 }));
  }
}
