import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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

// Mock lucide-react icons used in Nav.
// Props are forwarded so that attributes like aria-hidden propagate to the
// rendered element and can be asserted in tests.
jest.mock('lucide-react', () => ({
  Menu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-menu" {...props} />
  ),
  X: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-x" {...props} />
  ),
}))

const mockedUsePathname = usePathname as jest.Mock

describe('Nav component', () => {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/experience', label: 'Experience' },
    { href: '/education', label: 'Education' },
    { href: '/certifications', label: 'Certifications' },
  ]

  // ── Desktop layout ──────────────────────────────────────────────────────────

  it('renders all navigation links in the desktop grid', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    // getAllByRole returns all matching elements; the desktop grid renders one
    // set of links and the mobile drawer renders another (hidden via CSS).
    // We just verify every label is present at least once.
    links.forEach((link) => {
      expect(
        screen.getAllByRole('link', { name: link.label }).length,
      ).toBeGreaterThanOrEqual(1)
    })
  })

  it('applies active styles to the current page link in the desktop grid', () => {
    const currentPath = '/experience'
    mockedUsePathname.mockReturnValue(currentPath)
    render(<Nav />)

    // Desktop grid links are the first set rendered; getAllByRole returns them
    // in DOM order so index 0 is desktop, index 1 is mobile drawer.
    const activeLinks = screen.getAllByRole('link', { name: 'Experience' })
    expect(activeLinks[0]).toHaveClass('bg-black', 'text-white')

    const inactiveLinks = screen.getAllByRole('link', { name: 'Home' })
    expect(inactiveLinks[0]).toHaveClass('text-main-foreground', 'bg-main')
  })

  it('applies aria-current="page" to the active link', () => {
    mockedUsePathname.mockReturnValue('/education')
    render(<Nav />)

    const activeLinks = screen.getAllByRole('link', { name: 'Education' })
    activeLinks.forEach((link) => {
      expect(link).toHaveAttribute('aria-current', 'page')
    })

    // Other links must not have aria-current
    const inactiveLinks = screen.getAllByRole('link', { name: 'Home' })
    inactiveLinks.forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current')
    })
  })

  it('renders the ThemeSwitcher component', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    // Two ThemeSwitchers render (mobile bar + desktop grid)
    expect(
      screen.getAllByTestId('theme-switcher').length,
    ).toBeGreaterThanOrEqual(1)
  })

  // ── Hamburger button ────────────────────────────────────────────────────────

  it('renders the hamburger toggle button', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    expect(toggle).toBeInTheDocument()
  })

  it('hamburger button has correct aria attributes when closed', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav-drawer')
  })

  it('clicking the hamburger button sets aria-expanded to true', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking the hamburger button again sets aria-expanded back to false', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the close icon when drawer is open and menu icon when closed', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)

    expect(screen.getByTestId('icon-menu')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-x')).not.toBeInTheDocument()

    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(toggle)

    expect(screen.queryByTestId('icon-menu')).not.toBeInTheDocument()
    expect(screen.getByTestId('icon-x')).toBeInTheDocument()
  })

  // ── Mobile drawer ───────────────────────────────────────────────────────────

  it('mobile drawer is not visible (hidden class) when collapsed', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const drawer = document.getElementById('mobile-nav-drawer')
    expect(drawer).toBeInTheDocument()
    // Drawer element has the CSS hidden class when closed
    expect(drawer).toHaveClass('hidden')
  })

  it('mobile drawer links are present in DOM with correct aria-current', () => {
    mockedUsePathname.mockReturnValue('/experience')
    render(<Nav />)

    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(toggle)

    // After open, drawer no longer has 'hidden' class applied via w700:hidden
    // (CSS-only toggle; class presence changes in the clsx output)
    const drawer = document.getElementById('mobile-nav-drawer')
    expect(drawer).not.toHaveClass('w700:hidden')

    // All links exist in the drawer
    const drawerLinks = drawer!.querySelectorAll('a')
    expect(drawerLinks.length).toBe(4)

    // Active link has aria-current
    const activeDrawerLink = Array.from(drawerLinks).find(
      (a) => a.textContent?.trim() === 'Experience',
    )
    expect(activeDrawerLink).toHaveAttribute('aria-current', 'page')
  })

  it('clicking a drawer link closes the drawer (aria-expanded becomes false)', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    // Click the first link in the drawer
    const drawer = document.getElementById('mobile-nav-drawer')
    const firstLink = drawer!.querySelector('a')!
    fireEvent.click(firstLink)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  // ── Keyboard / Escape ───────────────────────────────────────────────────────

  it('pressing Escape closes the drawer', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('pressing Escape when drawer is already closed does not error', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })

    // Drawer is closed; fire Escape — should be a no-op
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  // ── Icon accessibility ──────────────────────────────────────────────────────

  it('Menu icon has aria-hidden="true" when drawer is closed', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const menuIcon = screen.getByTestId('icon-menu')
    expect(menuIcon).toHaveAttribute('aria-hidden', 'true')
  })

  it('X icon has aria-hidden="true" when drawer is open', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(toggle)
    const xIcon = screen.getByTestId('icon-x')
    expect(xIcon).toHaveAttribute('aria-hidden', 'true')
  })

  // ── Focus management ────────────────────────────────────────────────────────

  it('pressing Escape returns focus synchronously to the toggle button', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // Focus must return synchronously — no rAF wrapper means we can assert here
    expect(document.activeElement).toBe(toggle)
  })

  // ── Tab order ───────────────────────────────────────────────────────────────

  it('drawer links appear in document order after opening', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(toggle)

    const drawer = document.getElementById('mobile-nav-drawer')!
    const drawerLinks = Array.from(drawer.querySelectorAll('a'))

    // Verify all four links are present and in the expected label order
    const expectedLabels = ['Home', 'Experience', 'Education', 'Certifications']
    const actualLabels = drawerLinks.map((a) => a.textContent?.trim())
    expect(actualLabels).toEqual(expectedLabels)

    // Verify each link is focusable by programmatically focusing it and
    // confirming document.activeElement updates (Tab key is not simulatable
    // without user-event; this covers the focus-order contract at the DOM level)
    drawerLinks.forEach((link) => {
      link.focus()
      expect(document.activeElement).toBe(link)
    })
  })
})
