import React from 'react'
import { render, screen } from '@testing-library/react'
import BuyMeACoffeeButton from '../BuyMeACoffeeButton'

describe('BuyMeACoffeeButton', () => {
  it('renders a link with the correct href', () => {
    render(<BuyMeACoffeeButton />)

    const link = screen.getByRole('link', { name: /buy me a coffee/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://coff.ee/michaelfried')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has the correct styling classes', () => {
    render(<BuyMeACoffeeButton />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('flex')
    expect(link).toHaveClass('w-full')
    expect(link).toHaveClass('items-center')
    expect(link).toHaveClass('justify-center')
    expect(link).toHaveClass('gap-2')
  })
})
