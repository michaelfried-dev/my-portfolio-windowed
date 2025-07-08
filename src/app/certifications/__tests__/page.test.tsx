import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CertificationsPage from '../page'

describe('CertificationsPage', () => {
  beforeEach(() => {
    render(<CertificationsPage />)
  })

  it('should render the main heading', () => {
    const heading = screen.getByRole('heading', { name: /Certifications/i, level: 3 })
    expect(heading).toBeInTheDocument()
  })

  it('should render all certification names', () => {
    const cert1 = screen.getByRole('heading', {
      name: /ICAgile Certified Professional - Agile Testing \(ICP-TST\)/i,
      level: 3,
    })
    const cert2 = screen.getByRole('heading', {
      name: /ICAgile Certified Professional - Agile Test Automation \(ICP-ATA\)/i,
      level: 3,
    })

    expect(cert1).toBeInTheDocument()
    expect(cert2).toBeInTheDocument()
  })

  it('should render all certification dates', () => {
    const dates = screen.getAllByText(/Completed March 1st, 2017/i)
    expect(dates).toHaveLength(2)
  })
})
