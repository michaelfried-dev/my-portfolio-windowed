import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExperiencePage from '../page'
import { EXPERIENCE } from '@/lib/constants'

describe('ExperiencePage', () => {
  beforeEach(() => {
    render(<ExperiencePage />)
  })

  it('should render all company names as headings', () => {
    EXPERIENCE.forEach((job) => {
      const heading = screen.getByRole('heading', {
        name: job.company,
        level: 3,
      })
      expect(heading).toBeInTheDocument()
    })
  })

  it('should render all job titles', () => {
    EXPERIENCE.forEach((job) => {
      const titles = screen.getAllByText(job.title)
      expect(titles.length).toBeGreaterThan(0)
      titles.forEach((title) => expect(title).toBeInTheDocument())
    })
  })

  it('should render all locations and dates when available', () => {
    EXPERIENCE.forEach((job) => {
      // Skip entries without location/date (e.g. Personal Projects)
      if (!('location' in job) || !('date' in job)) return

      const locationAndDate = screen.getByText(`${job.location} | ${job.date}`)
      expect(locationAndDate).toBeInTheDocument()
    })
  })

  it('should render the correct number of job cards', () => {
    const jobCards = screen.getAllByRole('heading', { level: 3 })
    expect(jobCards).toHaveLength(EXPERIENCE.length)
  })
})
