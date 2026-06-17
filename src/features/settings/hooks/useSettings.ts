import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { electronService } from '@/services/electron.service'
import { queryKeys } from '@/services/queryKeys'

export function useSettings() {
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: queryKeys.config,
    queryFn: () => electronService.getConfig()
  })

  const updateMutation = useMutation({
    mutationFn: (updates: { delay_throttle?: number; sinc_intervalo_horas?: number }) =>
      electronService.updateConfig(updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.config })
  })

  const selectFolder = useCallback(async () => {
    const result = await electronService.selectBaseFolder()
    if (result) {
      await electronService.saveBaseFolder(result)
      queryClient.invalidateQueries({ queryKey: queryKeys.config })
    }
    return result
  }, [queryClient])

  return {
    config,
    isLoading,
    updateConfig: updateMutation.mutate,
    selectFolder,
    isUpdating: updateMutation.isPending
  }
}
