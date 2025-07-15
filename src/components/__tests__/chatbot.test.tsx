import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Chatbot } from '../chatbot';

// Mock framer-motion for deterministic mount/unmount in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      div: React.forwardRef((props: any, ref: any) => <div ref={ref} {...props} />)
    }
  };
});

// Mock scrollIntoView for jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function () {};
});

// Mock fetch for API calls
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ answer: 'Test answer' }),
    })
  ) as jest.Mock;
});
afterEach(() => {
  jest.resetAllMocks();
});

describe('Chatbot', () => {
  it('renders the floating open button', () => {
    render(<Chatbot />);
    // Button should be present with correct aria-label
    expect(screen.getByLabelText('Open Chatbot')).toBeInTheDocument();
  });

  it('opens the chatbot widget with animation', async () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Open Chatbot'));
    expect(await screen.findByText('Ask about my experience')).toBeInTheDocument();
  });

  it('closes the chatbot widget when close button is clicked', async () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Open Chatbot'));
    fireEvent.click(await screen.findByLabelText('Close Chatbot'));
    // Wait for the chatbot widget to be removed from the DOM
    await waitFor(() => {
      const widget = screen.queryByTestId('chatbot-widget');
      if (widget) {
        // eslint-disable-next-line no-console
        console.log('Widget still present after close:', widget.outerHTML);
      }
      expect(widget).toBeNull();
    }, { timeout: 4000 });
  });

  it('sends a question and displays the answer', async () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Open Chatbot'));
    const input = await screen.findByPlaceholderText('e.g. Where did Michael Fried work in 2023?');
    fireEvent.change(input, { target: { value: 'What is your name?' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);
    expect(await screen.findByText('Test answer')).toBeInTheDocument();
  });

  it('shows a loading indicator while waiting for answer', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ answer: 'Delayed answer' }) }), 500))
    );
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Open Chatbot'));
    const input = await screen.findByPlaceholderText('e.g. Where did Michael Fried work in 2023?');
    fireEvent.change(input, { target: { value: 'Test loading?' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Delayed answer')).toBeInTheDocument();
    });
  });

  it('shows an error if the API fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'API error' }) })
    );
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Open Chatbot'));
    const input = await screen.findByPlaceholderText('e.g. Where did Michael Fried work in 2023?');
    fireEvent.change(input, { target: { value: 'Trigger error' } });
    const form = input.closest('form');
    if (form) fireEvent.submit(form);
    expect(await screen.findByText('API error')).toBeInTheDocument();
  });
});
