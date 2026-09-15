interface RsvpData {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  status: string;
  guestCount: number;
  notes: string | null;
  respondedAt: string;
}

interface AttendeeTableProps {
  attendees: RsvpData[];
  filter: string;
}

const STATUS_MAP: Record<string, { label: string; cssClass: string }> = {
  Confirmed: { label: 'Going', cssClass: 'rsvp-chip--going' },
  Maybe: { label: 'Maybe', cssClass: 'rsvp-chip--maybe' },
  Declined: { label: 'Not Going', cssClass: 'rsvp-chip--notgoing' },
  Cancelled: { label: 'Cancelled', cssClass: 'rsvp-chip--cancelled' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AttendeeTable({ attendees, filter }: AttendeeTableProps) {
  const filtered = filter === 'all'
    ? attendees
    : attendees.filter((a) => {
        const map: Record<string, string> = { going: 'Confirmed', maybe: 'Maybe', notgoing: 'Declined', cancelled: 'Cancelled' };
        return a.status === map[filter];
      });

  return (
    <div className="table-scroll guestbook-table">
      <table className="table-punch">
        <caption className="sr-only">Guest list</caption>
        <thead>
          <tr>
            <th scope="col">Guest</th>
            <th scope="col">Status</th>
            <th scope="col" className="num">Guests</th>
            <th scope="col">Notes</th>
            <th scope="col">Responded</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const status = STATUS_MAP[a.status] || { label: a.status, cssClass: '' };
            return (
              <tr key={a.id}>
                <td data-label="Guest">
                  <div className="guestbook-table__guest">
                    <span className="guestbook-table__frame" aria-hidden="true">{getInitials(a.userName)}</span>
                    <div className="table-punch__guest">
                      <span className="name">{a.userName}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Status">
                  <span className={`rsvp-chip ${status.cssClass}`}>{status.label}</span>
                </td>
                <td data-label="Guests" className="num tnum">{a.guestCount}</td>
                <td data-label="Notes">
                  <span className="table-punch__notes">{a.notes || '—'}</span>
                </td>
                <td data-label="Responded">
                  <time dateTime={a.respondedAt}>{formatDate(a.respondedAt)}</time>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                No attendees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="pager-meta" style={{ padding: 'var(--space-4) 0' }}>{filtered.length} records</p>
    </div>
  );
}
