export type EventAction = 'publish' | 'cancel' | 'complete';

export const EVENT_ACTION_LABELS: Record<EventAction, string> = {
  publish: 'Event published',
  cancel: 'Event cancelled',
  complete: 'Event marked complete',
};
