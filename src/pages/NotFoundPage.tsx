import { Link } from 'react-router-dom'

import { Mascot } from '@/components/brand/Mascot'

export default function NotFoundPage() {
  return (
    <div style={{ paddingTop: 'var(--space-12)' }}>
      <div className="empty" role="status">
        <div className="empty__mascot" aria-hidden="true" style={{ width: 120, height: 120 }}>
          <Mascot kind="kokeshi" />
        </div>
        <h1 className="empty__title">This stall has packed up.</h1>
        <p className="empty__body">
          We couldn&apos;t find that page. It may have been removed, or the link may be off by a
          sticker.
        </p>
        <div className="cluster">
          <Link className="btn btn--primary" to="/events">
            Back to events
          </Link>
        </div>
      </div>
    </div>
  )
}
