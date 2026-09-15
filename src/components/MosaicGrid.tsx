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

interface Slot {
  cls: string;
  kind: 'feature' | 'portrait' | 'wide' | 'filler';
  rot: number;
}

const SLOTS: Slot[] = [
  { cls: 'slot--feature-a',  kind: 'feature',  rot: -1.6 },
  { cls: 'slot--portrait-a', kind: 'portrait', rot:  1.2 },
  { cls: 'slot--filler-1',   kind: 'filler',   rot:  2.0 },
  { cls: 'slot--filler-2',   kind: 'filler',   rot: -2.2 },
  { cls: 'slot--wide-a',     kind: 'wide',     rot: -0.9 },
  { cls: 'slot--wide-b',     kind: 'wide',     rot:  1.5 },
  { cls: 'slot--portrait-b', kind: 'portrait', rot: -1.2 },
  { cls: 'slot--wide-c',     kind: 'wide',     rot:  0.8 },
  { cls: 'slot--wide-d',     kind: 'wide',     rot: -1.4 },
  { cls: 'slot--portrait-c', kind: 'portrait', rot:  1.0 },
  { cls: 'slot--feature-b',  kind: 'feature',  rot: -0.7 },
  { cls: 'slot--filler-3',   kind: 'filler',   rot:  1.8 },
  { cls: 'slot--filler-4',   kind: 'filler',   rot: -1.9 },
];

const FILLER_CLASSES = ['slot--filler-1', 'slot--filler-2', 'slot--filler-3', 'slot--filler-4'];
const FILLER_VARIANTS = ['sakura', 'sora', 'yamabuki', 'matcha'];

interface MosaicGridProps {
  events: Event[];
}

export function MosaicGrid({ events }: MosaicGridProps) {
  let eventIndex = 0;

  return (
    <div className="mosaic" role="list" aria-label="Events">
      {SLOTS.map((slot) => {
        if (slot.kind === 'filler') {
          const fillerIdx = FILLER_CLASSES.indexOf(slot.cls);
          const variant = FILLER_VARIANTS[fillerIdx >= 0 ? fillerIdx : 0];
          const fillerSlot = { cls: slot.cls, kind: 'filler' as const, rot: slot.rot };
          return <FillerTile key={slot.cls} slot={fillerSlot} variant={variant} />;
        }

        const event = events[eventIndex];
        eventIndex++;

        if (!event) {
          return <div key={slot.cls} className={`tile tile--empty ${slot.cls}`} style={{ '--tile-rot': `${slot.rot}deg` } as React.CSSProperties} aria-hidden="true" />;
        }

        return <PolaroidTile key={event.id} event={event} slot={slot} />;
      })}
    </div>
  );
}
