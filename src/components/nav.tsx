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
    // Default to flex-col for stacked layout on mobile, switch to grid on desktop
    <nav className="border-b-border rounded-tr-base w600:text-lg w400:h-10 w400:text-base flex flex-col md:grid md:h-[50px] md:grid-cols-[1fr_1fr_1fr_1fr_50px] border-b-4 bg-black text-xl portrait:rounded-none">
      {links.map((link, index) => (
        <Link
          key={link.href}
          className={clsx(
            'flex h-[50px] w-full items-center justify-center uppercase md:h-full px-2',
            // Add a top border to create separation in the stacked mobile view
            // The border is not applied to the first item
            index !== 0 && 'border-t-4 border-border md:border-t-0',
            path === link.href
              ? 'bg-black text-white'
              : 'text-main-foreground bg-main',
          )}
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
      {/* Wrapper for ThemeSwitcher to handle mobile border and alignment */}
      <div className="flex h-[50px] w-full items-center justify-center border-t-4 border-border bg-main text-main-foreground md:h-full md:border-t-0">
        <ThemeSwitcher />
      </div>
    </nav>
  )
}
