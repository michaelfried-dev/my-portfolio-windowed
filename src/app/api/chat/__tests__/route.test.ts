import { POST } from '../route';

declare let global: { fetch: jest.Mock };

describe('POST /api/chat', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';
    delete process.env.LMSTUDIO_FALLBACK_DISABLED;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const importPOST = async () => (await import('../route')).POST;

  function mockRequest(options: { body: any; contentType?: string }): Request {
    const { body, contentType = 'application/json' } = options;
    return {
      headers: {
        get: (key: string) => (key === 'content-type' ? contentType : undefined),
      },
      json: async () => {
        if (body instanceof Error) throw body;
        return body;
      },
    } as unknown as Request;
  }

  // --- Test Cases ---

  it('returns 200 on successful primary API call', async () => {
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          return { choices: [{ message: { content: 'Success' } }] };
        }
      }
    }), { virtual: true });

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ answer: 'Success' });
  });

  it('returns 200 on successful fallback after HF 402 error', async () => {
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          const error: any = new Error('Quota exceeded');
          error.httpResponse = { status: 402 };
          throw error;
        }
      }
    }), { virtual: true });

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Fallback success' } }] }),
    } as Response);

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ answer: 'Fallback success' });
  });

  it('returns 402 if HF fails (402) and fallback also fails (402)', async () => {
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          const error: any = new Error('HF Quota');
          error.httpResponse = { status: 402 };
          throw error;
        }
      }
    }), { virtual: true });

    global.fetch.mockResolvedValue({ ok: false, status: 402 } as Response);

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.error).toContain('hit my message limit');
  });

  it('returns 503 if HF fails and fallback has network error', async () => {
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          throw new Error('HF unavailable');
        }
      }
    }), { virtual: true });

    global.fetch.mockRejectedValue(new Error('fetch failed'));

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe('The primary service is unavailable, and the fallback service also failed.');
  });

  it('returns 500 if HF fails and fallback has a generic error', async () => {
    const hfError = new Error('Original HF Error');
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          throw hfError;
        }
      }
    }), { virtual: true });

    global.fetch.mockResolvedValue({ ok: false, status: 500 } as Response);

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Original HF Error');
  });

  it('does NOT fallback if fallback is disabled', async () => {
    process.env.LMSTUDIO_FALLBACK_DISABLED = 'true';
    const hfError = new Error('HF Error, no fallback');
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          throw hfError;
        }
      }
    }), { virtual: true });

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('HF Error, no fallback');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 500 on context extraction error', async () => {
    jest.doMock('../../page', () => { 
      throw new Error('mock context error'); 
    }, { virtual: true });

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'test' } });
    const res = await post(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to extract resume context from site source files.');
  });
});
