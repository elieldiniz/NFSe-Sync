import { memo, useState, useEffect } from 'react'
import { IconPlayerPlay } from '@tabler/icons-react'
import { Modal, ModalFooter, Button, Input } from '@/shared/components'
import { electronService } from '@/services/electron.service'
import type { CertificadoBasic } from '@/types'

interface SyncSelectModalProps {
  onClose: () => void
  onStart: (ids: string[]) => void
}

export const SyncSelectModal = memo(function SyncSelectModal({ onClose, onStart }: SyncSelectModalProps): React.JSX.Element {
  const [certs, setCerts] = useState<CertificadoBasic[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const data = await electronService.getCertificates()
      setCerts(data)
      const validIds = data
        .filter((c) => new Date(c.validade_cert) >= new Date())
        .map((c) => c.id)
      setSelected(new Set(validIds))
    }
    load()
  }, [])

  const filtered = certs.filter(
    (c) =>
      c.razao_social.toLowerCase().includes(search.toLowerCase()) || c.cnpj.includes(search)
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
    <Modal onClose={onClose} title="Selecionar Empresas">
      <div className="mb-3">
        <Input
          placeholder="Buscar por Razão Social ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-[250px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-2.5 w-[30px]">
                <input
                  type="checkbox"
                  checked={allValidSelected}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-2.5 text-left text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium font-mono">Empresa</th>
              <th className="py-2.5 px-2.5 text-right text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium font-mono">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cert) => {
              const isExpired = new Date(cert.validade_cert) < new Date()
              return (
                <tr
                  key={cert.id}
                  className={`${isExpired ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
                    <div className="font-medium dark:text-gray-200">{cert.razao_social}</div>
                    <div className="font-mono text-[11px] text-gray-600 dark:text-gray-400">{cert.cnpj}</div>
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {isExpired ? (
                      <span className="badge err text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-light dark:bg-red/20 text-red-dark dark:text-red-light font-medium">Expirado</span>
                    ) : (
                      <span className="badge ok text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-light dark:bg-green/20 text-green-dark dark:text-green-light font-medium">Pronto</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ModalFooter>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleStart} disabled={selected.size === 0} icon={<IconPlayerPlay size={14} />}>
          Iniciar Sincronização
        </Button>
      </ModalFooter>
    </Modal>
  )
})
