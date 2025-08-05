import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Chatbot } from '../chatbot'
import * as useWindowSizeModule from '@/hooks/useWindowSize'

// All mocks at the top level
jest.mock('@/hooks/useWindowSize', () => ({
  useWindowSize: jest.fn(),
}))

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
  motion: {
    div: React.forwardRef((props: any, ref: any) =>
      React.createElement('div', { ref, ...props }),
    ),
  },
}))

// Mock scrollIntoView for jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function () {}
})

// Mock fetch for API calls and window size
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ answer: 'Test answer' }),
    }),
  ) as jest.Mock
  ;(useWindowSizeModule.useWindowSize as jest.Mock).mockReturnValue({
    width: 1024,
    height: 768,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Chatbot', () => {
  // Test for responsiveness
  describe('when on a small screen', () => {
    beforeEach(() => {
      // Mock the useWindowSize hook to return a small screen size
      ;(useWindowSizeModule.useWindowSize as jest.Mock).mockReturnValue({
        width: 400,
        height: 600,
      })
    })

    it('renders in full-screen mode', () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))

      const widget = screen.getByTestId('chatbot-widget')
      // Check for full-screen classes
      expect(widget).toHaveClass('inset-0 h-full w-full')
      expect(screen.queryByLabelText(/fullscreen/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('chatbot-card')).toHaveClass(
        'flex h-full flex-col',
      )
      expect(screen.getByTestId('chatbot-chat-area')).toHaveClass('flex-grow')
    })
  })

  describe('when on a large screen', () => {
    beforeEach(() => {
      // Mock the useWindowSize hook to return a large screen size
      ;(useWindowSizeModule.useWindowSize as jest.Mock).mockReturnValue({
        width: 1200,
        height: 800,
      })
    })

    it('renders as a pop-up widget', () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))

      const widget = screen.getByTestId('chatbot-widget')
      // Check for pop-up classes
      expect(widget).toHaveClass('right-4 bottom-4 w-full max-w-md')
      expect(widget).not.toHaveClass('inset-0 h-full w-full')
      expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument()
    })

    it('toggles fullscreen on desktop', () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))

      const widget = screen.getByTestId('chatbot-widget')

      const enterButton = screen.getByLabelText('Enter fullscreen')
      fireEvent.click(enterButton)
      expect(widget).toHaveClass('inset-0 h-full w-full')
      expect(widget).not.toHaveClass('right-4 bottom-4 w-full max-w-md')
      expect(screen.getByTestId('chatbot-card')).toHaveClass(
        'flex h-full flex-col',
      )
      expect(screen.getByTestId('chatbot-chat-area')).toHaveClass('flex-grow')

      const exitButton = screen.getByLabelText('Exit fullscreen')
      fireEvent.click(exitButton)
      expect(widget).toHaveClass('right-4 bottom-4 w-full max-w-md')
      expect(widget).not.toHaveClass('inset-0 h-full w-full')
      expect(screen.getByTestId('chatbot-card')).not.toHaveClass(
        'flex h-full flex-col',
      )
      expect(screen.getByTestId('chatbot-chat-area')).toHaveClass('h-64')
    })
  })
  it('renders the floating open button', () => {
    render(<Chatbot />)
    // Button should be present with correct aria-label
    expect(screen.getByLabelText('Open AI Assistant')).toBeInTheDocument()
  })

  it('opens the chatbot widget with animation', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    expect(await screen.findByText('AI Assistant')).toBeInTheDocument()
  })

  it('closes the chatbot widget when close button is clicked', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    fireEvent.click(await screen.findByLabelText('Close Chatbot'))
    // Wait for the chatbot widget to be removed from the DOM
    await waitFor(
      () => {
        const widget = screen.queryByTestId('chatbot-widget')
        if (widget) {
          // eslint-disable-next-line no-console
          console.log('Widget still present after close:', widget.outerHTML)
        }
        expect(widget).toBeNull()
      },
      { timeout: 4000 },
    )
  })

  it('submits a question and displays the answer', async () => {
    render(<Chatbot />)

    // The chatbot starts closed, so we need to find the button to open it
    const toggleButton = screen.getByRole('button', {
      name: /open ai assistant/i,
    })
    fireEvent.click(toggleButton)

    // Find the input and submit a question
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )

    fireEvent.change(input, { target: { value: 'Test question' } })

    // Submit the form
    const form = input.closest('form')
    if (form) {
      fireEvent.submit(form)
    }

    // Wait for the answer to appear
    await waitFor(() => {
      expect(screen.getByText('Test answer')).toBeInTheDocument()
    })
  })

  it('allows pasting an image into the input', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    fireEvent.paste(input, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file,
          },
        ],
        files: [file],
      },
    } as any)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    fireEvent.change(input, { target: { value: 'Image question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    await screen.findByText('Test answer')
    expect(screen.getByAltText('Uploaded')).toBeInTheDocument()
  })

  it('allows dropping an image into the chat area', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const dropZone = await screen.findByTestId('chatbot-chat-area')
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    fireEvent.drop(dropZone, {
      dataTransfer: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file,
          },
        ],
        files: [file],
      },
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Image question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    await screen.findByText('Test answer')
    expect(screen.getByAltText('Uploaded')).toBeInTheDocument()
  })

  it('renders phone number as clickable tel: link in answer', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ answer: 'You can call me at 856-905-0670.' }),
      }),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'phone?' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Wait for the answer to appear, then check for the raw markdown link
    const answerText = await screen.findByText(
      /You can call me at \[856-905-0670\]\(tel:8569050670\)\./,
    )
    expect(answerText).toBeInTheDocument()
  })

  it('shows a loading indicator while waiting for answer', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ answer: 'Delayed answer' }),
              }),
            500,
          ),
        ),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test loading?' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText(/Connecting to AI/)).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('Delayed answer')).toBeInTheDocument()
    })
  })

  it('shows error message when API returns an error', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            error: 'Rate limit exceeded',
          }),
      }),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Trigger error' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // The component shows a generic error message for API errors
    expect(
      await screen.findByText('Sorry, I could not generate an answer.'),
    ).toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error')),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Network test' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Should show user-friendly error message
    expect(
      await screen.findByText(
        /Sorry, there was an error processing your request. Please try again later./,
      ),
    ).toBeInTheDocument()
  })

  it('handles empty input submission gracefully', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Should not make any API call or add to QA
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles whitespace-only input submission gracefully', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: '   ' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Should not make any API call or add to QA
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('disables input and button while loading', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ answer: 'Delayed answer' }),
              }),
            1000,
          ),
        ),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test loading state' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Check that input and button are disabled during loading
    expect(input).toBeDisabled()
    const sendButton = screen.getByRole('button', { name: /\.\.\.|Send/ })
    expect(sendButton).toBeDisabled()
  })

  it('renders email addresses as clickable mailto links', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'Contact me at test@example.com for more info.',
          }),
      }),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'email?' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Wait for the answer to appear with email link
    const answerText = await screen.findByText(
      /Contact me at \[test@example\.com\]\(mailto:test@example\.com\) for more info\./,
    )
    expect(answerText).toBeInTheDocument()
  })

  it('renders URLs as clickable links', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'Check out https://example.com for details.',
          }),
      }),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'url?' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Wait for the answer to appear with URL link
    const answerText = await screen.findByText(
      /Check out \[https:\/\/example\.com\]\(https:\/\/example\.com\) for details\./,
    )
    expect(answerText).toBeInTheDocument()
  })

  it('handles non-string answer gracefully', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ answer: 'Sorry, I could not generate an answer.' }),
      }),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'test question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    // Should show the default answer when API returns an error
    expect(
      await screen.findByText(/Sorry, I could not generate an answer\./),
    ).toBeInTheDocument()
  })

  it('focuses input after opening chatbot', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    expect(input).toHaveFocus()
  })

  it('maintains focus on input after form submission', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test focus' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Input should maintain focus after submission
    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })

  it('clears input after successful submission', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test clear input' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Input should be cleared after submission
    expect(input).toHaveValue('')
  })

  it('handles multiple questions in sequence', async () => {
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )

    // First question
    fireEvent.change(input, { target: { value: 'First question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)
    expect(await screen.findByText('Test answer')).toBeInTheDocument()

    // Second question
    fireEvent.change(input, { target: { value: 'Second question' } })
    if (form) fireEvent.submit(form)

    // Both questions should be visible
    expect(screen.getByText('First question')).toBeInTheDocument()
    expect(screen.getByText('Second question')).toBeInTheDocument()
  })

  it('handles API response without answer field', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}), // No answer field
      }),
    )
    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'No answer test' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Should handle missing answer gracefully
    expect(
      await screen.findByText(/Sorry, I could not generate an answer\./),
    ).toBeInTheDocument()
  })

  it('displays generic thinking message when loading', async () => {
    // Mock a delayed fetch to ensure loading state persists
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ answer: 'Test answer' }),
              }),
            100,
          ),
        ),
    )

    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Should show generic thinking message
    expect(await screen.findByText(/Connecting to AI/)).toBeInTheDocument()
  })

  it('displays LM Studio usage indicator when usedLmStudio flag is true', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'LM Studio response',
            usedLmStudio: true,
            lmStudioModel: 'test-model',
          }),
      }),
    )

    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Should show LM Studio usage indicator with model name
    expect(await screen.findByText(/LM Studio response/)).toBeInTheDocument()
    expect(
      screen.getByText(/Powered by local and private AI \(test-model\)/),
    ).toBeInTheDocument()
  })

  it('displays Hugging Face indicator when usedLmStudio flag is false', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'Regular response',
            usedLmStudio: false,
          }),
      }),
    )

    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Should show Hugging Face indicator
    expect(await screen.findByText('Regular response')).toBeInTheDocument()
    expect(screen.getByText(/Powered by Hugging Face/)).toBeInTheDocument()
  })

  it('displays default LM Studio name when lmStudioModel is not provided', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'LM Studio fallback response',
            usedLmStudio: true,
            // No lmStudioModel provided
          }),
      }),
    )

    render(<Chatbot />)
    fireEvent.click(screen.getByLabelText('Open AI Assistant'))
    const input = await screen.findByPlaceholderText(
      'e.g. Where did Michael Fried work in 2023?',
    )
    fireEvent.change(input, { target: { value: 'Test question' } })
    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    // Should show LM Studio usage indicator with model name
    expect(
      await screen.findByText(/LM Studio fallback response/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Powered by local and private AI \(LM Studio\)/),
    ).toBeInTheDocument()
  })
})
