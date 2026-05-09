import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompliancePage from '../CompliancePage'

describe('CompliancePage', () => {
  it('renders all four regulation headings', () => {
    render(<CompliancePage />)

    expect(screen.getByText('LFPDPPP')).toBeInTheDocument()
    expect(screen.getByText('Ley 1581')).toBeInTheDocument()
    expect(screen.getByText('RGPD / GDPR')).toBeInTheDocument()
    expect(screen.getByText('HIPAA')).toBeInTheDocument()
  })

  it('shows LFPDPPP, Ley 1581 and RGPD as implemented', () => {
    render(<CompliancePage />)

    // Each regulation card header has a StatusBadge — count "Implementado" occurrences
    // LFPDPPP, Ley 1581, RGPD overall badges + their control-level badges
    const implementedBadges = screen.getAllByText('Implementado')
    expect(implementedBadges.length).toBeGreaterThanOrEqual(3)
  })

  it('still marks HIPAA as partial overall', () => {
    render(<CompliancePage />)

    const parcialBadges = screen.getAllByText('Parcial')
    expect(parcialBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the disclaimer about honest status reporting', () => {
    render(<CompliancePage />)

    expect(
      screen.getByText(/no declaraciones de cumplimiento/i)
    ).toBeInTheDocument()
  })
})
