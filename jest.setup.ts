import { TextEncoder, TextDecoder } from 'util';
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock window.matchMedia for next-themes
if (typeof jest !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

import { Request, Response, Headers } from 'undici';
// Polyfill Web APIs for Next.js Edge runtime compatibility in Jest
globalThis.Request = Request as typeof globalThis.Request;
globalThis.Response = Response as typeof globalThis.Response;
globalThis.Headers = Headers as typeof globalThis.Headers;

// Cleanup for React 19 concurrent features
beforeEach(() => {
  // Clear any pending timers if fake timers are enabled
  if (jest.isMockFunction(setTimeout)) {
    jest.clearAllTimers();
  }
});

afterEach(() => {
  // Clean up any remaining timers or async operations if fake timers are enabled
  if (jest.isMockFunction(setTimeout)) {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  }
});

