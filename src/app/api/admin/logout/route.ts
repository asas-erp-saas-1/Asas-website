import { NextRequest, NextResponse } from 'next/server';
import { revokeAdminSession } from '@/lib/admin-auth';
import { withSecurityHeaders } from '@/lib/with-security-headers';

/**
 * POST /api/admin/logout
 * Clear the admin session cookie and revoke the session.
 */
export async function POST(request: NextRequest) {
  try {
    // Extract the current session token to revoke it server-side
    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/(?:^|;\s*)admin-session=([^;]*)/);
    if (match) {
      await revokeAdminSession(match[1]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return withSecurityHeaders(response);
  } catch (error) {
    console.error('[API /admin/logout] POST error:', error instanceof Error ? error.message : error);
    return withSecurityHeaders(NextResponse.json(
      { error: 'Échec de la déconnexion' },
      { status: 500 }
    ));
  }
}
