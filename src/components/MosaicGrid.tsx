import { composeMosaic, fillerVariant } from '../lib/mosaic';
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
  organizerId: string;
  organizerName: string;
  status: string;
  visibility: string;
  tags: EventTag[];
  createdAt: string;
}

interface MosaicGridProps {
  events: Event[];
}

export function MosaicGrid({ events }: MosaicGridProps) {
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
            return <FillerTile key={slot.cls} slot={slot} variant={fillerVariant(slot.index)} />;
          }
          return <PolaroidTile key={item.id} event={item} slot={slot} />;
        })}
    </div>
  );
}
