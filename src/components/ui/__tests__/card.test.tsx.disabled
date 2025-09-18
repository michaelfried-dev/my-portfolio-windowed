import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children and applies default and custom classes', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Hello Card
        </Card>,
      )
      const cardElement = screen.getByTestId('card')
      expect(cardElement).toBeInTheDocument()
      expect(cardElement).toHaveTextContent('Hello Card')
      expect(cardElement).toHaveClass(
        'bg-card text-card-foreground rounded-base border-border border-4 shadow-[8px_8px_0_0_#000]',
      )
      expect(cardElement).toHaveClass('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('renders children and applies classes', () => {
      render(<CardHeader>Header</CardHeader>)
      expect(screen.getByText('Header')).toHaveClass(
        'flex flex-col space-y-1.5 p-6',
      )
    })
  })

  describe('CardTitle', () => {
    it('renders as an h3 with correct classes', () => {
      render(<CardTitle>Title</CardTitle>)
      const titleElement = screen.getByRole('heading', {
        name: 'Title',
        level: 3,
      })
      expect(titleElement).toBeInTheDocument()
      expect(titleElement).toHaveClass(
        'font-semibold leading-none tracking-tight',
      )
    })
  })

  describe('CardDescription', () => {
    it('renders children and applies classes', () => {
      render(<CardDescription>Description</CardDescription>)
      expect(screen.getByText('Description')).toHaveClass(
        'text-muted-foreground text-sm',
      )
    })
  })

  describe('CardContent', () => {
    it('renders children and applies classes', () => {
      render(<CardContent>Content</CardContent>)
      expect(screen.getByText('Content')).toHaveClass('p-6 pt-0')
    })
  })

  describe('CardFooter', () => {
    it('renders children and applies classes', () => {
      render(<CardFooter>Footer</CardFooter>)
      expect(screen.getByText('Footer')).toHaveClass(
        'flex items-center p-6 pt-0',
      )
    })
  })
})
