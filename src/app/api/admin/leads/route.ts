import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth } from '@/lib/admin-auth';
import type { Prisma } from '@/generated/prisma-postgres';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const SORT_FIELDS = ['createdAt', 'name', 'status', 'intent', 'source'] as const;
type SortField = (typeof SORT_FIELDS)[number];
type SortOrder = Prisma.SortOrder;

/**
 * GET /api/admin/leads
 * Paginated lead catalogue with safe search, filters and deterministic sorting.
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
    const search = searchParams.get('search')?.trim() ?? '';
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
    const requestedSort = searchParams.get('sortBy') as SortField | null;
    const sortBy: SortField = requestedSort && SORT_FIELDS.includes(requestedSort) ? requestedSort : 'createdAt';
    const sortOrder: SortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Prisma.LeadWhereInput = {};
    if (status) where.status = status;
    if (intent) where.intent = intent;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { projectName: { contains: search, mode: 'insensitive' } },
        { apartmentName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy: Prisma.LeadOrderByWithRelationInput[] = sortBy === 'createdAt'
      ? [{ createdAt: sortOrder }, { id: 'desc' }]
      : [{ [sortBy]: sortOrder }, { createdAt: 'desc' }, { id: 'desc' }];

    const [leads, total] = await Promise.all([
      db.lead.findMany({ where, orderBy, skip, take: limit }),
      db.lead.count({ where }),
    ]);

    return withSecurityHeaders(NextResponse.json({
      data: leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    console.error('[API /admin/leads] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    ));
  }
}
