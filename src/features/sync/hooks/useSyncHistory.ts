import { useQuery } from '@tanstack/react-query'
import { electronService } from '@/services/electron.service'
import { queryKeys } from '@/services/queryKeys'

export function useSyncHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: queryKeys.syncHistory,
    queryFn: () => electronService.getSyncHistory()
  })

  return {
    history: history ?? [],
    isLoading
  }
}
