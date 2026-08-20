import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';

/**
 * GET /api/admin/me
 * Returns the current admin session's user info, or 401 if not authenticated.
 * Used by the Admin UI to verify session on page load.
 */
export async function GET(request: NextRequest) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    ));
  }
  return withSecurityHeaders(NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
    expiresAt: session.expiresAt,
  }));
}
