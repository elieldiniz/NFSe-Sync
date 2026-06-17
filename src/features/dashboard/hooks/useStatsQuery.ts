import { useQuery } from '@tanstack/react-query'
import { electronService } from '@/services/electron.service'
import { queryKeys } from '@/services/queryKeys'

export function useStatsQuery() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => electronService.getStats()
  })
}
