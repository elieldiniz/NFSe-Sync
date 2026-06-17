import { memo } from 'react'
import { IconEdit, IconDownload, IconUpload } from '@tabler/icons-react'
import { Card, Button } from '@/shared/components'
import { useSettings } from '../hooks/useSettings'
import { electronService } from '@/services/electron.service'

export const ConfiguracoesPage = memo(function ConfiguracoesPage(): React.JSX.Element {
  const {
    config,
    selectFolder,
    updateConfig
  } = useSettings()

  if (!config) {
    return (
    <div className="p-6 max-w-[600px] mx-auto">
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-[12px]">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[600px] mx-auto">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium dark:text-gray-100">Configurações</h2>
      </div>

      <Card className="mb-3">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
          <div>
            <div className="setting-label text-[13px] font-medium dark:text-gray-200">Pasta base</div>
            <div className="setting-desc text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Local onde XMLs, PDFs e XLSX serão salvos
            </div>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="path-val text-[11px] font-mono bg-gray-50 dark:bg-gray-800 py-1.5 px-2.5 rounded-md text-gray-600 dark:text-gray-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {config.pasta_base || 'Não definida'}
            </span>
            <Button size="sm" onClick={selectFolder} icon={<IconEdit size={14} />}>
              Alterar
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
          <div>
            <div className="setting-label text-[13px] font-medium dark:text-gray-200">
              Intervalo de sincronização automática
            </div>
            <div className="setting-desc text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Frequência do daemon CRON em background
            </div>
          </div>
          <select
            value={config.sinc_intervalo_horas || 12}
            onChange={(e) => updateConfig({ sinc_intervalo_horas: Number(e.target.value) })}
            className="text-[12px] py-1.5 px-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans"
          >
            <option value={6}>A cada 6 horas</option>
            <option value={12}>A cada 12 horas</option>
            <option value={24}>A cada 24 horas</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
          <div>
            <div className="setting-label text-[13px] font-medium dark:text-gray-200">Delay entre lotes Sefaz</div>
            <div className="setting-desc text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Throttling mínimo entre requisições
            </div>
          </div>
          <select
            value={config.delay_throttle || 2000}
            onChange={(e) => updateConfig({ delay_throttle: Number(e.target.value) })}
            className="text-[12px] py-1.5 px-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans"
          >
            <option value={1500}>1.5 s</option>
            <option value={2000}>2.0 s</option>
            <option value={3000}>3.0 s</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-medium dark:text-gray-200">Banco de dados</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => electronService.backupExport()} icon={<IconDownload size={14} />}>
            Exportar backup .sqlite
          </Button>
          <Button size="sm" onClick={() => electronService.backupImport()} icon={<IconUpload size={14} />}>
            Importar backup
          </Button>
        </div>
      </Card>
    </div>
  )
})
