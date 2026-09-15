interface Slot {
  cls: string;
  kind: 'filler';
  rot: number;
}

interface FillerTileProps {
  slot: Slot;
  variant: string;
}

export function FillerTile({ slot, variant }: FillerTileProps) {
  return (
    <div
      className={`tile tile--mini ${slot.cls}`}
      style={{ '--tile-rot': `${slot.rot}deg` } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className={`tile__filler filler--${variant}`}>花</div>
    </div>
  );
}
