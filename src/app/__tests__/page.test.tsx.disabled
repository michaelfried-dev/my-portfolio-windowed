import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'

describe('Page', () => {
  it('renders the main heading', () => {
    render(<Page />)
    // The text is now split across multiple elements with "Michael" in a <strong> tag
    const heading = screen.getByText(/Hi, I'm/i)
    const name = screen.getByText('Michael')
    expect(heading).toBeInTheDocument()
    expect(name).toBeInTheDocument()
    expect(name.tagName).toBe('STRONG')
  })

  it('renders all social and contact links', () => {
    render(<Page />)

    // Check for the GitHub contact link
    const githubContactLink = screen.getByRole('link', {
      name: /Contact Michael Fried via GitHub/i,
    })
    expect(githubContactLink).toBeInTheDocument()
    expect(githubContactLink).toHaveAttribute(
      'href',
      'https://github.com/michaelfried-dev',
    )

    // Check for the repository link in the text
    const repoLink = screen.getByRole('link', {
      name: /View the source code for this portfolio website on GitHub/i,
    })
    expect(repoLink).toBeInTheDocument()
    expect(repoLink).toHaveAttribute(
      'href',
      'https://github.com/michaelfried-dev/my-portfolio-windowed',
    )
    expect(repoLink).toHaveClass('underline')

    // Check for other contact links to ensure they are still present
    expect(
      screen.getByRole('link', { name: /Contact Michael Fried via Email/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Contact Michael Fried via LinkedIn/i }),
    ).toBeInTheDocument()
  })
})
