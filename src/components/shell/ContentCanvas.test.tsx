import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { ContentCanvas } from './ContentCanvas'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('ContentCanvas', () => {
  it('renders a focusable main region carrying the template + density', () => {
    renderWithProviders(
      <ContentCanvas template="collage" density="festival" width="100%">
        <p>Sheet</p>
      </ContentCanvas>,
    )
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-view')
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(main).toHaveAttribute('data-density', 'festival')
    expect(screen.getByText('Sheet').closest('.template')).toHaveClass('template--collage')
  })
})
