import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconFile,
  IconReceipt,
  IconCash
} from '@tabler/icons-react'

interface EmpresaStats {
  totalDocumentos: number
  emitidos: number
  recebidos: number
  comRetencao: number
  valorTotal: number
}

interface RetencoesEmpresa {
  iss: number
  inss: number
  irrf: number
  pis: number
  cofins: number
  csll: number
  total: number
}

interface CertificadoInfo {
  id: string
  razao_social: string
  cnpj: string
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

export function EmpresaDashboard(): React.JSX.Element {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [stats, setStats] = useState<EmpresaStats | null>(null)
  const [retencoes, setRetencoes] = useState<RetencoesEmpresa | null>(null)
  const [certificado, setCertificado] = useState<CertificadoInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setLoading(true)
      try {
        const certs = await window.api.getCertificates()
        const cert = certs.find(c => c.id === id)
        if (cert) {
          setCertificado({ id: cert.id, razao_social: cert.razao_social, cnpj: cert.cnpj })
        }

        const [empresaStats, empresaRetencoes] = await Promise.all([
          window.api.getStatsEmpresa(id),
          window.api.getRetencoesEmpresa(id)
        ])

        setStats(empresaStats)
        setRetencoes(empresaRetencoes)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!certificado) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Empresa nao encontrada</div>
      </div>
    )
  }

  const totalRetencoes = retencoes?.total || 0

  const pieData = totalRetencoes > 0 ? [
    { label: 'ISS', value: retencoes?.iss || 0, color: '#3B82F6' },
    { label: 'INSS', value: retencoes?.inss || 0, color: '#10B981' },
    { label: 'IRRF', value: retencoes?.irrf || 0, color: '#F59E0B' },
    { label: 'PIS', value: retencoes?.pis || 0, color: '#8B5CF6' },
    { label: 'COFINS', value: retencoes?.cofins || 0, color: '#EC4899' },
    { label: 'CSLL', value: retencoes?.csll || 0, color: '#6B7280' }
  ] : []

  // Filtrar apenas itens com valor > 0
  const activeItems = pieData.filter(item => item.value > 0)

  // Se so tem 1 item, mostrar 100%
  // Se tem mais, dividir proporcionalmente
  let cumulativePercent = 0
  const gradientStops = activeItems.length > 0
    ? activeItems.map((item, index) => {
        const percent = activeItems.length === 1 ? 100 : (item.value / totalRetencoes) * 100
        const start = cumulativePercent
        cumulativePercent += percent
        return `${item.color} ${start}% ${cumulativePercent}%`
      })
    : []
  const pieGradient = gradientStops.length > 0
    ? `conic-gradient(${gradientStops.join(', ')})`
    : 'conic-gradient(#e5e7eb 0% 100%)'

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/certs')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
        >
          <IconArrowLeft size={16} />
          Voltar
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {certificado.razao_social}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            CNPJ: {certificado.cnpj}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <IconFile size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Documentos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(stats?.totalDocumentos || 0)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {stats?.emitidos || 0} emitidos / {stats?.recebidos || 0} recebidos
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <IconReceipt size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Retencoes</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalRetencoes)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {stats?.comRetencao || 0} notas
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IconCash size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Valor Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(stats?.valorTotal || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Composicao das Retencoes
          </h3>

          {totalRetencoes > 0 ? (
            <div className="flex items-center gap-8">
              <div
                className="w-40 h-40 rounded-full flex-shrink-0"
                style={{ background: pieGradient }}
              />

              <div className="flex-1 grid grid-cols-2 gap-3">
                {pieData.map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {((item.value / totalRetencoes) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Nenhuma retencao registrada
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
