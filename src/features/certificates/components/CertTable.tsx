import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconEdit, IconTrash, IconChartBar } from '@tabler/icons-react'
import { Card } from '@/shared/components'
import { CertStatusBadge, CertDateBadge } from './CertStatusBadge'
import type { Certificado } from '@/types'

interface CertTableProps {
  certs: Certificado[]
  onEdit: (cert: Certificado) => void
  onDelete: (id: string) => void
}

export const CertTable = memo(function CertTable({ certs, onEdit, onDelete }: CertTableProps): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <Card>
      <div className="tbl-wrap overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Empresa</th>
              <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">CNPJ</th>
              <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Último NSU</th>
              <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Validade</th>
              <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700 font-medium font-mono">Status</th>
              <th className="py-1.5 px-2.5 border-b border-gray-200 dark:border-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert) => {
              const isExpired = new Date(cert.validade_cert) < new Date()
              const daysUntilExpiry = Math.ceil(
                (new Date(cert.validade_cert).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              const isWarn = !isExpired && daysUntilExpiry <= 30

              return (
                <tr
                  key={cert.id}
                  className={`${isExpired ? 'bg-red-light/30 dark:bg-red/10' : isWarn ? 'bg-amber-light/30 dark:bg-amber/10' : ''}`}
                >
                  <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 font-medium dark:text-gray-200">{cert.razao_social}</td>
                  <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 font-mono text-[11px] text-gray-600 dark:text-gray-400">{cert.cnpj}</td>
                  <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 font-mono dark:text-gray-300">{cert.ultimo_nsu.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700">
                    <CertDateBadge cert={cert} />
                  </td>
                  <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700">
                    <CertStatusBadge cert={cert} />
                  </td>
                  <td className="py-2 px-2.5 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/empresa/${cert.id}`)}
                      className="btn sm text-[12px] py-1 px-2 rounded-md border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 cursor-pointer inline-flex items-center hover:bg-blue-100 dark:hover:bg-blue-900/40 mr-1"
                      title="Dashboard da Empresa"
                    >
                      <IconChartBar size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(cert)}
                      className="btn sm text-[12px] py-1 px-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer inline-flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 mr-1"
                      title="Editar"
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(cert.id)}
                      className="btn sm text-[12px] py-1 px-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer inline-flex items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                      title="Excluir"
                    >
                      <IconTrash size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {certs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-gray-500">
                  Nenhum certificado cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
})
