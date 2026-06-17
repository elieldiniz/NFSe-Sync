import { memo } from 'react'
import { Card, Badge } from '@/shared/components'
import { useSyncHistory } from '../hooks/useSyncHistory'
import { formatDate } from '@/shared/utils'

export const SincronizacoesPage = memo(function SincronizacoesPage(): React.JSX.Element {
  const { history: syncs, isLoading } = useSyncHistory()

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium dark:text-gray-100">Histórico de Sincronizações</h2>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-[12px]">Carregando...</div>
        ) : syncs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-[12px]">Nenhuma sincronização registrada</div>
        ) : (
          <div className="tbl-wrap overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Data</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Empresa</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Documentos</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Retenções</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">NSU</th>
                  <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Status</th>
                </tr>
              </thead>
              <tbody>
                {syncs.map((sync) => (
                  <tr key={sync.id}>
                    <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 font-mono text-[11px] text-gray-600 dark:text-gray-400">{formatDate(sync.data_inicio)}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 font-medium dark:text-gray-200">{sync.razao_social || '—'}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                      {(sync.documentos_processados || 0) > 0 ? sync.documentos_processados : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700">
                      {(sync.retencoes_encontradas || 0) > 0 ? (
                        <Badge variant="warn">{sync.retencoes_encontradas}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 font-mono text-[11px] dark:text-gray-300">{(sync.nsu_final || 0).toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5" title={sync.status === 'ERRO' ? (sync.erro_mensagem || '') : ''}>
                        <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${sync.status === 'SUCESSO' ? 'bg-green' : 'bg-red'}`}></span>
                        <Badge variant={sync.status === 'SUCESSO' ? 'ok' : 'err'}>
                          {sync.status === 'SUCESSO' ? 'Sucesso' : 'Erro'}
                        </Badge>
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
      </Card>
    </div>
  )
})
