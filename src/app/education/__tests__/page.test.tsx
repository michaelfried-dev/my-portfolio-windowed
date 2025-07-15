import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import EducationPage from '../page'

describe('EducationPage', () => {
  beforeEach(() => {
    render(<EducationPage />)
  })

  it('should render the main heading', () => {
    const heading = screen.getByRole('heading', {
      name: /Education/i,
      level: 3,
    })
    expect(heading).toBeInTheDocument()
  })

  it('should render the degree information', () => {
    const degree = screen.getByRole('heading', {
      name: /Bachelor of Science \(BS\), Software Engineering/i,
      level: 3,
    })
    expect(degree).toBeInTheDocument()
  })

  it('should render the school, location, and date', () => {
    const schoolInfo = screen.getByText(
      /Drexel University | Philadelphia, Pennsylvania | August 2008 - July 2013/i,
    )
    expect(schoolInfo).toBeInTheDocument()
  })

  it('should render the minor', () => {
    const minor = screen.getByText(/Minor: Computer Science/i)
    expect(minor).toBeInTheDocument()
  })

  it('should render the GPA', () => {
    const gpa = screen.getByText(/Cumulative GPA: 3.37/i)
    expect(gpa).toBeInTheDocument()
  })
})
