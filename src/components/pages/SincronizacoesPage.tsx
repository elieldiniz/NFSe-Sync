import { useState, useEffect } from 'react'

interface SyncRecord {
  id: string
  certificado_id: string
  data_inicio: string
  data_fim: string | null
  status: string
  nsu_inicial: number
  nsu_final: number
  documentos_processados: number
  retencoes_encontradas: number
  erro_mensagem: string | null
  razao_social: string
  cnpj: string
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) {
      return `hoje ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    if (diffDays === 1) {
      return `ontem ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export function SincronizacoesPage(): React.JSX.Element {
  const [syncs, setSyncs] = useState<SyncRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.api.getSyncHistory()
      .then((data) => {
        if (Array.isArray(data)) {
          setSyncs(data as SyncRecord[])
        } else {
          setSyncs([])
        }
      })
      .catch((err) => {
        console.error('[SincronizacoesPage] Error:', err)
        setSyncs([])
        setError('Erro ao carregar histórico')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="content flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium">Histórico de Sincronizações</h2>
      </div>

      <div className="card bg-white border border-gray-200 rounded-xl p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-[12px]">Carregando...</div>
        ) : error ? (
          <div className="text-center py-8 text-red text-[12px]">{error}</div>
        ) : syncs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-[12px]">Nenhuma sincronização registrada</div>
        ) : (
          <div className="tbl-wrap overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Data</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Empresa</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Documentos</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Retenções</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">NSU</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Status</th>
                </tr>
              </thead>
              <tbody>
                {syncs.map((sync) => (
                  <tr key={sync.id}>
                    <td className="py-2 px-2.5 border-b border-gray-200 font-mono text-[11px] text-gray-600">{formatDate(sync.data_inicio)}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200 font-medium">{sync.razao_social || '—'}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200">
                      {(sync.documentos_processados || 0) > 0 ? sync.documentos_processados : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-2 px-2.5 border-b border-gray-200">
                      {(sync.retencoes_encontradas || 0) > 0 ? (
                        <span className="badge warn text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-light text-amber-dark font-medium">{sync.retencoes_encontradas}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 border-b border-gray-200 font-mono text-[11px]">{(sync.nsu_final || 0).toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200">
                      <div className="flex items-center gap-1.5" title={sync.status === 'ERRO' ? (sync.erro_mensagem || '') : ''}>
                        <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${sync.status === 'SUCESSO' ? 'bg-green' : 'bg-red'}`}></span>
                        <span className={`badge text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                          sync.status === 'SUCESSO' ? 'bg-green-light text-green-dark' : 'bg-red-light text-red-dark'
                        }`}>
                          {sync.status === 'SUCESSO' ? 'Sucesso' : 'Erro'}
                        </span>
                      </div>
                      {sync.status === 'ERRO' && sync.erro_mensagem && (
                        <div className="text-[10px] text-red mt-1 max-w-[200px] break-words" title={sync.erro_mensagem}>
                          {sync.erro_mensagem.length > 60 ? sync.erro_mensagem.substring(0, 60) + '...' : sync.erro_mensagem}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
