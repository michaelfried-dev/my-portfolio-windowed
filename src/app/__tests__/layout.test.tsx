import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import type { Viewport } from 'next'
import { metadata } from '../layout'

describe('Layout Metadata', () => {
  it('has the correct viewport settings', () => {
    const viewport = metadata.viewport as Viewport

    // Test the viewport settings
    expect(viewport).toBeDefined()
    expect(viewport.width).toBe('device-width')
    expect(viewport.initialScale).toBe(1)
    expect(viewport.userScalable).toBe(false)
  })

  it('has the correct metadata', () => {
    // Test the metadata settings
    expect(metadata.title).toBeDefined()
    expect(metadata.description).toBeDefined()
    expect(metadata.keywords).toBeDefined()
    expect(metadata.creator).toBeDefined()
    expect(metadata.creator).toContain('Michael Fried')
  })
})

describe('Layout Metadata', () => {
  it('has the correct viewport settings including all required properties', () => {
    const viewport = metadata.viewport as Viewport
    
    // Check that the viewport metadata is correctly set
    expect(viewport).toBeDefined()
    expect(viewport.width).toBe('device-width')
    expect(viewport.initialScale).toBe(1)
    expect(viewport.maximumScale).toBe(1)
    expect(viewport.minimumScale).toBe(1)
    expect(viewport.userScalable).toBe(false)
    expect(viewport.viewportFit).toBe('cover')
    expect(viewport.interactiveWidget).toBe('resizes-visual')
  })

  it('has the correct title and description', () => {
    expect(metadata.title).toBeDefined()

    // Type assertion for title which can be string | TitleTemplate
    const title = metadata.title as { default: string; template: string }
    expect(title.default).toBe('Michael Fried - Portfolio')
    expect(title.template).toBe('%s | Michael Fried')

    expect(metadata.description).toBe(
      "Michael Fried's professional portfolio showcasing software engineering expertise, AI-powered chatbot assistance, and innovative projects built with modern web technologies.",
    )
  })
})
