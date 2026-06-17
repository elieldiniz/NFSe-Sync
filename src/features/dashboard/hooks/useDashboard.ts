import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { electronService } from '@/services/electron.service'
import { useSyncStore } from '@/store/sync.store'
import { queryKeys } from '@/services/queryKeys'

export function useDashboard() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { setSyncing, setQueue, setCurrentCompany, setCurrentNsu, setDocumentosProcessados, reset } =
    useSyncStore()

  useEffect(() => {
    const handleProgress = (data: { empresa?: string; nsu?: number; documentosProcessados?: number }) => {
      if (data.empresa) setCurrentCompany(data.empresa)
      if (data.nsu) setCurrentNsu(data.nsu)
      if (data.documentosProcessados !== undefined) setDocumentosProcessados(data.documentosProcessados)
    }

    const handleQueueUpdate = (data: { id: string; status: string }) => {
      const { queue } = useSyncStore.getState()
      const updated = queue.map((item) =>
        item.id === data.id ? { ...item, status: data.status as 'aguardando' | 'processando' | 'concluido' | 'erro' } : item
      )
      setQueue(updated)
    }

    const handleComplete = () => {
      setSyncing(false)
      reset()
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
    }

    electronService.onSyncProgress(handleProgress)
    electronService.onSyncQueueUpdate(handleQueueUpdate)
    electronService.onSyncQueueComplete(handleComplete)

    return () => {
      electronService.removeSyncListeners()
    }
  }, [queryClient, setSyncing, setQueue, setCurrentCompany, setCurrentNsu, setDocumentosProcessados, reset])

  const handleSyncClick = useCallback(() => {
    setShowModal(true)
  }, [])

  const handleStartSync = useCallback(
    async (ids: string[]) => {
      setShowModal(false)
      setSyncing(true)

      try {
        const certs = await electronService.getCertificates()
        const queue = ids.map((id) => {
          const cert = certs.find((c) => c.id === id)
          return {
            id,
            empresa: cert?.razao_social || '',
            cnpj: cert?.cnpj || '',
            status: 'aguardando' as const
          }
        })
        setQueue(queue)
        await electronService.startSync(ids)
      } catch (err) {
        console.error('[Dashboard] startSync error:', err)
        setSyncing(false)
      }
    },
    [setSyncing, setQueue]
  )

  return {
    showModal,
    setShowModal,
    handleSyncClick,
    handleStartSync
  }
}
