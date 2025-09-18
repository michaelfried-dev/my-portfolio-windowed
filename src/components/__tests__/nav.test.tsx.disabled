import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Nav from '../nav'
import { usePathname } from 'next/navigation'

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock the ThemeSwitcher component to isolate the Nav component's logic
jest.mock('../theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}))

const mockedUsePathname = usePathname as jest.Mock

describe('Nav component', () => {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/experience', label: 'Experience' },
    { href: '/education', label: 'Education' },
    { href: '/certifications', label: 'Certifications' },
  ]

  it('renders all navigation links', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    links.forEach((link) => {
      expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument()
    })
  })

  it('applies active styles to the current page link', () => {
    const currentPath = '/experience'
    mockedUsePathname.mockReturnValue(currentPath)
    render(<Nav />)

    const activeLink = screen.getByRole('link', { name: 'Experience' })
    expect(activeLink).toHaveClass('bg-black', 'text-white')

    const inactiveLink = screen.getByRole('link', { name: 'Home' })
    expect(inactiveLink).toHaveClass('text-main-foreground', 'bg-main')
  })

  it('renders the ThemeSwitcher component', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
  })

  it('applies correct border styles for mobile view', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const homeLink = screen.getByRole('link', { name: 'Home' })
    const experienceLink = screen.getByRole('link', { name: 'Experience' })

    // The first link should not have a top border
    expect(homeLink).not.toHaveClass('border-t-4')

    // Subsequent links should have a top border in mobile view
    expect(experienceLink).toHaveClass('border-t-4', 'md:border-t-0')
  })
})
