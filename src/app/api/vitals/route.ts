/**
 * Web Vitals ingestion endpoint.
 *
 * Receives CLS/LCP/INP/FCP/TTFB metric payloads posted by the client-side
 * WebVitals component. Validates shape, logs structured JSON, returns 204.
 *
 * Rate-limited to 60 submissions/min/IP.
 * Never logs user-identifying data beyond a hashed IP.
 */
import { NextResponse } from 'next/server'
import { log, hashIp } from '@/lib/logger'

export const runtime = 'edge'

const ROUTE = '/api/vitals'

const RATE_LIMIT_MAX = 60
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const ALLOWED_METRICS = new Set(['CLS', 'LCP', 'INP', 'FCP', 'TTFB'])

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

interface VitalsPayload {
  name: string
  value: number
  rating?: string
  delta?: number
  id?: string
  navigationType?: string
}

function validatePayload(raw: unknown): VitalsPayload | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>

  if (typeof obj.name !== 'string' || !ALLOWED_METRICS.has(obj.name)) return null
  if (typeof obj.value !== 'number' || !Number.isFinite(obj.value)) return null

  // Optional fields — coerce but don't reject on absence
  const rating =
    typeof obj.rating === 'string' ? obj.rating.slice(0, 20) : undefined
  const delta =
    typeof obj.delta === 'number' && Number.isFinite(obj.delta)
      ? obj.delta
      : undefined
  const navigationType =
    typeof obj.navigationType === 'string'
      ? obj.navigationType.slice(0, 40)
      : undefined

  return {
    name: obj.name,
    value: obj.value,
    rating,
    delta,
    navigationType,
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID()
  const clientIp = getClientIp(req)
  const ipHash = await hashIp(clientIp)

  if (!checkRateLimit(clientIp)) {
    log({
      ts: new Date().toISOString(),
      level: 'warn',
      route: ROUTE,
      requestId,
      event: 'vitals.rate_limited',
      status: 429,
      ipHash,
    })
    return new NextResponse(null, { status: 429 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    log({
      ts: new Date().toISOString(),
      level: 'warn',
      route: ROUTE,
      requestId,
      event: 'vitals.invalid_content_type',
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
      event: 'vitals.malformed_body',
      status: 400,
      ipHash,
    })
    return new NextResponse(null, { status: 400 })
  }

  const payload = validatePayload(rawBody)
  if (!payload) {
    log({
      ts: new Date().toISOString(),
      level: 'warn',
      route: ROUTE,
      requestId,
      event: 'vitals.invalid_payload',
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
    event: 'vitals.recorded',
    ipHash,
    metric: payload.name,
    value: payload.value,
    rating: payload.rating,
    delta: payload.delta,
    navigationType: payload.navigationType,
  })

  return new NextResponse(null, { status: 204 })
}
