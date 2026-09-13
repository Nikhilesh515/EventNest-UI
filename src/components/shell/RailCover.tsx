import { Link } from 'react-router-dom'

export function RailCover() {
  return (
    <div className="album-rail__cover">
      <div className="album-rail__cover-tile pattern pattern--chiyogami-hana" aria-hidden="true" />
      <Link className="album-rail__brand" to="/events" aria-label="EventNest home">
        <span className="wordmark">EventNest</span>
        <span className="hanko hanko--sm" aria-hidden="true">
          祭
        </span>
        <span className="album-rail__edition" aria-hidden="true">
          Vol. 01 · Scrapbook
        </span>
      </Link>
    </div>
  )
}
