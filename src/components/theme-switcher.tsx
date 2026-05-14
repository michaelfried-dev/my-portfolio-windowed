'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import * as React from 'react'

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <button
      className="flex h-full w-full items-center justify-center p-0"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="stroke-main-foreground hidden size-6 dark:inline" />
      <Moon className="stroke-main-foreground inline size-6 dark:hidden" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
