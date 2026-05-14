import { POST } from '../route'

describe('POST /api/vitals', () => {
  function makeRequest({
    body,
    contentType = 'application/json',
    throwOnJson = false,
  }: {
    body?: unknown
    contentType?: string
    throwOnJson?: boolean
  }): Request {
    return {
      headers: {
        get: (key: string) => {
          if (key === 'content-type') return contentType
          return null
        },
      },
      json: async () => {
        if (throwOnJson) throw new SyntaxError('bad json')
        return body
      },
    } as unknown as Request
  }

  it('returns 204 for valid CLS metric', async () => {
    const req = makeRequest({
      body: { name: 'CLS', value: 0.05, rating: 'good', delta: 0.05 },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 204 for valid LCP metric', async () => {
    const req = makeRequest({
      body: { name: 'LCP', value: 1800, rating: 'good', delta: 1800 },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 204 for valid INP metric', async () => {
    const req = makeRequest({
      body: { name: 'INP', value: 120, rating: 'needs-improvement' },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 204 for valid FCP metric', async () => {
    const req = makeRequest({
      body: { name: 'FCP', value: 900, rating: 'good' },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 204 for valid TTFB metric', async () => {
    const req = makeRequest({
      body: { name: 'TTFB', value: 200, rating: 'good' },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 204 with navigationType field', async () => {
    const req = makeRequest({
      body: {
        name: 'LCP',
        value: 2200,
        rating: 'needs-improvement',
        navigationType: 'navigate',
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it('returns 400 for unknown metric name', async () => {
    const req = makeRequest({ body: { name: 'UNKNOWN', value: 100 } })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 if value is not a number', async () => {
    const req = makeRequest({ body: { name: 'LCP', value: 'fast' } })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 if value is Infinity', async () => {
    const req = makeRequest({ body: { name: 'LCP', value: Infinity } })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 if body is not an object', async () => {
    const req = makeRequest({ body: ['LCP', 1800] })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed JSON', async () => {
    const req = makeRequest({ throwOnJson: true })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 415 for wrong content-type', async () => {
    const req = makeRequest({
      body: { name: 'LCP', value: 1800 },
      contentType: 'text/plain',
    })
    const res = await POST(req)
    expect(res.status).toBe(415)
  })

  it('returns 204 even when optional fields are absent', async () => {
    const req = makeRequest({ body: { name: 'CLS', value: 0.1 } })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })
})
