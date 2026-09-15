import { describe, it, expect } from 'vitest';
import { composeMosaic, fillerVariant, tilePatternClass, MOSAIC_SLOTS } from './mosaic';

function items(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `e${i}`, title: `Event ${i}` }));
}

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
    expect(composeMosaic(items(count)).lastBand).toBe(band);
  });

  it('returns 13 assignments', () => {
    const { assignments } = composeMosaic(items(3));
    expect(assignments).toHaveLength(13);
  });

  it('fills event slots in order', () => {
    const { assignments } = composeMosaic(items(2));
    const eventSlots = assignments.filter((a) => a.slot.kind !== 'filler');
    expect(eventSlots[0].item).toEqual({ id: 'e0', title: 'Event 0' });
    expect(eventSlots[1].item).toEqual({ id: 'e1', title: 'Event 1' });
    expect(eventSlots[2].item).toBeNull();
  });

  it('filtering by band removes unused slots', () => {
    const { assignments, lastBand } = composeMosaic(items(1));
    const visible = assignments.filter((a) => a.slot.band <= lastBand);
    expect(visible.length).toBeLessThan(13);
    expect(visible.every((a) => a.slot.band <= lastBand)).toBe(true);
  });

  it('0 events returns lastBand 0', () => {
    const { lastBand } = composeMosaic(items(0));
    expect(lastBand).toBe(0);
  });

  it('all 9 events returns lastBand 3', () => {
    const { lastBand } = composeMosaic(items(9));
    expect(lastBand).toBe(3);
  });
});

describe('fillerVariant', () => {
  it('cycles through variants', () => {
    expect(fillerVariant(0)).toBe('sakura');
    expect(fillerVariant(1)).toBe('sora');
    expect(fillerVariant(2)).toBe('yamabuki');
    expect(fillerVariant(3)).toBe('matcha');
    expect(fillerVariant(4)).toBe('sakura');
  });
});

describe('tilePatternClass', () => {
  it('returns a valid pattern class', () => {
    const result = tilePatternClass('test-id-123');
    expect(result).toMatch(/^pattern--/);
  });

  it('is deterministic', () => {
    expect(tilePatternClass('abc')).toBe(tilePatternClass('abc'));
  });

  it('different ids can produce different patterns', () => {
    const patterns = new Set(Array.from({ length: 50 }, (_, i) => tilePatternClass(`id-${i}`)));
    expect(patterns.size).toBeGreaterThan(1);
  });
});

describe('MOSAIC_SLOTS', () => {
  it('has 13 slots', () => {
    expect(MOSAIC_SLOTS).toHaveLength(13);
  });

  it('has exactly 4 fillers', () => {
    expect(MOSAIC_SLOTS.filter((s) => s.kind === 'filler')).toHaveLength(4);
  });

  it('has exactly 9 event slots', () => {
    expect(MOSAIC_SLOTS.filter((s) => s.kind !== 'filler')).toHaveLength(9);
  });

  it('bands are 1, 2, or 3', () => {
    expect(MOSAIC_SLOTS.every((s) => s.band >= 1 && s.band <= 3)).toBe(true);
  });
});
