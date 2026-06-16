import { useState } from 'react'
import { IconX, IconFileCertificate, IconCheck, IconAlertTriangle } from '@tabler/icons-react'

interface ModalCertSingleProps {
  onClose: () => void
  onComplete: () => void
}

export function ModalCertSingle({ onClose, onComplete }: ModalCertSingleProps): React.JSX.Element {
  const [pfxPath, setPfxPath] = useState<string | null>(null)
  const [pfxName, setPfxName] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [certInfo, setCertInfo] = useState<{ cnpj: string; razao_social: string } | null>(null)

  const handleSelectFile = async () => {
    const path = await window.api.selectPfxFile()
    if (path) {
      setPfxPath(path)
      setPfxName(path.split(/[/\\]/).pop() || path)
      setError('')
    }
  }

  const handleImport = async () => {
    if (!pfxPath || !senha.trim()) return

    setLoading(true)
    setError('')

    try {
      const info = await window.api.extractCertInfo(pfxPath, senha.trim())
      if (info.error) {
        setError(info.error)
        setLoading(false)
        return
      }

      await window.api.saveCertificate({
        cnpj: info.cnpj,
        razao_social: info.razao_social,
        caminho_pfx: pfxPath,
        senha: senha.trim(),
        validade_cert: info.validade_cert
      })

      setCertInfo({ cnpj: info.cnpj, razao_social: info.razao_social })
      setSuccess(true)
      onComplete()
    } catch (err: any) {
      console.error('[ModalCertSingle] Error:', err)
      setError(err?.message || err?.toString() || 'Erro ao importar certificado. Verifique a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-bg absolute inset-0 bg-black/38 flex items-center justify-center rounded-xl z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal bg-white border border-gray-200 rounded-xl p-5 w-[420px]">
        <div className="modal-title text-[15px] font-medium mb-3.5 flex items-center justify-between">
          Adicionar Certificado
          <button onClick={onClose} className="bg-none border-none cursor-pointer text-gray-400 text-lg p-0.5 leading-none hover:text-gray-900">
            <IconX size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <IconCheck size={32} className="mx-auto mb-2 text-green" />
            <div className="text-[13px] font-medium mb-1">Certificado importado com sucesso</div>
            <div className="text-[12px] text-gray-500">{certInfo?.razao_social}</div>
            <div className="text-[11px] text-gray-400 font-mono mt-1">{certInfo?.cnpj}</div>
            <div className="modal-footer flex justify-end mt-4 pt-3.5 border-t border-gray-200">
              <button onClick={onClose} className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer">
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={handleSelectFile}
              className={`border border-dashed rounded-md p-5 text-center text-[12px] cursor-pointer transition-colors ${
                pfxPath ? 'border-green bg-green-light/30 text-green-dark' : 'border-gray-300 text-gray-400 hover:border-blue hover:text-blue'
              }`}
            >
              {pfxPath ? (
                <>
                  <IconFileCertificate size={24} className="mx-auto mb-2" />
                  <div className="font-medium">{pfxName}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Clique para trocar</div>
                </>
              ) : (
                <>
                  <IconFileCertificate size={24} className="mx-auto mb-2" />
                  <div>Clique para selecionar o arquivo <strong>.pfx</strong></div>
                </>
              )}
            </div>

            {pfxPath && (
              <div className="mt-3">
                <label className="block text-[12px] text-gray-600 mb-1">Senha do certificado</label>
                <input
                  type="password"
                  placeholder="Digite a senha"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                  className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
                />
              </div>
            )}

            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-red bg-red-light/30 py-1.5 px-2.5 rounded-md">
                <IconAlertTriangle size={14} />
                {error}
              </div>
            )}

            <div className="modal-footer flex justify-end gap-2 mt-4 pt-3.5 border-t border-gray-200">
              <button onClick={onClose} className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!pfxPath || !senha.trim() || loading}
                className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
