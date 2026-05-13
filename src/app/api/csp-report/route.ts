/**
 * CSP violation report endpoint.
 *
 * Accepts both legacy (`application/csp-report`) and modern
 * (`application/reports+json`) report formats. Validates shape,
 * logs structured JSON, and returns 204 No Content.
 *
 * Rate-limited to 60 reports/min/IP to prevent DoS abuse of the logging
 * pipeline (a known attack vector for CSP report endpoints).
 */
import { NextResponse } from 'next/server'
import { log, hashIp } from '@/lib/logger'

export const runtime = 'edge'

const ROUTE = '/api/csp-report'

// Rate limit: 60 reports per minute per IP
const RATE_LIMIT_MAX = 60
const RATE_LIMIT_WINDOW_MS = 60 * 1000

const rateLimitStore: Map<string, number[]> = new Map()

function getClientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'anonymous'
}

function checkRateLimit(ip: string): boolean {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.DISABLE_RATE_LIMIT === 'true'
  ) {
    return true
  }
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = rateLimitStore.get(ip) ?? []
  const recent = hits.filter((t) => t > windowStart)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent)
    return false
  }
  recent.push(now)
  rateLimitStore.set(ip, recent)
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore) {
      const filtered = value.filter((t) => t > windowStart)
      if (filtered.length === 0) rateLimitStore.delete(key)
      else rateLimitStore.set(key, filtered)
    }
  }
  return true
}

// Expected shape of a legacy CSP report body ({ "csp-report": {...} })
interface LegacyCspReport {
  'blocked-uri'?: string
  'document-uri'?: string
  'violated-directive'?: string
  'effective-directive'?: string
  'source-file'?: string
  'line-number'?: number
  'column-number'?: number
  disposition?: string
}

// Expected shape of a single modern report (application/reports+json array item)
interface ModernReport {
  type?: string
  url?: string
  body?: {
    blockedURL?: string
    documentURL?: string
    effectiveDirective?: string
    sourceFile?: string
    lineNumber?: number
    columnNumber?: number
    disposition?: string
    referrer?: string
    statusCode?: number
  }
}

function parseLegacy(payload: unknown): LegacyCspReport | null {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }
  const obj = payload as Record<string, unknown>
  const report = obj['csp-report']
  if (report === undefined || report === null || typeof report !== 'object' || Array.isArray(report)) {
    return null
  }
  return report as LegacyCspReport
}

function parseModern(payload: unknown): ModernReport[] | null {
  if (!Array.isArray(payload) || payload.length === 0) return null
  // Validate that every element is an object (loose check — we pick specific fields below)
  if (!payload.every((item) => item !== null && typeof item === 'object')) {
    return null
  }
  return payload as ModernReport[]
}

export async function POST(req: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID()
  const clientIp = getClientIp(req)
  const ipHash = await hashIp(clientIp)

  // Rate limit first — before any body parsing work
  if (!checkRateLimit(clientIp)) {
    log({
      ts: new Date().toISOString(),
      level: 'warn',
      route: ROUTE,
      requestId,
      event: 'csp.rate_limited',
      status: 429,
      ipHash,
    })
    return new NextResponse(null, { status: 429 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  const isLegacy = contentType.includes('application/csp-report')
  const isModern = contentType.includes('application/reports+json')

  if (!isLegacy && !isModern) {
    log({
      ts: new Date().toISOString(),
      level: 'warn',
      route: ROUTE,
      requestId,
      event: 'csp.invalid_content_type',
      status: 415,
      ipHash,
    })
    return new NextResponse(null, { status: 415 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    log({
      ts: new Date().toISOString(),
      level: 'warn',
      route: ROUTE,
      requestId,
      event: 'csp.malformed_body',
      status: 400,
      ipHash,
    })
    return new NextResponse(null, { status: 400 })
  }

  if (isLegacy) {
    const report = parseLegacy(rawBody)
    if (!report) {
      log({
        ts: new Date().toISOString(),
        level: 'warn',
        route: ROUTE,
        requestId,
        event: 'csp.malformed_body',
        status: 400,
        ipHash,
      })
      return new NextResponse(null, { status: 400 })
    }

    log({
      ts: new Date().toISOString(),
      level: 'info',
      route: ROUTE,
      requestId,
      event: 'csp.violation',
      ipHash,
      format: 'legacy',
      violatedDirective: report['violated-directive'] ?? report['effective-directive'] ?? null,
      blockedUri: report['blocked-uri'] ?? null,
      documentUri: report['document-uri'] ?? null,
      sourceFile: report['source-file'] ?? null,
      lineNumber: report['line-number'] ?? null,
    })
  } else {
    // Modern format: array of reports
    const reports = parseModern(rawBody)
    if (!reports) {
      log({
        ts: new Date().toISOString(),
        level: 'warn',
        route: ROUTE,
        requestId,
        event: 'csp.malformed_body',
        status: 400,
        ipHash,
      })
      return new NextResponse(null, { status: 400 })
    }

    for (const report of reports) {
      log({
        ts: new Date().toISOString(),
        level: 'info',
        route: ROUTE,
        requestId,
        event: 'csp.violation',
        ipHash,
        format: 'modern',
        reportType: report.type ?? null,
        violatedDirective: report.body?.effectiveDirective ?? null,
        blockedUri: report.body?.blockedURL ?? null,
        documentUri: report.body?.documentURL ?? report.url ?? null,
        sourceFile: report.body?.sourceFile ?? null,
        lineNumber: report.body?.lineNumber ?? null,
      })
    }
  }

  return new NextResponse(null, { status: 204 })
}
