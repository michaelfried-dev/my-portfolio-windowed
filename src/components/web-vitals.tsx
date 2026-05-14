'use client'

/**
 * WebVitals — client component that reports Core Web Vitals to /api/vitals.
 *
 * In development: logs metrics to the browser console only (no network call).
 * In production: uses navigator.sendBeacon with a fetch fallback so the POST
 * does not block page navigation or LCP.
 */
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    const payload = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
    })

    if (process.env.NODE_ENV !== 'production') {
      // Dev-only console sink — keeps network requests clean during development
      console.log('[WebVitals]', metric.name, metric.value, metric.rating)
      return
    }

    const url = '/api/vitals'

    // Prefer sendBeacon — fire-and-forget, survives page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      const sent = navigator.sendBeacon(url, blob)
      if (sent) return
    }

    // Fallback: keepalive fetch so the request isn't aborted on navigation
    fetch(url, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently discard — vitals are best-effort telemetry
    })
  })

  return null
}
