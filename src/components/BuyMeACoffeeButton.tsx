'use client'

import { Button } from '@/components/ui/button'
import { FaCoffee } from 'react-icons/fa'

export default function BuyMeACoffeeButton() {
  return (
    <Button
      asChild
      variant="neutral"
      className="flex w-full items-center justify-center gap-2"
    >
      <a
        href="https://coff.ee/michaelfried"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaCoffee className="size-5" />
        <span>Buy Me a Coffee</span>
      </a>
    </Button>
  )
}
