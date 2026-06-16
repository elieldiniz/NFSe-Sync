import { useState, useRef } from 'react'
import { IconX, IconUpload, IconCheck, IconAlertTriangle } from '@tabler/icons-react'

interface BatchResult {
  file: string
  success: boolean
  cnpj?: string
  razao_social?: string
  error?: string
}

interface ModalCertLoteProps {
  onClose: () => void
  onComplete: () => void
}

export function ModalCertLote({ onClose, onComplete }: ModalCertLoteProps): React.JSX.Element {
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

    // Get file paths from the electron environment
    const filePaths = files.map((f) => (f as any).path || f.name)

    const result = await window.api.addBatchCerts({
      files: filePaths,
      senhas: senhaArray
    })

    setResults(result)
    setLoading(false)

    if (result.some((r: BatchResult) => r.success)) {
      onComplete()
    }
  }

  return (
    <div className="modal-bg absolute inset-0 bg-black/38 flex items-center justify-center rounded-xl z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal bg-white border border-gray-200 rounded-xl p-5 w-[480px]">
        <div className="modal-title text-[15px] font-medium mb-3.5 flex items-center justify-between">
          Importação em Lote
          <button onClick={onClose} className="bg-none border-none cursor-pointer text-gray-400 text-lg p-0.5 leading-none hover:text-gray-900">
            <IconX size={18} />
          </button>
        </div>

        {results.length === 0 ? (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-gray-300 rounded-md p-5 text-center text-[12px] text-gray-400 cursor-pointer transition-colors hover:border-blue hover:text-blue"
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
                  <div key={i} className="flex items-center justify-between py-1.5 text-[12px] border-b border-gray-100 last:border-0">
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-red ml-2"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <label className="block text-[12px] text-gray-600 mb-1">Senhas (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="123456, senha_empresa"
                value={senhas}
                onChange={(e) => setSenhas(e.target.value)}
                className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
              />
            </div>

            <div className="modal-footer flex justify-end gap-2 mt-4 pt-3.5 border-t border-gray-200">
              <button onClick={onClose} className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={files.length === 0 || !senhas.trim() || loading}
                className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-[13px] font-medium mb-2">Resultado da Importação</div>
            <div className="max-h-[200px] overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 py-2 px-2.5 rounded-md mb-1 text-[12px] ${
                    r.success ? 'bg-green-light' : 'bg-red-light'
                  }`}
                >
                  {r.success ? (
                    <IconCheck size={14} className="text-green flex-shrink-0" />
                  ) : (
                    <IconAlertTriangle size={14} className="text-red flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{r.file.split(/[/\\]/).pop()}</div>
                    {r.success ? (
                      <div className="text-[11px] text-gray-600">{r.razao_social} · {r.cnpj}</div>
                    ) : (
                      <div className="text-[11px] text-red">{r.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer flex justify-end mt-4 pt-3.5 border-t border-gray-200">
              <button onClick={onClose} className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer">
                Concluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
