/**
 * Backend-prerequisite capability gates. Each flag mirrors a BP in
 * 03-API-Integration.md §9. Flip a flag to true only after verifying the
 * endpoint is reachable at the gateway.
 */
export const FEATURES = {
  /** BP-01 - GET/POST /api/permissions/** */
  permissions: true,
  /** BP-02 - GET/PUT /api/rsvps/{id} */
  rsvpUpdate: true,
  /** BP-03 - Event.visibility field + ?visibility= filter */
  eventVisibility: true,
  /** BP-04/05/06 - server search/sort/pagination/timeframe/tagId */
  serverEventQuery: true,
  /** BP-07 - GET /api/events/my */
  myEventsEndpoint: true,
  /** BP-09 - PUT /api/events/{id}/complete */
  eventComplete: true,
  /** BP-10 - RSVP EventTitle */
  rsvpEventTitle: true,
  /** BP-11 - public RSVP counts (going / popularity) */
  eventGoing: true,
  /** BP-12 - server excludes Draft/Cancelled from anonymous reads */
  serverVisibilityFilter: true,
} as const

export type FeatureFlag = keyof typeof FEATURES
