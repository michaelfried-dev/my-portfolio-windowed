import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExperiencePage from '../page'

const experience = [
  {
    company: 'Lincoln Financial Group',
    title: 'Software Engineer',
    location: 'Philadelphia, PA',
    date: 'January 2023 - November 2024',
  },
  {
    company: 'SoFi',
    title: 'Software Engineer',
    location: 'Claymont, Delaware',
    date: 'January 2020 - January 2023',
  },
  {
    company: 'Agile Trailblazers',
    title: 'Software Development Engineer',
    location: 'Media, Pennsylvania',
    date: 'February 2016 - December 2019',
  },
  {
    company: 'Fiserv',
    title: 'Software Development Engineer',
    location: 'King of Prussia, Pennsylvania',
    date: 'July 2013 – January 2016',
  },
  {
    company: 'Lockheed Martin',
    title: 'Software Engineer/Web Developer',
    location: 'Cherry Hill, New Jersey',
    date: 'April 2011 – September 2012',
  },
  {
    company: 'Wharton Business School',
    title: 'Computer Support Representative',
    location: 'Philadelphia, Pennsylvania',
    date: 'March 2010 – September 2010',
  },
]

describe('ExperiencePage', () => {
  beforeEach(() => {
    render(<ExperiencePage />)
  })

  it('should render all company names as headings', () => {
    experience.forEach((job) => {
      const heading = screen.getByRole('heading', {
        name: job.company,
        level: 3,
      })
      expect(heading).toBeInTheDocument()
    })
  })

  it('should render all job titles', () => {
    experience.forEach((job) => {
      const titles = screen.getAllByText(job.title)
      expect(titles.length).toBeGreaterThan(0)
      titles.forEach((title) => expect(title).toBeInTheDocument())
    })
  })

  it('should render all locations and dates', () => {
    experience.forEach((job) => {
      const locationAndDate = screen.getByText(`${job.location} | ${job.date}`)
      expect(locationAndDate).toBeInTheDocument()
    })
  })

  it('should render the correct number of job cards', () => {
    const jobCards = screen.getAllByRole('heading', { level: 3 })
    expect(jobCards).toHaveLength(experience.length)
  })
})
