import type { CreateEventRequest, RegisterInput } from '@/types'

export type FieldErrors = Record<string, string>

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  return errors
}

export function validateRegister(values: RegisterInput & { confirmPassword: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.displayName.trim()) errors.displayName = 'Display name is required.'
  else if (values.displayName.length > 100)
    errors.displayName = 'Display name must be 100 characters or fewer.'
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function validateEvent(values: CreateEventRequest): FieldErrors {
  const errors: FieldErrors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Give your event a title.'
  else if (title.length > 200) errors.title = 'That title is a bit long (200 max).'
  if (values.description && values.description.length > 2000)
    errors.description = "That's over 2000 characters."
  if (values.location && values.location.length > 300)
    errors.location = 'Location can be at most 300 characters.'
  if (!values.start || Number.isNaN(new Date(values.start).getTime())) {
    errors.start = 'Pick a start time in the future.'
  } else if (new Date(values.start).getTime() <= Date.now()) {
    errors.start = 'Pick a start time in the future.'
  }
  if (!values.end || Number.isNaN(new Date(values.end).getTime())) {
    errors.end = 'Pick an end time.'
  } else if (values.start && new Date(values.end).getTime() <= new Date(values.start).getTime()) {
    errors.end = 'End must be after the start.'
  }
  if (!Number.isInteger(values.capacity) || values.capacity < 0) {
    errors.capacity = 'Capacity must be 0 or more.'
  }
  return errors
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
