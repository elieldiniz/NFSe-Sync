import { useState, useEffect } from 'react'
import {
  IconPlus,
  IconUpload,
  IconEdit,
  IconTrash
} from '@tabler/icons-react'
import { ModalCertLote } from '../modals/ModalCertLote'
import { ModalCertSingle } from '../modals/ModalCertSingle'
import { ModalCertEdit } from '../modals/ModalCertEdit'

interface Cert {
  id: string
  cnpj: string
  razao_social: string
  caminho_pfx: string
  validade_cert: string
  sinc_automatica: boolean
  ultimo_nsu: number
}

export function CertificadosPage(): React.JSX.Element {
  const [certs, setCerts] = useState<Cert[]>([])
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showSingleModal, setShowSingleModal] = useState(false)
  const [editCert, setEditCert] = useState<Cert | null>(null)

  useEffect(() => {
    loadCerts()
  }, [])

  async function loadCerts() {
    const data = await window.api.getCertificates()
    setCerts(data)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este certificado?')) {
      await window.api.deleteCertificate(id)
      loadCerts()
    }
  }

  return (
    <div className="content flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium">Certificados</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSingleModal(true)}
            className="btn primary text-[13px] py-1.5 px-3.5 rounded-md bg-blue text-white border border-blue cursor-pointer inline-flex items-center gap-1.5 font-medium"
          >
            <IconPlus size={14} />
            Adicionar Certificado
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="btn text-[13px] py-1.5 px-3.5 rounded-md border border-gray-300 bg-white text-gray-900 cursor-pointer inline-flex items-center gap-1.5 font-medium hover:bg-gray-50"
          >
            <IconUpload size={14} />
            Importação em Lote
          </button>
        </div>
      </div>

      <div className="card bg-white border border-gray-200 rounded-xl p-4">
        <div className="tbl-wrap overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Empresa</th>
                <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">CNPJ</th>
                <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Último NSU</th>
                <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Validade</th>
                <th className="text-left py-1.5 px-2.5 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-200 font-medium font-mono">Status</th>
                <th className="py-1.5 px-2.5 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {certs.map((cert) => {
                const isExpired = new Date(cert.validade_cert) < new Date()
                const daysUntilExpiry = Math.ceil((new Date(cert.validade_cert).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                const isWarn = !isExpired && daysUntilExpiry <= 30

                return (
                  <tr key={cert.id} className={`${isExpired ? 'bg-red-light/30' : isWarn ? 'bg-amber-light/30' : ''}`}>
                    <td className="py-2 px-2.5 border-b border-gray-200 font-medium">{cert.razao_social}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200 font-mono text-[11px] text-gray-600">{cert.cnpj}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200 font-mono">{cert.ultimo_nsu.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-2.5 border-b border-gray-200">
                      {isExpired ? (
                        <span className="badge err text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-light text-red-dark font-medium">{new Date(cert.validade_cert).toLocaleDateString('pt-BR')} · Expirado</span>
                      ) : isWarn ? (
                        <span className="badge warn text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-light text-amber-dark font-medium">{new Date(cert.validade_cert).toLocaleDateString('pt-BR')}</span>
                      ) : (
                        <span className="text-[12px] text-gray-600">{new Date(cert.validade_cert).toLocaleDateString('pt-BR')}</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 border-b border-gray-200">
                      {isExpired ? (
                        <span className="badge err text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-light text-red-dark font-medium">Expirado</span>
                      ) : isWarn ? (
                        <span className="badge warn text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-light text-amber-dark font-medium">Vence em breve</span>
                      ) : (
                        <span className="badge ok text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-light text-green-dark font-medium">Ativo</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 border-b border-gray-200 whitespace-nowrap">
                      <button
                        onClick={() => setEditCert(cert)}
                        className="btn sm text-[12px] py-1 px-2 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center hover:bg-gray-50 mr-1" title="Editar"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="btn sm text-[12px] py-1 px-2 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center hover:bg-gray-50"
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
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Nenhum certificado cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBatchModal && (
        <ModalCertLote
          onClose={() => setShowBatchModal(false)}
          onComplete={() => {
            setShowBatchModal(false)
            loadCerts()
          }}
        />
      )}

      {showSingleModal && (
        <ModalCertSingle
          onClose={() => setShowSingleModal(false)}
          onComplete={() => {
            setShowSingleModal(false)
            loadCerts()
          }}
        />
      )}

      {editCert && (
        <ModalCertEdit
          cert={editCert}
          onClose={() => setEditCert(null)}
          onComplete={() => {
            setEditCert(null)
            loadCerts()
          }}
        />
      )}
    </div>
  )
}
