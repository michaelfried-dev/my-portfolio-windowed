'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeSwitcher } from './theme-switcher'

// Collapse nav to hamburger below w700 (max-width: 700px).
// At w700 the sidebar has already shrunk to 70px (w600) or gone (w500),
// making a horizontal 5-column nav bar too cramped.
// Desktop (≥700px wide) keeps the original grid layout unchanged.

export default function Nav() {
  const path = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/experience', label: 'Experience' },
    { href: '/education', label: 'Education' },
    { href: '/certifications', label: 'Certifications' },
  ]

  const close = useCallback(() => {
    setIsOpen(false)
    // Return focus synchronously — by the time close() is called (Escape key or
    // link click), React has already committed the state update and the button
    // is focusable. Synchronous focus is more predictable across browsers than rAF.
    toggleRef.current?.focus()
  }, [])

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  return (
    <nav className="border-b-border rounded-tr-base border-b-4 bg-black text-xl w600:text-base portrait:rounded-none">
      {/* Mobile collapsed bar — visible below w700 (max-width: 700px) */}
      <div className="w700:flex hidden h-[50px] w-full items-center justify-between">
        {/* Current page label shown in the collapsed bar */}
        <span className="text-main-foreground px-4 text-sm font-semibold uppercase tracking-wide">
          {links.find((l) => l.href === path)?.label ?? 'Menu'}
        </span>

        <div className="flex h-full items-center">
          <ThemeSwitcher />
          <button
            ref={toggleRef}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setIsOpen((prev) => !prev)}
            className="border-border flex h-full w-[50px] items-center justify-center border-l-2 bg-black text-white"
          >
            {isOpen ? (
              <X size={22} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={2.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer — slides open below the collapsed bar.
          Focus is intentionally NOT trapped: this is a disclosure/dropdown
          pattern, not a modal. Users can Tab past it to reach page content.
          Do not add a focus trap here. */}
      <div
        id="mobile-nav-drawer"
        role="region"
        aria-label="Navigation links"
        className={clsx(
          'w700:flex hidden flex-col',
          !isOpen && 'w700:hidden',
        )}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={path === link.href ? 'page' : undefined}
            onClick={close}
            className={clsx(
              'border-border flex h-12 min-h-[48px] w-full items-center justify-center overflow-hidden border-t-4 px-2 text-center uppercase',
              path === link.href
                ? 'bg-black text-white'
                : 'text-main-foreground bg-main',
            )}
          >
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Desktop grid row — visible at w700 and above (min-width > 700px) */}
      <div
        aria-label="Main navigation"
        className="w700:hidden grid h-[50px] grid-cols-[1fr_1fr_1fr_1fr_50px]"
      >
        {links.map((link, index) => (
          <Link
            key={link.href}
            aria-current={path === link.href ? 'page' : undefined}
            className={clsx(
              'flex h-full w-full items-center justify-center overflow-hidden px-2 text-center uppercase',
              index !== 0 && 'border-border border-l-4',
              path === link.href
                ? 'bg-black text-white'
                : 'text-main-foreground bg-main',
            )}
            href={link.href}
          >
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
        <div className="border-border bg-main text-main-foreground flex h-full w-full items-center justify-center border-l-4">
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  )
}
