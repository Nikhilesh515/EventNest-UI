import { useQuery } from '@tanstack/react-query'

import { listTags } from './api'
import { tagKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60_000

export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: ({ signal }) => listTags(signal),
    staleTime: FIVE_MINUTES,
  })
}
