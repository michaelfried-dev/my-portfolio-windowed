/** @type {import('next').NextConfig} */

// Security response headers.
// CSP is intentionally Report-Only on first rollout so we can observe
// violations in production without breaking the app. Promote to enforcing
// (`Content-Security-Policy`) after a clean reporting window.
//
// `script-src` currently allows 'unsafe-inline' and 'unsafe-eval' because
// Next.js App Router emits inline bootstrap scripts and framer-motion uses
// eval in some animation paths. A follow-up should introduce per-request
// nonces via middleware and drop 'unsafe-inline'/'unsafe-eval'.
//
// `connect-src` is scoped to:
//   - 'self'
//   - https://api-inference.huggingface.co + https://router.huggingface.co
//     (used by @huggingface/inference in src/app/api/chat/route.ts)
//   - http://localhost:1234 + http://127.0.0.1:1234
//     (local LM Studio fallback, only ever reached during local dev)
//   - https://cloudflareinsights.com
//     (Cloudflare Web Analytics beacon — only active when
//      NEXT_PUBLIC_CF_ANALYTICS_TOKEN is set)
//
// `script-src` also allows https://static.cloudflareinsights.com so the
// Cloudflare Analytics beacon script can load.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api-inference.huggingface.co https://router.huggingface.co http://localhost:1234 http://127.0.0.1:1234 https://cloudflareinsights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join('; ')

const securityHeaders = [
  // Modern Report-To replacement (Reporting API v1)
  {
    key: 'Reporting-Endpoints',
    value: 'csp-endpoint="/api/csp-report"',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: contentSecurityPolicy,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
