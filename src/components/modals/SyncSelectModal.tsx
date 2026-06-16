import { useState, useEffect } from 'react'
import { IconX, IconPlayerPlay } from '@tabler/icons-react'

interface Cert {
  id: string
  cnpj: string
  razao_social: string
  validade_cert: string
}

interface SyncSelectModalProps {
  onClose: () => void
  onStart: (ids: string[]) => void
}

export function SyncSelectModal({ onClose, onStart }: SyncSelectModalProps): React.JSX.Element {
  const [certs, setCerts] = useState<Cert[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const data = await window.api.getCertificates()
      setCerts(data)
      // Select all valid by default
      const validIds = data
        .filter((c: Cert) => new Date(c.validade_cert) >= new Date())
        .map((c: Cert) => c.id)
      setSelected(new Set(validIds))
    }
    load()
  }, [])

  const filtered = certs.filter((c) =>
    c.razao_social.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search)
  )

  const allValidSelected = filtered
    .filter((c) => new Date(c.validade_cert) >= new Date())
    .every((c) => selected.has(c.id))

  const toggleSelectAll = () => {
    if (allValidSelected) {
      setSelected(new Set())
    } else {
      const validIds = filtered
        .filter((c) => new Date(c.validade_cert) >= new Date())
        .map((c) => c.id)
      setSelected(new Set(validIds))
    }
  }

  const toggleCert = (id: string, disabled: boolean) => {
    if (disabled) return
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleStart = () => {
    onStart(Array.from(selected))
  }

  return (
    <div className="modal-bg absolute inset-0 bg-black/38 flex items-center justify-center rounded-xl z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal bg-white border border-gray-200 rounded-xl p-5 w-[480px]">
        <div className="modal-title text-[15px] font-medium mb-3.5 flex items-center justify-between">
          Selecionar Empresas
          <button onClick={onClose} className="bg-none border-none cursor-pointer text-gray-400 text-lg p-0.5 leading-none hover:text-gray-900">
            <IconX size={18} />
          </button>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar por Razão Social ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
          />
        </div>

        <div className="max-h-[250px] overflow-y-auto border border-gray-200 rounded-md">
          <table className="w-full border-collapse text-[12px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-2.5 w-[30px]">
                  <input
                    type="checkbox"
                    checked={allValidSelected}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2.5 text-left text-[10px] uppercase tracking-wider text-gray-400 font-medium font-mono">Empresa</th>
                <th className="py-2.5 px-2.5 text-right text-[10px] uppercase tracking-wider text-gray-400 font-medium font-mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => {
                const isExpired = new Date(cert.validade_cert) < new Date()
                return (
                  <tr
                    key={cert.id}
                    className={`${isExpired ? 'opacity-50' : 'hover:bg-gray-50'}`}
                    style={{ borderTop: '0.5px solid #E5E7EB' }}
                  >
                    <td className="py-2 px-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(cert.id)}
                        onChange={() => toggleCert(cert.id, isExpired)}
                        disabled={isExpired}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="font-medium">{cert.razao_social}</div>
                      <div className="font-mono text-[11px] text-gray-600">{cert.cnpj}</div>
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      {isExpired ? (
                        <span className="badge err text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-light text-red-dark font-medium">Expirado</span>
                      ) : (
                        <span className="badge ok text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-light text-green-dark font-medium">Pronto</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-footer flex justify-end gap-2 mt-4 pt-3.5 border-t border-gray-200">
          <button onClick={onClose} className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleStart}
            disabled={selected.size === 0}
            className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
          >
            <IconPlayerPlay size={14} />
            Iniciar Sincronização
          </button>
        </div>
      </div>
    </div>
  )
}
