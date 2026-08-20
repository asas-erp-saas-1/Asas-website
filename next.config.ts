import type { NextConfig } from "next";

// Vercel-recommended Next.js production config.
//
// Why no `output: 'standalone'`:
//   `output: 'standalone'` is intended for self-hosted Docker/VPS deploys.
//   On Vercel it bypasses native Vercel optimizations and produces larger
//   bundles. Vercel auto-detects Next.js and handles the build natively.
//
// Why `reactStrictMode: true`:
//   Surfaces unsafe side effects, double-invokes effects/renders in dev.
//   Bugs caught by strict mode are bugs we want to catch before production.
//
// Why `typescript.ignoreBuildErrors: false`:
//   Production builds MUST fail on type errors. Never suppress.
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
