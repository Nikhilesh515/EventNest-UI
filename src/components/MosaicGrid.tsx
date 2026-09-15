import { composeMosaic } from '../lib/mosaic';
import { PolaroidTile } from './PolaroidTile';
import { FillerTile } from './FillerTile';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  goingCount: number;
  organizerId: string;
  organizerName: string;
  status: string;
  visibility: string;
  tags: EventTag[];
  createdAt: string;
}

interface MosaicGridProps {
  events: Event[];
  taped?: boolean;
}

export function MosaicGrid({ events, taped = false }: MosaicGridProps) {
  const { assignments, lastBand } = composeMosaic(events);
  if (lastBand === 0) return null;

  return (
    <div className="mosaic" role="list" aria-label="Events">
      {assignments
        .filter(({ slot }) => slot.band <= lastBand)
        .map(({ slot, item }) => {
          if (slot.kind === 'filler') {
            return <FillerTile key={slot.cls} slot={slot} />;
          }
          if (!item) {
            return (
              <div
                key={slot.cls}
                className={`tile tile--empty ${slot.cls}`}
                style={{ '--tile-rot': `${slot.rot}deg` } as React.CSSProperties}
                aria-hidden="true"
              />
            );
          }
          return <PolaroidTile key={item.id} event={item} slot={slot} taped={taped} />;
        })}
    </div>
  );
}
