import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'
 
describe('Page', () => {
  it('renders the main heading', () => {
    render(<Page />)
    const heading = screen.getByText(/Hi, I'm Michael!/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders all social and contact links', () => {
    render(<Page />)

    // Check for the GitHub link
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/michaelfried-dev/my-portfolio-windowed',
    )

    // Check for other links to ensure they are still present
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /phone/i })).toBeInTheDocument()
  })
})

