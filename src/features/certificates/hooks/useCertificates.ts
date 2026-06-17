import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { electronService } from '@/services/electron.service'
import { queryKeys } from '@/services/queryKeys'
import type { Certificate } from '@/types'

export function useCertificates() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: certificates, isLoading } = useQuery({
    queryKey: queryKeys.certificates,
    queryFn: () => electronService.getCertificates()
  })

  const addMutation = useMutation({
    mutationFn: (cert: Omit<Certificate, 'id'>) => electronService.addCertificate(cert),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.certificates })
  })

  const updateMutation = useMutation({
    mutationFn: (cert: Certificate) => electronService.updateCertificate(cert),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.certificates })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => electronService.deleteCertificate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.certificates })
  })

  const selectCertificate = useCallback((cert: Certificate) => {
    setSelectedId(cert.id)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const selected = certificates?.find((c) => c.id === selectedId) ?? null

  return {
    certificates: certificates ?? [],
    isLoading,
    selected,
    selectedId,
    selectCertificate,
    clearSelection,
    addCertificate: addMutation.mutate,
    updateCertificate: updateMutation.mutate,
    deleteCertificate: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
