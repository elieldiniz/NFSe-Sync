import { IconRefresh, IconPlayerStop, IconCheck } from '@tabler/icons-react'
import { useSyncStore } from '../../store/useSyncStore'

export function QueuePanel(): React.JSX.Element {
  const { queue, currentCompany, currentNsu, documentosProcessados, progress, setSyncing, reset } = useSyncStore()

  const handleStop = () => {
    window.api.stopSync()
    setSyncing(false)
    reset()
  }

  const getStatusIcon = (status: string) => {
    if (status === 'concluido') return <IconCheck size={14} className="text-green" />
    if (status === 'processando') return <IconRefresh size={14} className="text-blue animate-spin" />
    if (status === 'erro') return <span className="text-red">✕</span>
    return <span className="text-gray-400">⏳</span>
  }

  const getStatusBadge = (status: string, docs?: number) => {
    if (status === 'concluido') return <span className="badge ok text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-light text-green-dark font-medium">{docs || 0} docs</span>
    if (status === 'processando') return <span className="badge run text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-light text-blue-dark font-medium">Processando</span>
    if (status === 'erro') return <span className="badge err text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-light text-red-dark font-medium">Erro</span>
    return <span className="badge gray text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">Na fila</span>
  }

  const getItemClass = (status: string) => {
    if (status === 'processando') return 'border-blue bg-blue-light'
    return 'border-gray-200 bg-white'
  }

  return (
    <div className="mb-4">
      <div className="queue-info bg-blue-light border border-blue-mid rounded-md p-2.5 px-3.5 text-[12px] text-blue-dark flex items-center gap-2 mb-3">
        <IconRefresh size={14} className="animate-spin" />
        <span>
          Empresa atual: <strong>{currentCompany}</strong> · NSU: {currentNsu?.toLocaleString('pt-BR')} · Documentos: {documentosProcessados}
        </span>
      </div>

      <div className="h-1.5 bg-gray-200 rounded overflow-hidden mb-3">
        <div
          className="h-1.5 bg-blue rounded transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="queue-list flex flex-col gap-1.5">
        {queue.map((item) => (
          <div
            key={item.id}
            className={`q-item flex items-center gap-2.5 p-2.5 px-3 border rounded-md text-[12px] ${getItemClass(item.status)}`}
          >
            {getStatusIcon(item.status)}
            <span className="q-name font-medium flex-1">{item.empresa}</span>
            <span className="q-nsu text-gray-400 font-mono text-[11px]">NSU {item.nsu || '—'}</span>
            {getStatusBadge(item.status, item.docs)}
          </div>
        ))}
      </div>

      <div className="text-right mt-2.5">
        <button
          onClick={handleStop}
          className="btn sm danger text-[12px] py-1.5 px-2.5 rounded-md border border-red-light bg-red-light text-red cursor-pointer inline-flex items-center gap-1.5"
        >
          <IconPlayerStop size={14} />
          Interromper
        </button>
      </div>
    </div>
  )
}
