import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeSwitcher } from '../theme-switcher'
import { ThemeProvider } from '../theme-provider'

// Mock lucide-react to make it easier to find icons
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react')
  return {
    ...original,
    Sun: (props: any) => <svg {...props} data-testid="sun-icon" />,
    Moon: (props: any) => <svg {...props} data-testid="moon-icon" />,
  }
})

describe('ThemeSwitcher', () => {
  const renderWithProvider = (theme: 'light' | 'dark') => {
    return render(
      <ThemeProvider
        attribute="class"
        defaultTheme={theme}
        enableSystem={false}
      >
        <ThemeSwitcher />
      </ThemeProvider>,
    )
  }

  it('renders correct icons and toggles from light to dark', () => {
    renderWithProvider('light')

    // In light mode, Moon is inline and Sun is hidden.
    expect(screen.getByTestId('moon-icon')).toHaveClass('inline')
    expect(screen.getByTestId('sun-icon')).toHaveClass('hidden')

    fireEvent.click(screen.getByRole('button'))

    // After click, the theme attribute on <html> should be 'dark'.
    expect(document.documentElement).toHaveClass('dark')
  })

  it('renders correct icons and toggles from dark to light', () => {
    renderWithProvider('dark')

    // In dark mode, Sun is inline and Moon is hidden.
    expect(screen.getByTestId('sun-icon')).toHaveClass('dark:inline')
    expect(screen.getByTestId('moon-icon')).toHaveClass('dark:hidden')

    fireEvent.click(screen.getByRole('button'))

    // After click, the theme attribute on <html> should be 'light'.
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
