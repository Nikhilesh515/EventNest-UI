export type RsvpStatus = 'Confirmed' | 'Maybe' | 'Declined' | 'Cancelled'
export type RsvpUiKey = 'going' | 'maybe' | 'notgoing' | 'cancelled'
export type RsvpUiLabel = 'Going' | 'Maybe' | 'Not Going' | 'Cancelled'

export interface RsvpDto {
  id: string
  userId: string
  eventId: string
  userName: string
  status: RsvpStatus
  guestCount: number
  notes: string
  respondedAt: string
  createdAt: string
}

export interface RsvpDetailDto extends RsvpDto {
  eventTitle: string | null
  userEmail: string | null
  active: boolean
}

export interface CreateRsvpRequestDto {
  guestCount: number
  notes?: string
}

export interface UpdateRsvpRequestDto {
  status?: RsvpStatus
  guestCount?: number
  notes?: string
}

export interface CreateRsvpRequest {
  guestCount: number
  notes?: string
}

export interface UpdateRsvpRequest {
  status: RsvpStatus
  guestCount?: number
  notes?: string
}
