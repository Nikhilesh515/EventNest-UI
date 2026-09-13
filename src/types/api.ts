export interface ApiResponseDto<T> {
  code: number
  success: boolean
  message: string | null
  result: T | null
  errors: Record<string, string[]> | null
}

export interface ErrorEnvelopeDto {
  error: { code: number; message: string; detail?: string }
}

export interface SearchParams {
  [key: string]: string | number | boolean | undefined | null | string[]
}
