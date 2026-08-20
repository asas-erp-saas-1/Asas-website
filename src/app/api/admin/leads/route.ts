import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/leads
 * List leads with pagination and filters
 *
 * Query params:
 *   status    – filter by status (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
 *   intent    – filter by intent
 *   source    – filter by source
 *   page      – page number (default 1)
 *   limit     – items per page (default 20, max 100)
 *   sortBy    – sort field (default: createdAt)
 *   sortOrder – sort order (default: desc)
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const { searchParams } = request.nextUrl;

    const status = searchParams.get('status') ?? undefined;
    const intent = searchParams.get('intent') ?? undefined;
    const source = searchParams.get('source') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const sortBy = searchParams.get('sortBy') ?? 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (intent) where.intent = intent;
    if (source) where.source = source;

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return withSecurityHeaders(NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }));
  } catch (error) {
    console.error('[API /admin/leads] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    ));
  }
}
