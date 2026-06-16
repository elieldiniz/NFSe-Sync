import { create } from 'zustand'

interface QueueItem {
  id: string
  empresa: string
  cnpj: string
  status: 'aguardando' | 'processando' | 'concluido' | 'erro'
  nsu?: number
  docs?: number
}

interface SyncState {
  isSyncing: boolean
  queue: QueueItem[]
  currentCompany: string | null
  currentNsu: number
  progress: number
  documentosProcessados: number
  retencoesEncontradas: number

  setSyncing: (value: boolean) => void
  setQueue: (queue: QueueItem[]) => void
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void
  setCurrentCompany: (empresa: string | null) => void
  setCurrentNsu: (nsu: number) => void
  setProgress: (progress: number) => void
  setDocumentosProcessados: (docs: number) => void
  setRetencoesEncontradas: (ret: number) => void
  reset: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  queue: [],
  currentCompany: null,
  currentNsu: 0,
  progress: 0,
  documentosProcessados: 0,
  retencoesEncontradas: 0,

  setSyncing: (value) => set({ isSyncing: value }),
  setQueue: (queue) => set({ queue }),
  updateQueueItem: (id, updates) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    })),
  setCurrentCompany: (empresa) => set({ currentCompany: empresa }),
  setCurrentNsu: (nsu) => set({ currentNsu: nsu }),
  setProgress: (progress) => set({ progress }),
  setDocumentosProcessados: (docs) => set({ documentosProcessados: docs }),
  setRetencoesEncontradas: (ret) => set({ retencoesEncontradas: ret }),
  reset: () =>
    set({
      isSyncing: false,
      queue: [],
      currentCompany: null,
      currentNsu: 0,
      progress: 0,
      documentosProcessados: 0,
      retencoesEncontradas: 0
    })
}))
