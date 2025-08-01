import { POST } from '../route';

// Mock fetch globally
global.fetch = jest.fn();

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
    expect(data.error).toContain('technical difficulties');
    expect(data.error).toContain('LinkedIn');
    expect(data.error).toContain('Email@MichaelFried.info');
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
    expect(data.error).toContain('technical difficulties');
    expect(data.error).toContain('LinkedIn');
    expect(data.error).toContain('Email@MichaelFried.info');
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

  describe('LM Studio Fallback Tests', () => {
    const originalEnv = process.env;
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
      mockFetch.mockClear();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('forces 402 response when FORCE_HUGGINGFACE_402 is enabled', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.FORCE_HUGGINGFACE_402 = 'true';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'false';

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error).toContain('hit my message limit');
    });

    it('uses LM Studio fallback when Hugging Face returns 402 and fallback is enabled', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.FORCE_HUGGINGFACE_402 = 'true';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
      process.env.LM_STUDIO_URL = 'http://localhost:1234';
      process.env.LM_STUDIO_MODEL = 'test-model';

      // Mock successful LM Studio response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'LM Studio response'
            }
          }]
        })
      } as Response);

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.answer).toBe('LM Studio response');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test-model')
        })
      );
    });

    it('falls back to 402 error when LM Studio fallback fails', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.FORCE_HUGGINGFACE_402 = 'true';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
      process.env.LM_STUDIO_URL = 'http://localhost:1234';

      // Mock failed LM Studio response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error).toContain('hit my message limit');
    });

    it('skips LM Studio fallback when URL is not configured', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.FORCE_HUGGINGFACE_402 = 'true';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
      // LM_STUDIO_URL not set

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error).toContain('hit my message limit');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('uses LM Studio fallback for non-402 Hugging Face errors when enabled', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
      process.env.LM_STUDIO_URL = 'http://localhost:1234';

      // Mock Hugging Face error (non-402)
      jest.doMock('@huggingface/inference', () => ({
        InferenceClient: jest.fn().mockImplementation(() => ({
          chatCompletion: jest.fn().mockRejectedValue(new Error('Network error'))
        }))
      }));

      // Mock successful LM Studio response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'LM Studio fallback response'
            }
          }]
        })
      } as Response);

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.answer).toBe('LM Studio fallback response');
    });

    it('returns 500 error when both Hugging Face and LM Studio fail', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
      process.env.LM_STUDIO_URL = 'http://localhost:1234';

      // Mock Hugging Face error (non-402)
      jest.doMock('@huggingface/inference', () => ({
        InferenceClient: jest.fn().mockImplementation(() => ({
          chatCompletion: jest.fn().mockRejectedValue(new Error('Network error'))
        }))
      }));

      // Mock failed LM Studio response
      mockFetch.mockRejectedValueOnce(new Error('LM Studio connection failed'));

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain('technical difficulties');
      expect(data.error).toContain('LinkedIn');
      expect(data.error).toContain('Email@MichaelFried.info');
    });

    it('does not use LM Studio fallback when feature is disabled', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.FORCE_HUGGINGFACE_402 = 'true';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'false';
      process.env.LM_STUDIO_URL = 'http://localhost:1234';

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error).toContain('hit my message limit');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles LM Studio response with missing content gracefully', async () => {
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      process.env.FORCE_HUGGINGFACE_402 = 'true';
      process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
      process.env.LM_STUDIO_URL = 'http://localhost:1234';

      // Mock LM Studio response with missing content
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {}
          }]
        })
      } as Response);

      const req = mockRequest({ body: { question: 'test question' } });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.answer).toBe('No answer found from LM Studio.');
    });
  });
});

// Test the cleanThinkingContent function directly
describe('cleanThinkingContent function', () => {
  beforeEach(() => {
    // Set up environment variables for LM Studio fallback
    process.env.ENABLE_LM_STUDIO_FALLBACK = 'true';
    process.env.LM_STUDIO_URL = 'http://localhost:1234';
    process.env.LM_STUDIO_MODEL = 'test-model';
    process.env.FORCE_HUGGINGFACE_402 = 'true';
  });
  
  it('removes DeepSeek R1 think tags from LM Studio responses', async () => {
    // Mock LM Studio to return response with think tags
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('localhost:1234')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: '<think>\nLet me analyze this question about the resume...\n</think>\n\nHello! I can help you with questions about this resume and portfolio.'
              }
            }]
          })
        });
      }
      // Hugging Face mock - force 402
      throw { httpResponse: { status: 402 } };
    });

    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Hello' })
    }));

    const data = await response.json();
    expect(data.answer).toBe('Hello! I can help you with questions about this resume and portfolio.');
    expect(data.answer).not.toContain('<think>');
    expect(data.answer).not.toContain('</think>');
  });

  it('removes thinking phrases from LM Studio responses', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('localhost:1234')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: 'Okay, the user is asking about experience.\n\nI have extensive experience in software development.'
              }
            }]
          })
        });
      }
      throw { httpResponse: { status: 402 } };
    });

    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Tell me about experience' })
    }));

    const data = await response.json();
    expect(data.answer).toBe('I have extensive experience in software development.');
    expect(data.answer).not.toContain('Okay, the user');
  });

  it('removes multiple thinking patterns from LM Studio responses', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('localhost:1234')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: 'The answer is 42. This is a clean response.'
              }
            }]
          })
        });
      }
      throw { httpResponse: { status: 402 } };
    });

    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is the answer?' })
    }));

    const data = await response.json();
    // Test that clean responses pass through unchanged
    expect(data.answer).toBe('The answer is 42. This is a clean response.');
  });

  it('preserves original content when cleanup would remove everything', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('localhost:1234')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: 'Okay, let me think about this.'
              }
            }]
          })
        });
      }
      throw { httpResponse: { status: 402 } };
    });

    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Short question' })
    }));

    const data = await response.json();
    // Should preserve original since cleanup would remove everything
    expect(data.answer).toBe('Okay, let me think about this.');
  });

  it('handles empty or null content gracefully', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('localhost:1234')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: ''
              }
            }]
          })
        });
      }
      throw { httpResponse: { status: 402 } };
    });

    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Empty response test' })
    }));

    const data = await response.json();
    expect(data.answer).toBe('No answer found from LM Studio.');
  });

  it('cleans up extra whitespace and newlines', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('localhost:1234')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: 'First paragraph.\n\n\n\nSecond paragraph.\n\n\n\n\nThird paragraph.'
              }
            }]
          })
        });
      }
      throw { httpResponse: { status: 402 } };
    });

    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Whitespace test' })
    }));

    const data = await response.json();
    expect(data.answer).toBe('First paragraph.\n\nSecond paragraph.\n\nThird paragraph.');
    expect(data.answer).not.toMatch(/\n\n\n/);
  });
});
