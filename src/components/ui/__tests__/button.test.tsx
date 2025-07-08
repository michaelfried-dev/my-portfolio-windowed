import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button, buttonVariants } from '../button'

describe('Button component', () => {
  it('renders a default button', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass(buttonVariants({ variant: 'default', size: 'default' }))
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="noShadow">No Shadow</Button>)
    expect(screen.getByRole('button')).toHaveClass(buttonVariants({ variant: 'noShadow' }))

    rerender(<Button variant="neutral">Neutral</Button>)
    expect(screen.getByRole('button')).toHaveClass(buttonVariants({ variant: 'neutral' }))

    rerender(<Button variant="reverse">Reverse</Button>)
    expect(screen.getByRole('button')).toHaveClass(buttonVariants({ variant: 'reverse' }))
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass(buttonVariants({ size: 'sm' }))

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass(buttonVariants({ size: 'lg' }))

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByRole('button')).toHaveClass(buttonVariants({ size: 'icon' }))
  })

  it('renders as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/">Link</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: /link/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveClass(buttonVariants())
    // Check that it's not a button element
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('is disabled when the disabled attribute is passed', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })
})
