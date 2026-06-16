import { useState, useEffect } from 'react'
import { IconEdit, IconDownload, IconUpload } from '@tabler/icons-react'

export function ConfiguracoesPage(): React.JSX.Element {
  const [pastaBase, setPastaBase] = useState('')
  const [intervalo, setIntervalo] = useState('24')
  const [delayThrottle, setDelayThrottle] = useState('2.0')
  const [backupMessage, setBackupMessage] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    const config = await window.api.getConfig()
    if (config?.pasta_base) setPastaBase(config.pasta_base)
    if (config?.sinc_intervalo_horas) setIntervalo(String(config.sinc_intervalo_horas))
    if (config?.delay_throttle) setDelayThrottle(String(config.delay_throttle / 1000))
  }

  const handleExport = async () => {
    const result = await window.api.backupExport()
    if (result) {
      setBackupMessage('Backup exportado com sucesso!')
    } else {
      setBackupMessage('Erro ao exportar backup')
    }
    setTimeout(() => setBackupMessage(null), 3000)
  }

  const handleImport = async () => {
    const result = await window.api.backupImport()
    if (result) {
      setBackupMessage('Backup importado com sucesso! O app será reiniciado.')
    } else {
      setBackupMessage('Erro ao importar backup. Verifique a integridade do arquivo.')
    }
    setTimeout(() => setBackupMessage(null), 3000)
  }

  const handleChangeFolder = async () => {
    const folder = await window.api.selectBaseFolder()
    if (folder) {
      await window.api.saveBaseFolder(folder)
      setPastaBase(folder)
    }
  }

  const handleIntervaloChange = async (value: string) => {
    setIntervalo(value)
    await window.api.updateConfig({ sinc_intervalo_horas: parseInt(value) })
  }

  const handleDelayChange = async (value: string) => {
    setDelayThrottle(value)
    await window.api.updateConfig({ delay_throttle: parseFloat(value) * 1000 })
  }

  return (
    <div className="content flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium">Configurações</h2>
      </div>

      {backupMessage && (
        <div className={`mb-3 p-2.5 rounded-md text-[12px] ${backupMessage.includes('sucesso') ? 'bg-green-light text-green-dark' : 'bg-red-light text-red-dark'}`}>
          {backupMessage}
        </div>
      )}

      <div className="card bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
          <div>
            <div className="setting-label text-[13px] font-medium">Pasta base</div>
            <div className="setting-desc text-[11px] text-gray-400 mt-0.5">Local onde XMLs, PDFs e XLSX serão salvos</div>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="path-val text-[11px] font-mono bg-gray-50 py-1.5 px-2.5 rounded-md text-gray-600 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{pastaBase || 'Não definida'}</span>
            <button
              onClick={handleChangeFolder}
              className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center gap-1 hover:bg-gray-50"
            >
              <IconEdit size={14} />
              Alterar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
          <div>
            <div className="setting-label text-[13px] font-medium">Intervalo de sincronização automática</div>
            <div className="setting-desc text-[11px] text-gray-400 mt-0.5">Frequência do daemon CRON em background</div>
          </div>
          <select
            value={intervalo}
            onChange={(e) => handleIntervaloChange(e.target.value)}
            className="text-[12px] py-1.5 px-2 border border-gray-300 rounded-md bg-white text-gray-900 font-sans"
          >
            <option value="6">A cada 6 horas</option>
            <option value="12">A cada 12 horas</option>
            <option value="24">A cada 24 horas</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
          <div>
            <div className="setting-label text-[13px] font-medium">Delay entre lotes Sefaz</div>
            <div className="setting-desc text-[11px] text-gray-400 mt-0.5">Throttling mínimo entre requisições</div>
          </div>
          <select
            value={delayThrottle}
            onChange={(e) => handleDelayChange(e.target.value)}
            className="text-[12px] py-1.5 px-2 border border-gray-300 rounded-md bg-white text-gray-900 font-sans"
          >
            <option value="1.5">1.5 s</option>
            <option value="2.0">2.0 s</option>
            <option value="3.0">3.0 s</option>
          </select>
        </div>
      </div>

      <div className="card bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-medium">Banco de dados</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-50"
          >
            <IconDownload size={14} />
            Exportar backup .sqlite
          </button>
          <button
            onClick={handleImport}
            className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-50"
          >
            <IconUpload size={14} />
            Importar backup
          </button>
        </div>
      </div>
    </div>
  )
}
