import { memo, useState, useRef } from 'react'
import { IconUpload, IconCheck, IconAlertTriangle, IconX } from '@tabler/icons-react'
import { Modal, ModalFooter, Button, Input } from '@/shared/components'
import { electronService } from '@/services/electron.service'
import type { BatchResult } from '@/types'

interface ModalCertLoteProps {
  onClose: () => void
  onComplete: () => void
}

export const ModalCertLote = memo(function ModalCertLote({ onClose, onComplete }: ModalCertLoteProps): React.JSX.Element {
  const [files, setFiles] = useState<File[]>([])
  const [senhas, setSenhas] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BatchResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith('.pfx') || f.name.endsWith('.p12')
    )
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImport = async () => {
    if (files.length === 0 || !senhas.trim()) return

    setLoading(true)
    const senhaArray = senhas.split(',').map((s) => s.trim()).filter(Boolean)
    const filePaths = files.map((f) => (f as File & { path?: string }).path || f.name)

    const result = await electronService.addBatchCerts({
      files: filePaths,
      senhas: senhaArray
    })

    setResults(result)
    setLoading(false)

    if (result.some((r) => r.success)) {
      onComplete()
    }
  }

  return (
    <Modal onClose={onClose} title="Importação em Lote">
      {results.length === 0 ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-5 text-center text-[12px] text-gray-400 dark:text-gray-500 cursor-pointer transition-colors hover:border-blue hover:text-blue"
          >
            <IconUpload size={24} className="mx-auto mb-2" />
            Arraste arquivos <strong>.pfx</strong> aqui ou clique para selecionar
            {files.length > 0 && (
              <div className="mt-2 text-blue font-medium">{files.length} arquivo(s) selecionado(s)</div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pfx,.p12"
            onChange={handleFileSelect}
            className="hidden"
          />

          {files.length > 0 && (
            <div className="mt-3 max-h-[120px] overflow-y-auto">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 text-[12px] border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="truncate flex-1 dark:text-gray-300">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-gray-400 dark:text-gray-500 hover:text-red ml-2">
                    <IconX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <Input
              label="Senhas (separadas por vírgula)"
              placeholder="123456, senha_empresa"
              value={senhas}
              onChange={(e) => setSenhas(e.target.value)}
            />
          </div>

          <ModalFooter>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={files.length === 0 || !senhas.trim() || loading}
            >
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <div className="text-[13px] font-medium mb-2 dark:text-gray-100">Resultado da Importação</div>
          <div className="max-h-[200px] overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md mb-1 text-[12px] ${
                  r.success ? 'bg-green-light dark:bg-green/10' : 'bg-red-light dark:bg-red/10'
                }`}
              >
                {r.success ? (
                  <IconCheck size={14} className="text-green flex-shrink-0" />
                ) : (
                  <IconAlertTriangle size={14} className="text-red flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium dark:text-gray-200">{r.file.split(/[/\\]/).pop()}</div>
                  {r.success ? (
                    <div className="text-[11px] text-gray-600 dark:text-gray-400">{r.razao_social} · {r.cnpj}</div>
                  ) : (
                    <div className="text-[11px] text-red">{r.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ModalFooter>
            <Button variant="primary" onClick={onClose}>
              Concluir
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  )
})
