import { memo, useCallback } from 'react'
import { IconRefresh, IconPlayerStop, IconCheck } from '@tabler/icons-react'
import { useSyncStore } from '@/store/sync.store'
import { electronService } from '@/services/electron.service'
import { Badge } from '@/shared/components'
import type { SyncStatus, QueueItem } from '@/types'

export function QueuePanel(): React.JSX.Element {
  const { queue, currentCompany, currentNsu, documentosProcessados, progress, setSyncing, reset } =
    useSyncStore()

  const handleStop = useCallback(() => {
    electronService.stopSync()
    setSyncing(false)
    reset()
  }, [setSyncing, reset])

  return (
    <div className="mb-4">
      <div className="queue-info bg-blue-light dark:bg-blue/20 border border-blue-mid dark:border-blue/30 rounded-md p-2.5 px-3.5 text-[12px] text-blue-dark dark:text-blue-light flex items-center gap-2 mb-3">
        <IconRefresh size={14} className="animate-spin" />
        <span>
          Empresa atual: <strong>{currentCompany}</strong> · NSU: {currentNsu?.toLocaleString('pt-BR')} · Documentos: {documentosProcessados}
        </span>
      </div>

      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mb-3">
        <div
          className="h-1.5 bg-blue rounded transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="queue-list flex flex-col gap-1.5">
        {queue.map((item) => (
          <QueueItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="text-right mt-2.5">
        <button
          onClick={handleStop}
          className="btn sm danger text-[12px] py-1.5 px-2.5 rounded-md border border-red-light dark:border-red/30 bg-red-light dark:bg-red/20 text-red cursor-pointer inline-flex items-center gap-1.5"
        >
          <IconPlayerStop size={14} />
          Interromper
        </button>
      </div>
    </div>
  )
}

interface QueueItemRowProps {
  item: QueueItem
}

const QueueItemRow = memo(function QueueItemRow({ item }: QueueItemRowProps): React.JSX.Element {
  const getStatusIcon = (status: SyncStatus) => {
    if (status === 'concluido') return <IconCheck size={14} className="text-green" />
    if (status === 'processando') return <IconRefresh size={14} className="text-blue animate-spin" />
    if (status === 'erro') return <span className="text-red">✕</span>
    return <span className="text-gray-400">⏳</span>
  }

  const getVariant = (status: SyncStatus) => {
    if (status === 'concluido') return 'ok' as const
    if (status === 'processando') return 'run' as const
    if (status === 'erro') return 'err' as const
    return 'default' as const
  }

  const itemClass =
    item.status === 'processando'
      ? 'border-blue bg-blue-light dark:bg-blue/20'
      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'

  return (
    <div className={`q-item flex items-center gap-2.5 p-2.5 px-3 border rounded-md text-[12px] ${itemClass}`}>
      {getStatusIcon(item.status)}
      <span className="q-name font-medium flex-1 dark:text-gray-200">{item.empresa}</span>
      <span className="q-nsu text-gray-400 font-mono text-[11px]">NSU {item.nsu || '—'}</span>
      <Badge variant={getVariant(item.status)}>
        {item.status === 'concluido' ? `${item.docs || 0} docs` : item.status === 'processando' ? 'Processando' : item.status === 'erro' ? 'Erro' : 'Na fila'}
      </Badge>
    </div>
  )
})
