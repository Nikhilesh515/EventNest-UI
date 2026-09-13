export const rsvpKeys = {
  all: ['rsvps'] as const,
  byEvent: (eventId: string) => [...rsvpKeys.all, 'event', eventId] as const,
  byUser: (userId: string) => [...rsvpKeys.all, 'user', userId] as const,
}
