import { POST } from '../route';

declare let global: { fetch: jest.Mock };

describe('POST /api/chat', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
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

  // Basic Validation Tests
  it('returns 415 if content-type is not application/json', async () => {
    const req = mockRequest({ body: {}, contentType: 'text/plain' });
    const res = await POST(req);
    expect(res.status).toBe(415);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid content type/);
  });

  it('returns 400 for malformed JSON', async () => {
    const req = mockRequest({ body: new Error('bad json') });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid JSON format/);
  });

  it('returns 400 if question is missing', async () => {
    const req = mockRequest({ body: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });

  // Core Logic and Success Cases
  it('returns 200 and answer on successful chat completion', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          return { choices: [{ message: { content: 'Hello from the bot!' } }] };
        }
      }
    }), { virtual: true });
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Say hello' } });
    const res = await post(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('Hello from the bot!');
  });

  // Fallback Disabled Scenarios
  it('does NOT fallback to LM Studio when disabled (402 error)', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_FALLBACK_DISABLED = 'true';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          const error: any = new Error('Payment required');
          error.httpResponse = { status: 402 };
          throw error;
        }
      }
    }), { virtual: true });
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Limit check' } });
    const res = await post(req);
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.error).toMatch(/hit my message limit/i);
  });

  // Successful Fallback Scenarios
  it('falls back to LM Studio on Hugging Face 402 error', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          const error: any = new Error('Payment required');
          error.httpResponse = { status: 402 };
          throw error;
        }
      }
    }), { virtual: true });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'Fallback answer' } }] }),
    } as Response);
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Fallback test' } });
    const res = await post(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('Fallback answer');
  });

  it('falls back to LM Studio on generic Hugging Face error', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() { throw new Error('Generic HF error'); }
      }
    }), { virtual: true });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'Generic fallback answer' } }] }),
    } as Response);
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Generic fallback test' } });
    const res = await post(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('Generic fallback answer');
  });

  // Failed Fallback Scenarios
  it('returns original 402 error if both services fail (402)', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() {
          const error: any = new Error('Payment required');
          error.httpResponse = { status: 402 };
          throw error;
        }
      }
    }), { virtual: true });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Double fail 402' } });
    const res = await post(req);
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.error).toMatch(/hit my message limit/i);
  });

  it('returns original generic error if both services fail (generic)', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() { throw new Error('Original generic error'); }
      }
    }), { virtual: true });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Double fail generic' } });
    const res = await post(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Original generic error');
  });

  it('returns 503 if HF fails and LM Studio fetch fails', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        async chatCompletion() { throw new Error('HF unavailable'); }
      }
    }), { virtual: true });
    global.fetch = jest.fn().mockRejectedValue(new Error('fetch failed'));
    const post = await importPOST();
    const req = mockRequest({ body: { question: 'Network failure test' } });
    const res = await post(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe('The primary service is unavailable, and the fallback service also failed.');
  });

  // Coverage for uncovered branches
  it('returns 500 on context extraction error', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    process.env.LMSTUDIO_API_URL = 'http://localhost:1234/v1/chat/completions';
    process.env.LMSTUDIO_MODEL = 'lmstudio-test-model';

    jest.doMock('../../page', () => { throw new Error('mock context error'); }, { virtual: true });

    const post = await importPOST();
    const req = mockRequest({ body: { question: 'context error test' } });
    const res = await post(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to extract resume context from site source files.');
  });
});
