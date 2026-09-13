import { Link } from 'react-router-dom'

import { ThemeToggle } from './ThemeToggle'

interface TopbarProps {
  onOpenIndex: () => void
  cover?: boolean
}

export function Topbar({ onOpenIndex, cover }: TopbarProps) {
  return (
    <header className="topbar" role="banner">
      <Link className="topbar__brand" to="/events" aria-label="EventNest home">
        <span className="topbar__wordmark">EventNest</span>
        <span className="topbar__hanko" aria-hidden="true">
          祭
        </span>
      </Link>
      <span className="topbar__spacer" />
      {!cover ? (
        <button
          type="button"
          className="btn btn--secondary btn--sm topbar__index"
          aria-haspopup="dialog"
          aria-controls="index-drawer"
          onClick={onOpenIndex}
        >
          Index ▾
        </button>
      ) : null}
      <ThemeToggle variant="topbar" />
    </header>
  )
}
