export type FieldErrors = Record<string, string>

export interface NormalizedError {
  message: string
  status: number
  code: number
  fieldErrors: FieldErrors
  isNetwork: boolean
}
