import { useState, useEffect, useCallback } from 'react'
import {
  IconFileSpreadsheet,
  IconFileText,
  IconCalendar,
  IconBuilding,
  IconRefresh
} from '@tabler/icons-react'

interface CompetenciaInfo {
  competencia: string
  fechada: boolean
}

interface Certificado {
  id: string
  cnpj: string
  razao_social: string
}

function formatCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-')
  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return `${meses[parseInt(mes) - 1]} ${ano}`
}

export function RelatoriosPage(): React.JSX.Element {
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [selectedCert, setSelectedCert] = useState<string>('')
  const [competencias, setCompetencias] = useState<CompetenciaInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    window.api.getCertificates().then(setCertificados)
  }, [])

  const loadCompetencias = useCallback(async () => {
    if (!selectedCert) return
    setLoading(true)
    try {
      const data = await window.api.getCompetencias(selectedCert)
      setCompetencias(data)
    } catch {
      setCompetencias([])
    } finally {
      setLoading(false)
    }
  }, [selectedCert])

  useEffect(() => {
    if (selectedCert) {
      loadCompetencias()
    }
  }, [selectedCert, loadCompetencias])

  const handleGerarRelatorio = async (competencia: string) => {
    setGenerating(competencia)
    try {
      const result = await window.api.generateReportManual(selectedCert, competencia)
      if (result.pdf) {
        await window.api.openReport(result.pdf)
      }
    } catch (err) {
      console.error('Erro ao gerar relatorio:', err)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Relatorios de Retencoes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gere relatorios PDF das reencoes por competencia
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <IconBuilding size={16} className="inline mr-1" />
            Selecione a Empresa
          </label>
          <select
            value={selectedCert}
            onChange={(e) => setSelectedCert(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="">Selecione um certificado...</option>
            {certificados.map((cert) => (
              <option key={cert.id} value={cert.id}>
                {cert.razao_social} - {cert.cnpj}
              </option>
            ))}
          </select>
        </div>

        {selectedCert && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                <IconCalendar size={16} className="inline mr-1" />
                Competencias Disponiveis
              </h3>
              <button
                onClick={loadCompetencias}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <IconRefresh size={16} />
              </button>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Carregando...
                </div>
              ) : competencias.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Nenhuma competencia com reencoes encontrada
                </div>
              ) : (
                competencias.map((comp) => (
                  <div
                    key={comp.competencia}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCompetencia(comp.competencia)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {comp.competencia}
                        </div>
                      </div>
                      {comp.fechada ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                          Fechada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                          Aberta
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleGerarRelatorio(comp.competencia)}
                      disabled={generating === comp.competencia}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue rounded-md hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IconFileText size={14} />
                      {generating === comp.competencia ? 'Gerando...' : 'Gerar Relatorio'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Regra de Geracao Automatica
          </h4>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Competencias <strong>fechadas</strong> (mes anterior): geradas automaticamente na sincronizacao</li>
            <li>• Competencias <strong>abertas</strong> (mes atual): gere manualmente quando desejar</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
