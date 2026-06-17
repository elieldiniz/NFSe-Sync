import { memo } from 'react'
import type { DashboardStats } from '@/types'
import { formatCurrency, formatNumber, formatShortDate } from '@/shared/utils'

interface StatsGridProps {
  stats: DashboardStats | undefined
}

export const StatsGrid = memo(function StatsGrid({ stats }: StatsGridProps): React.JSX.Element {
  if (!stats) return <div className="grid grid-cols-4 gap-2.5 mb-4 skeleton" />

  return (
    <div className="metric-grid grid grid-cols-4 gap-2.5 mb-4">
      <MetricCard value={String(stats.totalCertificados)} label="Certificados" />
      <MetricCard value={formatNumber(stats.totalDocumentos)} label="Documentos" />
      <MetricCard value={`R$ ${formatCurrency(stats.totalRetido)}`} label="Total retido" />
      <MetricCard value={formatShortDate(stats.ultimaSincronizacao)} label="Última sincronização" />
    </div>
  )
})

interface MetricCardProps {
  value: string
  label: string
}

const MetricCard = memo(function MetricCard({ value, label }: MetricCardProps): React.JSX.Element {
  return (
    <div className="metric bg-gray-50 dark:bg-gray-800 rounded-md p-3.5">
      <div className="val text-[22px] font-medium text-gray-900 dark:text-gray-100 leading-tight">{value}</div>
      <div className="lbl text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</div>
    </div>
  )
})
