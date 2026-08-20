import { NextResponse } from 'next/server';

/**
 * Apply security headers to every API response.
 * Centralised here so all routes use the same set.
 *
 * Sets `Cache-Control: no-store` because the default applies to admin /
 * mutation routes where caching is unsafe.
 *
 * For public read-only endpoints that benefit from CDN caching, use
 * `withPublicCache` instead — it allows short CDN caching with background
 * revalidation so availability changes propagate within ~60 seconds.
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

/**
 * Apply CDN-friendly caching to public read endpoints.
 *
 * Cache strategy (directive §32):
 *   s-maxage=60          — CDN serves the cached response for up to 60s.
 *   stale-while-revalidate=300 — after 60s, CDN serves stale + refreshes in
 *                              the background for up to 5 more minutes.
 *
 * Why this matters for apartment availability (directive §33):
 *   When an admin flips an apartment to SOLD, the public API must reflect
 *   this within ~60 seconds — not immediately, but not stale-forever
 *   either. This 60s window is the right tradeoff: it absorbs traffic
 *   spikes (10x faster responses on cache hits) while keeping availability
 *   data fresh enough that customers don't book already-sold units.
 *
 * Mutation routes (POST/PATCH/DELETE) MUST NOT use this — they always use
 * `withSecurityHeaders` (no-store) to prevent accidental CDN caching of
 * state-changing responses.
 */
export function withPublicCache(response: NextResponse, maxAge = 60, swr = 300): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
  );
  return response;
}
