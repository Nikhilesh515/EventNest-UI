interface CapacityMeterProps {
  going: number;
  capacity: number;
}

export function CapacityMeter({ going, capacity }: CapacityMeterProps) {
  const pct = capacity > 0 ? Math.min(100, (going / capacity) * 100) : 0;
  const left = Math.max(0, capacity - going);
  const variant = pct >= 100 ? 'full' : pct >= 80 ? 'near' : '';

  return (
    <div>
      <div className={`capacity${variant ? ` capacity--${variant}` : ''}`}>
        <div className="capacity__meta">
          <span>Going</span>
          <span className="capacity__num tnum">{going} / {capacity} going</span>
        </div>
        <div
          className="capacity__track"
          role="progressbar"
          aria-valuenow={going}
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-valuetext={`${going} of ${capacity} going`}
        >
          <div className="capacity__fill" style={{ '--cap-pct': `${pct}%` } as React.CSSProperties} />
        </div>
      </div>
      <p className="field__hint" style={{ marginTop: 'var(--space-2)' }}>
        {left > 0 ? `${left} spots left` : 'This event is full.'}
      </p>
    </div>
  );
}
