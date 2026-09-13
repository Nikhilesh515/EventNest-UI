import { describe, expect, it } from 'vitest'

import { composeMosaic, fillerVariant, FILLER_VARIANTS } from './mosaic'

const items = (n: number) => Array.from({ length: n }, (_, index) => index + 1)

describe('composeMosaic', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 3],
    [9, 3],
  ])('%i events → last band %i', (count, band) => {
    expect(composeMosaic(items(count)).lastBand).toBe(band)
  })

  it('renders bands contiguously from band 1 and never a band without an event', () => {
    for (let count = 1; count <= 9; count += 1) {
      const { assignments, lastBand } = composeMosaic(items(count))
      const rendered = assignments.filter(({ slot }) => slot.band <= lastBand)
      const bandsWithEvents = new Set(
        rendered.filter(({ item }) => item !== null).map(({ slot }) => slot.band),
      )
      expect(rendered.every(({ slot }) => slot.band >= 1)).toBe(true)
      for (let band = 1; band <= lastBand; band += 1) {
        expect(bandsWithEvents.has(band)).toBe(true)
      }
    }
  })

  it('leaves every rendered event slot accounted for so it can be filled or backfilled', () => {
    for (let count = 0; count <= 9; count += 1) {
      const { assignments, lastBand } = composeMosaic(items(count))
      const rendered = assignments.filter(({ slot }) => slot.band <= lastBand)
      const eventSlots = rendered.filter(({ slot }) => slot.kind !== 'filler')
      const filled = eventSlots.filter(({ item }) => item !== null)
      expect(filled.length).toBe(Math.min(count, eventSlots.length))
    }
  })
})

describe('fillerVariant', () => {
  it('cycles the four pastel tones', () => {
    expect(fillerVariant(0)).toBe(FILLER_VARIANTS[0])
    expect(fillerVariant(1)).toBe(FILLER_VARIANTS[1])
    expect(fillerVariant(4)).toBe(FILLER_VARIANTS[0])
    expect(new Set([0, 1, 2, 3].map(fillerVariant)).size).toBe(4)
  })
})
