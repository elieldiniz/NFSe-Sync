import { IconPlus, IconUpload } from '@tabler/icons-react'
import { Button } from '@/shared/components'
import { useCertificates } from '../hooks/useCertificates'
import { CertTable } from './CertTable'
import { ModalCertSingle } from './ModalCertSingle'
import { ModalCertLote } from './ModalCertLote'
import { ModalCertEdit } from './ModalCertEdit'
import { useSyncStore } from '@/store/sync.store'
import { useState, useCallback } from 'react'

export function CertificadosPage(): React.JSX.Element {
  const {
    certificates: certs,
    selected: editCert,
    selectCertificate: setEditCert,
    clearSelection,
    deleteCertificate,
    isDeleting
  } = useCertificates()

  const [showSingleModal, setShowSingleModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este certificado?')) {
      deleteCertificate(id)
    }
  }, [deleteCertificate])

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium dark:text-gray-100">Certificados</h2>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => setShowSingleModal(true)}
            icon={<IconPlus size={14} />}
          >
            Adicionar Certificado
          </Button>
          <Button onClick={() => setShowBatchModal(true)} icon={<IconUpload size={14} />}>
            Importação em Lote
          </Button>
        </div>
      </div>

      <CertTable certs={certs} onEdit={setEditCert} onDelete={handleDelete} />

      {showBatchModal && (
        <ModalCertLote
          onClose={() => setShowBatchModal(false)}
          onComplete={() => setShowBatchModal(false)}
        />
      )}

      {showSingleModal && (
        <ModalCertSingle
          onClose={() => setShowSingleModal(false)}
          onComplete={() => setShowSingleModal(false)}
        />
      )}

      {editCert && (
        <ModalCertEdit
          cert={editCert}
          onClose={() => clearSelection()}
          onComplete={() => clearSelection()}
        />
      )}
    </div>
  )
}
