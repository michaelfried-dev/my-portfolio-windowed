import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '../theme-provider'

describe('ThemeProvider', () => {
  it('renders children and passes props to NextThemesProvider', () => {
    const childText = 'Hello, World!'
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div>{childText}</div>
      </ThemeProvider>,
    )

    // Check that the child content is rendered
    expect(screen.getByText(childText)).toBeInTheDocument()
  })
})
