import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
      ;(useWindowSizeModule.useWindowSize as jest.Mock).mockReturnValue({
        width: 400,
        height: 600,
      })
    })

    it('renders in full-screen mode', () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))

      const widget = screen.getByTestId('chatbot-widget')
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
      ;(useWindowSizeModule.useWindowSize as jest.Mock).mockReturnValue({
        width: 1200,
        height: 800,
      })
    })

    it('renders as a pop-up widget', () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))

      const widget = screen.getByTestId('chatbot-widget')
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
    await waitFor(
      () => {
        expect(screen.queryByTestId('chatbot-widget')).toBeNull()
      },
      { timeout: 4000 },
    )
  })

  describe('when AI is disabled', () => {
    it('shows the disabled notice', async () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))
      expect(
        await screen.findByText('AI Assistant is currently disabled 🚧'),
      ).toBeInTheDocument()
    })

    it('shows contact info in the disabled notice', async () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))
      expect(
        await screen.findByText(/Running a live AI on a demo site/),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /LinkedIn/i }),
      ).toBeInTheDocument()
    })

    it('renders a disabled input with the correct placeholder', async () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))
      const input = await screen.findByPlaceholderText(
        'AI Assistant is currently disabled',
      )
      expect(input).toBeDisabled()
    })

    it('renders a disabled send button', async () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))
      await screen.findByPlaceholderText('AI Assistant is currently disabled')
      const sendButton = screen.getByRole('button', { name: /Send/i })
      expect(sendButton).toBeDisabled()
    })

    it('does not call the API when the form is submitted', async () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))
      const input = await screen.findByPlaceholderText(
        'AI Assistant is currently disabled',
      )
      const form = input.closest('form')
      if (form) fireEvent.submit(form)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('handles empty input submission gracefully', async () => {
      render(<Chatbot />)
      fireEvent.click(screen.getByLabelText('Open AI Assistant'))
      const input = await screen.findByPlaceholderText(
        'AI Assistant is currently disabled',
      )
      const form = input.closest('form')
      if (form) fireEvent.submit(form)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
