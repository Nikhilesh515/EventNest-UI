export type FillerVariant = 'sakura' | 'sora' | 'yamabuki' | 'matcha';

export const FILLER_VARIANTS: readonly FillerVariant[] = [
  'sakura', 'sora', 'yamabuki', 'matcha',
];

const FILLER_BY_SLOT_INDEX: Record<number, FillerVariant> = {
  2: 'sakura',
  3: 'sora',
  11: 'yamabuki',
  12: 'matcha',
};

const WASHI_VARIANTS = ['sakura', 'sora', 'yamabuki', 'matcha', 'sora', 'sakura'] as const;

export interface MosaicSlot {
  cls: string;
  kind: 'feature' | 'portrait' | 'wide' | 'filler';
  rot: number;
  index: number;
  band: number;
}

export const MOSAIC_SLOTS: MosaicSlot[] = [
  { cls: 'slot--feature-a',  kind: 'feature',  rot: -1.6, index: 0,  band: 1 },
  { cls: 'slot--portrait-a', kind: 'portrait', rot:  1.2, index: 1,  band: 1 },
  { cls: 'slot--filler-1',   kind: 'filler',   rot:  2.0, index: 2,  band: 1 },
  { cls: 'slot--filler-2',   kind: 'filler',   rot: -2.2, index: 3,  band: 1 },
  { cls: 'slot--wide-a',     kind: 'wide',     rot: -0.9, index: 4,  band: 2 },
  { cls: 'slot--wide-b',     kind: 'wide',     rot:  1.5, index: 5,  band: 2 },
  { cls: 'slot--portrait-b', kind: 'portrait', rot: -1.2, index: 6,  band: 2 },
  { cls: 'slot--wide-c',     kind: 'wide',     rot:  0.8, index: 7,  band: 2 },
  { cls: 'slot--wide-d',     kind: 'wide',     rot: -1.4, index: 8,  band: 2 },
  { cls: 'slot--portrait-c', kind: 'portrait', rot:  1.0, index: 9,  band: 3 },
  { cls: 'slot--feature-b',  kind: 'feature',  rot: -0.7, index: 10, band: 3 },
  { cls: 'slot--filler-3',   kind: 'filler',   rot:  1.8, index: 11, band: 3 },
  { cls: 'slot--filler-4',   kind: 'filler',   rot: -1.9, index: 12, band: 3 },
];

export interface MosaicAssignment<T> {
  slot: MosaicSlot;
  item: T | null;
}

export interface MosaicComposition<T> {
  assignments: MosaicAssignment<T>[];
  lastBand: number;
}

export function composeMosaic<T>(items: T[]): MosaicComposition<T> {
  let cursor = 0;
  let lastBand = 0;
  const assignments = MOSAIC_SLOTS.map((slot) => {
    if (slot.kind === 'filler') return { slot, item: null };
    const item = cursor < items.length ? (items[cursor++] ?? null) : null;
    if (item) lastBand = Math.max(lastBand, slot.band);
    return { slot, item };
  });
  return { assignments, lastBand };
}

export function fillerVariant(index: number): FillerVariant {
  return FILLER_BY_SLOT_INDEX[index] ?? 'sakura';
}

export function washiVariant(index: number): string {
  return WASHI_VARIANTS[index % WASHI_VARIANTS.length] ?? 'sakura';
}

export function tilePatternClass(id: string): string {
  const patterns = [
    'pattern--chiyogami-asa', 'pattern--chiyogami-hana',
    'pattern--asanoha', 'pattern--polka-sora', 'pattern--polka-sakura',
  ];
  let seed = 0;
  for (let i = 0; i < id.length; i += 1) seed += id.charCodeAt(i);
  return patterns[seed % patterns.length] ?? 'pattern--chiyogami-asa';
}
