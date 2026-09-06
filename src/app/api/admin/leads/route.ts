import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth } from '@/lib/admin-auth';
import type { Prisma } from '@/generated/prisma-postgres';
import { z } from 'zod';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const SORT_FIELDS = ['createdAt', 'name', 'status', 'intent', 'source'] as const;
const leadQuerySchema = z.object({
  status: z.string().trim().optional(),
  intent: z.string().trim().optional(),
  source: z.string().trim().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sortBy: z.enum(SORT_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
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
    const parsed = leadQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) return withSecurityHeaders(NextResponse.json({ error: 'Paramètres de requête invalides' }, { status: 400 }));
    const { status, intent, source, search = '', page, limit, sortBy, sortOrder } = parsed.data;

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
