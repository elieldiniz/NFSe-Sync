import { useEffect, useState } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { QueuePanel } from './QueuePanel'
import { SyncSelectModal } from '../modals/SyncSelectModal'
import { useSyncStore } from '../../store/useSyncStore'

export function Dashboard(): React.JSX.Element {
  const { isSyncing, setSyncing, setQueue, setCurrentCompany, setCurrentNsu, setProgress, setDocumentosProcessados, reset } = useSyncStore()
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({
    totalCertificados: 0,
    totalDocumentos: 0,
    totalRetido: 0,
    ultimaSincronizacao: null as string | null
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await window.api.getStats()
        setStats(data)
      } catch (err) {
        console.error('[Dashboard] getStats error:', err)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    const handleProgress = (data: any) => {
      if (data.empresa) setCurrentCompany(data.empresa)
      if (data.nsu) setCurrentNsu(data.nsu)
      if (data.documentosProcessados !== undefined) setDocumentosProcessados(data.documentosProcessados)
      if (data.queue) setQueue(data.queue)
    }

    const handleQueueUpdate = (data: any) => {
      const { queue } = useSyncStore.getState()
      const updated = queue.map((item) =>
        item.id === data.id ? { ...item, status: data.status } : item
      )
      setQueue(updated)
    }

    const handleComplete = () => {
      setSyncing(false)
      reset()
      loadStats()
    }

    window.api.onSyncProgress(handleProgress)
    window.api.onSyncQueueUpdate(handleQueueUpdate)
    window.api.onSyncQueueComplete(handleComplete)

    return () => {
      window.api.removeSyncListeners()
    }
  }, [])

  async function loadStats() {
    try {
      const data = await window.api.getStats()
      setStats(data)
    } catch (err) {
      console.error('[Dashboard] loadStats error:', err)
    }
  }

  const handleSyncClick = () => {
    setShowModal(true)
  }

  const handleStartSync = async (ids: string[]) => {
    setShowModal(false)
    setSyncing(true)

    try {
      const certs = await window.api.getCertificates()
      const queue = ids.map((id) => {
        const cert = certs.find((c: any) => c.id === id)
        return {
          id,
          empresa: cert?.razao_social || '',
          cnpj: cert?.cnpj || '',
          status: 'aguardando' as const
        }
      })
      setQueue(queue)

      await window.api.startSync(ids)
    } catch (err) {
      console.error('[Dashboard] startSync error:', err)
      setSyncing(false)
    }
  }

  return (
    <div className="content flex-1 overflow-y-auto p-5">
      <div className="metric-grid grid grid-cols-4 gap-2.5 mb-4">
        <div className="metric bg-gray-50 rounded-md p-3.5">
          <div className="val text-[22px] font-medium text-gray-900 leading-tight">{stats.totalCertificados}</div>
          <div className="lbl text-[11px] text-gray-400 mt-0.5">Certificados</div>
        </div>
        <div className="metric bg-gray-50 rounded-md p-3.5">
          <div className="val text-[22px] font-medium text-gray-900 leading-tight">{stats.totalDocumentos.toLocaleString('pt-BR')}</div>
          <div className="lbl text-[11px] text-gray-400 mt-0.5">Documentos</div>
        </div>
        <div className="metric bg-gray-50 rounded-md p-3.5">
          <div className="val text-[22px] font-medium text-gray-900 leading-tight">R$ {(stats.totalRetido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="lbl text-[11px] text-gray-400 mt-0.5">Total retido</div>
        </div>
        <div className="metric bg-gray-50 rounded-md p-3.5">
          <div className="val text-[22px] font-medium text-gray-900 leading-tight">
            {stats.ultimaSincronizacao ? new Date(stats.ultimaSincronizacao).toLocaleDateString('pt-BR') : 'Nunca'}
          </div>
          <div className="lbl text-[11px] text-gray-400 mt-0.5">Última sincronização</div>
        </div>
      </div>

      {isSyncing && <QueuePanel />}

      {!isSyncing && (
        <div className="sync-hero text-center py-8 pb-6">
          <p className="text-[13px] text-gray-600 mb-5">
            Clique para sincronizar suas empresas com a Sefaz Nacional.
          </p>
          <button
            onClick={handleSyncClick}
            className="btn-sync text-[15px] font-medium py-3 px-8 rounded-xl bg-blue text-white border-none cursor-pointer inline-flex items-center gap-2 transition-all hover:bg-blue-dark hover:-translate-y-px font-sans"
          >
            <IconRefresh size={18} />
            Sincronizar Agora
          </button>
        </div>
      )}

      {showModal && (
        <SyncSelectModal
          onClose={() => setShowModal(false)}
          onStart={handleStartSync}
        />
      )}
    </div>
  )
}
