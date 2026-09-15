import { Icon } from './Icon';

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let glyph: React.ReactNode = null;
  if (s === 'draft') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{ border: '2px dashed currentColor', borderRadius: '50%' }}
      />
    );
  } else if (s === 'published') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{ background: 'currentColor', borderRadius: '50%' }}
      />
    );
  } else if (s === 'cancelled') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{ border: '2px solid currentColor', borderRadius: '50%', position: 'relative' }}
      />
    );
  } else if (s === 'completed') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{
          background: 'currentColor',
          clipPath:
            'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
        }}
      />
    );
  }
  return (
    <span className={`badge badge--${s}`}>
      {glyph}
      {status}
    </span>
  );
}

export function VisBadge({ visibility }: { visibility: string }) {
  const isPublic = visibility === 'Public';
  return (
    <span className={`vis-badge vis-badge--${isPublic ? 'public' : 'private'}`}>
      <Icon name={isPublic ? 'eye' : 'user'} size={12} />
      {visibility}
    </span>
  );
}
