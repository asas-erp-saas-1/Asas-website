import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurityHeaders } from '@/lib/with-security-headers';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }

  try {
    const [totalProjects, totalApartments, availableCount, reservedCount, soldCount, totalLeads, newLeadsCount, intentRows] = await Promise.all([
      db.project.count({ where: { archived: false } }),
      db.apartment.count({ where: { archived: false } }),
      db.apartment.count({ where: { archived: false, status: { equals: 'AVAILABLE', mode: 'insensitive' } } }),
      db.apartment.count({ where: { archived: false, status: { equals: 'RESERVED', mode: 'insensitive' } } }),
      db.apartment.count({ where: { archived: false, status: { equals: 'SOLD', mode: 'insensitive' } } }),
      db.lead.count(),
      db.lead.count({ where: { status: { equals: 'NEW', mode: 'insensitive' } } }),
      db.lead.groupBy({ by: ['intent'], _count: { _all: true }, where: { intent: { not: null } } }),
    ]);

    const intentBreakdown = Object.fromEntries(
      intentRows.map((row) => [row.intent ?? 'UNKNOWN', row._count._all]),
    );

    return withSecurityHeaders(NextResponse.json({
      data: {
        totalProjects,
        totalApartments,
        availableCount,
        reservedCount,
        soldCount,
        totalLeads,
        newLeadsCount,
        intentBreakdown,
      },
    }));
  } catch (error) {
    console.error('[API /admin/dashboard/stats] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch admin dashboard stats' }, { status: 500 }));
  }
}
