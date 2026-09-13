import { apiClient } from '@/api/client'
import { RSVPS } from '@/api/endpoints'
import type { CreateRsvpRequest, RsvpDetailDto, RsvpDto, UpdateRsvpRequest } from '@/types'

export async function listEventRsvps(
  eventId: string,
  signal?: AbortSignal,
): Promise<RsvpDetailDto[]> {
  const { data } = await apiClient.get<RsvpDetailDto[]>(RSVPS.byEvent(eventId), { signal })
  return data
}

export async function listUserRsvps(
  userId: string,
  signal?: AbortSignal,
): Promise<RsvpDetailDto[]> {
  const { data } = await apiClient.get<RsvpDetailDto[]>(RSVPS.byUser(userId), { signal })
  return data
}

export async function createRsvp(eventId: string, body: CreateRsvpRequest): Promise<RsvpDto> {
  const { data } = await apiClient.post<RsvpDto>(RSVPS.byEvent(eventId), {
    guestCount: body.guestCount,
    notes: body.notes ?? '',
  })
  return data
}

/** @requires BP-02 — PUT /api/rsvps/{id} is not routed at the gateway today. */
export async function updateRsvp(rsvpId: string, body: UpdateRsvpRequest): Promise<RsvpDto> {
  const { data } = await apiClient.put<RsvpDto>(RSVPS.byId(rsvpId), body)
  return data
}

export async function cancelRsvp(eventId: string): Promise<void> {
  await apiClient.delete(RSVPS.byEvent(eventId))
}
