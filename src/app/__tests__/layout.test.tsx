import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import type { Metadata, Viewport } from 'next'
import RootLayout, { metadata } from '../layout'

// Mock the next/font module
jest.mock('next/font/google', () => ({
  Archivo: () => ({
    className: 'mocked-font-class',
    style: { fontFamily: 'mocked-font-family' },
    subsets: ['latin'],
  }),
}))

// Mock the components used in the layout
jest.mock('@/components/nav', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-nav">Nav Component</div>,
}))

jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-theme-provider">{children}</div>
  ),
}))

jest.mock('@/components/chatbot', () => ({
  Chatbot: () => <div data-testid="mock-chatbot">Chatbot Component</div>,
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  ),
}))

describe('RootLayout', () => {
  it('renders the layout with children', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-children">Test Children</div>
      </RootLayout>,
    )

    expect(container).toMatchSnapshot()
    expect(
      container.querySelector('[data-testid="test-children"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-testid="mock-nav"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-testid="mock-theme-provider"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-testid="mock-chatbot"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-testid="mock-link"]'),
    ).toBeInTheDocument()
  })
})

describe('Layout Metadata', () => {
  it('has the correct viewport settings including userScalable: false', () => {
    // Check that the viewport metadata is correctly set
    expect(metadata.viewport).toBeDefined()

    // Type assertion to handle the viewport type which can be string | ViewportLayout
    const viewport = metadata.viewport as Viewport
    expect(viewport.width).toBe('device-width')
    expect(viewport.initialScale).toBe(1)
    expect(viewport.userScalable).toBe(false)
  })

  it('has the correct title and description', () => {
    expect(metadata.title).toBeDefined()

    // Type assertion for title which can be string | TitleTemplate
    const title = metadata.title as { default: string; template: string }
    expect(title.default).toBe('Michael Fried - Portfolio')
    expect(title.template).toBe('%s | Michael Fried')

    expect(metadata.description).toBe(
      "Michael Fried's professional portfolio showcasing software engineering expertise, AI-powered chatbot assistance, and innovative projects built with modern web technologies.",
    )
  })
})
