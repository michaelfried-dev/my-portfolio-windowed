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
    <nav className="border-b-border rounded-tr-base w600:text-lg w400:h-10 w400:text-base grid h-[50px] grid-cols-[1fr_1fr_1fr_1fr_50px] border-b-4 bg-black text-xl portrait:rounded-none">
      {links.map((link) => (
        <Link
          key={link.href}
          className={clsx(
            'flex h-full items-center justify-center uppercase',
            path === link.href
              ? 'bg-black text-white'
              : 'text-main-foreground bg-main',
          )}
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
      <ThemeSwitcher />
    </nav>
  )
}
