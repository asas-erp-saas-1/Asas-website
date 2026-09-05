import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';

export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return withSecurityHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }));
  }

  try {
    const [totalProjects, totalApartments, availableCount, reservedCount, soldCount, totalLeads, newLeadsCount] =
      await Promise.all([
        db.project.count({ where: { archived: false } }),
        db.apartment.count({ where: { archived: false } }),
        db.apartment.count({ where: { archived: false, status: 'AVAILABLE' } }),
        db.apartment.count({ where: { archived: false, status: 'RESERVED' } }),
        db.apartment.count({ where: { archived: false, status: 'SOLD' } }),
        db.lead.count(),
        db.lead.count({ where: { status: 'NEW' } }),
      ]);

    return withSecurityHeaders(NextResponse.json({
      data: {
        totalProjects,
        totalApartments,
        availableCount,
        reservedCount,
        soldCount,
        totalLeads,
        newLeadsCount,
      },
    }));
  } catch (error) {
    console.error('[API /admin/stats] GET error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(
      NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 }),
    );
  }
}
