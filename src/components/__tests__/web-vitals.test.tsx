/**
 * Smoke tests for the WebVitals client component.
 *
 * We mock `next/web-vitals` because it's a browser-only hook that fires
 * via PerformanceObserver — unavailable in jsdom. The tests verify:
 *   1. The component renders without crashing.
 *   2. In dev/test mode, metrics are logged to console (no fetch).
 *   3. In prod mode, navigator.sendBeacon is called with the correct payload.
 *   4. If sendBeacon returns false, fetch is used as fallback.
 */
import React from 'react'
import { render } from '@testing-library/react'
import { WebVitals } from '../web-vitals'

// Capture the callback registered by useReportWebVitals
let capturedCallback: ((metric: any) => void) | null = null

jest.mock('next/web-vitals', () => ({
  useReportWebVitals: (cb: (metric: any) => void) => {
    capturedCallback = cb
  },
}))

const sampleMetric = {
  name: 'LCP',
  value: 1500,
  rating: 'good',
  delta: 1500,
  navigationType: 'navigate',
}

// Assign a stub fetch on global so spyOn can find it
const mockFetch = jest.fn().mockResolvedValue(new Response(null, { status: 204 }))
global.fetch = mockFetch

describe('WebVitals component', () => {
  beforeEach(() => {
    capturedCallback = null
    mockFetch.mockClear()
    // Reset sendBeacon to not exist by default
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  it('renders without crashing and returns null', () => {
    const { container } = render(<WebVitals />)
    expect(container.firstChild).toBeNull()
  })

  it('registers a callback via useReportWebVitals', () => {
    render(<WebVitals />)
    expect(typeof capturedCallback).toBe('function')
  })

  describe('non-production mode (NODE_ENV=test)', () => {
    it('logs to console and does not call fetch', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      render(<WebVitals />)
      capturedCallback?.(sampleMetric)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebVitals]',
        'LCP',
        1500,
        'good',
      )
      expect(mockFetch).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('production mode', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })

    it('uses sendBeacon when available and it returns true', () => {
      const sendBeaconMock = jest.fn().mockReturnValue(true)
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      render(<WebVitals />)
      capturedCallback?.(sampleMetric)

      expect(sendBeaconMock).toHaveBeenCalledWith(
        '/api/vitals',
        expect.any(Blob),
      )
      // sendBeacon succeeded — fetch should NOT be called
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('falls back to fetch when sendBeacon returns false', () => {
      const sendBeaconMock = jest.fn().mockReturnValue(false)
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      render(<WebVitals />)
      capturedCallback?.(sampleMetric)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/vitals',
        expect.objectContaining({
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    it('falls back to fetch when sendBeacon is unavailable', () => {
      // sendBeacon is already set to undefined in beforeEach

      render(<WebVitals />)
      capturedCallback?.(sampleMetric)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/vitals',
        expect.objectContaining({ method: 'POST', keepalive: true }),
      )
    })
  })
})
