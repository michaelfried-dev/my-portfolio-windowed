'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from './theme-switcher'

export default function Nav() {
  const path = usePathname()
  const links = [
    { href: '/', label: 'Home' },
    { href: '/experience', label: 'Experience' },
    { href: '/education', label: 'Education' },
    { href: '/certifications', label: 'Certifications' },
  ]

  return (
    <nav className="border-b-border rounded-tr-base w-full flex flex-col md:grid md:h-[50px] md:grid-cols-[1fr_1fr_1fr_1fr_50px] border-b-4 bg-black text-base sm:text-xl portrait:rounded-none">
      {links.map((link, index) => (
        <Link
          key={link.href}
          className={clsx(
            'flex h-12 min-h-[48px] w-full items-center justify-center overflow-hidden px-2 text-center uppercase md:h-full',
            // Add a top border to create separation in the stacked mobile view
            // The border is not applied to the first item
            index !== 0 && 'border-t-4 border-border md:border-t-0',
            path === link.href
              ? 'bg-black text-white'
              : 'text-main-foreground bg-main',
          )}
          href={link.href}
        >
          <span className="truncate">{link.label}</span>
        </Link>
      ))}
      {/* Wrapper for ThemeSwitcher to handle mobile border and alignment */}
      <div className="hidden h-12 min-h-[48px] w-full items-center justify-center border-t-4 border-border bg-main text-main-foreground md:flex md:h-full md:border-t-0">
        <ThemeSwitcher />
      </div>
    </nav>
  )
}
