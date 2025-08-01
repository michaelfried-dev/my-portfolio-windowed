import { POST } from '../route';

describe('POST /api/chat', () => {
  function mockRequest({
    body,
    contentType = 'application/json',
  }: {
    body: any;
    contentType?: string;
  }) {
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

  it('returns 415 if content-type is not application/json', async () => {
    const req = mockRequest({ body: {}, contentType: 'text/plain' });
    const res = await POST(req);
    expect(res.status).toBe(415);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid content type/);
  });

  it('returns 400 for malformed JSON', async () => {
    const req = {
      headers: { get: () => 'application/json' },
      json: async () => { throw new Error('bad json'); },
    } as unknown as Request;
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

  it('returns 400 if question is not a string', async () => {
    const req = mockRequest({ body: { question: 123 } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });

  it('returns 400 if question is an empty string', async () => {
    const req = mockRequest({ body: { question: '' } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });

  it('handles very long question strings', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          return { choices: [{ message: { content: 'ok' } }] };
        }
      }
    }), { virtual: true });
    const { POST: MockedPOST } = await import('../route');
    const longQuestion = 'a'.repeat(10000);
    const req = mockRequest({ body: { question: longQuestion } });
    const res = await MockedPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('ok');
    jest.dontMock('@huggingface/inference');
  });

  it('handles unicode and emoji in question', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          return { choices: [{ message: { content: 'unicode ok' } }] };
        }
      }
    }), { virtual: true });
    const { POST: MockedPOST } = await import('../route');
    const req = mockRequest({ body: { question: '你好 👋🏼 ¿Cómo estás?' } });
    const res = await MockedPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('unicode ok');
    jest.dontMock('@huggingface/inference');
  });

  it('ignores extra properties in the request body', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          return { choices: [{ message: { content: 'extra ok' } }] };
        }
      }
    }), { virtual: true });
    const { POST: MockedPOST } = await import('../route');
    const req = mockRequest({ body: { question: 'extra', foo: 42, bar: 'baz' } });
    const res = await MockedPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('extra ok');
    jest.dontMock('@huggingface/inference');
  });

  it('never includes answer field in error responses', async () => {
    const req = mockRequest({ body: {} });
    const res = await POST(req);
    const data = await res.json();
    expect(data.answer).toBeUndefined();
    expect(typeof data.error).toBe('string');
  });

  it('never includes error field in successful responses', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          return { choices: [{ message: { content: 'success' } }] };
        }
      }
    }), { virtual: true });
    const { POST: MockedPOST } = await import('../route');
    const req = mockRequest({ body: { question: 'success' } });
    const res = await MockedPOST(req);
    const data = await res.json();
    expect(data.error).toBeUndefined();
    expect(data.answer).toBe('success');
    jest.dontMock('@huggingface/inference');
  });

  it('returns 500 if Hugging Face API key is missing', async () => {
    // Save and unset the env variable
    const originalKey = process.env.HUGGINGFACE_API_KEY;
    delete process.env.HUGGINGFACE_API_KEY;
    const req = mockRequest({ body: { question: 'Who are you?' } });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Hugging Face API key not set/);
    // Restore the env variable
    if (originalKey !== undefined) process.env.HUGGINGFACE_API_KEY = originalKey;
  });

  it('returns 200 and answer on successful chat completion', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          return { choices: [{ message: { content: 'Hello from the bot!' } }] };
        }
      }
    }), { virtual: true });
    // Re-import POST after mocking
    const { POST: MockedPOST } = await import('../route');
    const req = mockRequest({ body: { question: 'Say hello' } });
    const res = await MockedPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBe('Hello from the bot!');
    jest.dontMock('@huggingface/inference');
  });

  it('returns 402 and user-friendly error message if Hugging Face API quota is exceeded', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          const error: any = new Error('Payment required');
          error.httpResponse = { status: 402 };
          throw error;
        }
      }
    }), { virtual: true });
    const { POST: MockedPOST } = await import('../route');
    const req = mockRequest({ body: { question: 'What is your message limit?' } });
    const res = await MockedPOST(req);
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.error).toMatch(/hit my message limit for the month/i);
    jest.dontMock('@huggingface/inference');
  });

  it('returns 500 and fallback error message on generic Hugging Face API error', async () => {
    process.env.HUGGINGFACE_API_KEY = 'fake-key';
    jest.resetModules();
    jest.doMock('@huggingface/inference', () => ({
      InferenceClient: class {
        constructor() {}
        async chatCompletion() {
          throw new Error('Random server error');
        }
      }
    }), { virtual: true });
    const { POST: MockedPOST } = await import('../route');
    const req = mockRequest({ body: { question: 'Trigger error' } });
    const res = await MockedPOST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Failed to process request via Hugging Face InferenceClient/);
    jest.dontMock('@huggingface/inference');
  });

  // Note: Lines 176-184 (context extraction error) and 236-244 (generic error handler) 
  // are difficult to test in isolation due to complex module loading and error handling.
  // These represent edge cases that would require very specific failure conditions 
  // that are hard to reproduce reliably in tests.

  it('handles malformed JSON in request body', async () => {
    const req = {
      headers: { get: () => 'application/json' },
      json: async () => { throw new SyntaxError('Unexpected token in JSON'); },
    } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid JSON format/);
  });

  it('handles question that is null', async () => {
    const req = mockRequest({ body: { question: null } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });

  it('handles question that is undefined', async () => {
    const req = mockRequest({ body: { question: undefined } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });

  it('handles question that is an array', async () => {
    const req = mockRequest({ body: { question: ['not', 'a', 'string'] } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });

  it('handles question that is a boolean', async () => {
    const req = mockRequest({ body: { question: true } });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Request must include a string question/);
  });
});
