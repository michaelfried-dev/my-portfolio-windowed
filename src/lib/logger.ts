/**
 * Structured JSON-line logger for edge API routes.
 *
 * Each log call emits a single JSON object to stdout/stderr so that log
 * aggregators (Cloudflare Logs, Datadog, etc.) can parse fields without
 * regex scraping.
 *
 * Shape: { ts, level, route, requestId, event, ...extras }
 *
 * IP hashing:
 *   Raw IPs are never written to logs. Instead we SHA-256(ip + LOG_IP_SALT).
 *   If LOG_IP_SALT is not set the hash is still computed (over the IP alone)
 *   but is stable only within a single deploy — note this in runbooks so ops
 *   know correlation across deploys is not possible without the salt.
 */

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  ts: string
  level: LogLevel
  route: string
  requestId: string
  event: string
  durationMs?: number
  status?: number
  ipHash?: string
  err?: string
  [key: string]: unknown
}

/** Emit one JSON line. Uses console.error for 'error' level, console.log otherwise. */
export function log(entry: LogEntry): void {
  const line = JSON.stringify(entry)
  if (entry.level === 'error') {
    console.error(line)
  } else {
    console.log(line)
  }
}

/**
 * SHA-256 hash an IP address with an optional salt from LOG_IP_SALT.
 * Returns a hex digest. Never throws — falls back to a constant on failure.
 */
export async function hashIp(ip: string): Promise<string> {
  try {
    const salt = (typeof process !== 'undefined' && process.env?.LOG_IP_SALT) ?? ''
    const input = new TextEncoder().encode(salt ? `${ip}:${salt}` : ip)
    const buf = await crypto.subtle.digest('SHA-256', input)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return 'hash-unavailable'
  }
}
