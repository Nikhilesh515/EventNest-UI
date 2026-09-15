import type { MosaicSlot } from '../lib/mosaic';
import { fillerVariant } from '../lib/mosaic';

interface FillerTileProps {
  slot: MosaicSlot;
  variant?: string;
}

export function FillerTile({ slot, variant }: FillerTileProps) {
  const v = variant ?? fillerVariant(slot.index);
  return (
    <div
      className={`tile tile--mini ${slot.cls}`}
      style={{ '--tile-rot': `${slot.rot}deg` } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className={`tile__filler filler--${v}`}>花</div>
    </div>
  );
}
