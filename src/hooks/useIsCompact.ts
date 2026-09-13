import { useMediaQuery } from './useMediaQuery'

export const COMPACT_QUERY = '(max-width: 1023.98px)'

export function useIsCompact(): boolean {
  return useMediaQuery(COMPACT_QUERY)
}
