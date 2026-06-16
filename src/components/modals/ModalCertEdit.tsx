import { useState } from 'react'
import { IconX, IconCheck, IconAlertTriangle, IconFileCertificate } from '@tabler/icons-react'

interface Cert {
  id: string
  cnpj: string
  razao_social: string
  caminho_pfx: string
  validade_cert: string
  sinc_automatica: boolean
}

interface ModalCertEditProps {
  cert: Cert
  onClose: () => void
  onComplete: () => void
}

export function ModalCertEdit({ cert, onClose, onComplete }: ModalCertEditProps): React.JSX.Element {
  const [razaoSocial, setRazaoSocial] = useState(cert.razao_social)
  const [cnpj, setCnpj] = useState(cert.cnpj)
  const [sincAut, setSincAut] = useState(cert.sinc_automatica)
  const [newPfxPath, setNewPfxPath] = useState<string | null>(null)
  const [newPfxName, setNewPfxName] = useState('')
  const [newSenha, setNewSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSelectFile = async () => {
    const path = await window.api.selectPfxFile()
    if (path) {
      setNewPfxPath(path)
      setNewPfxName(path.split(/[/\\]/).pop() || path)
    }
  }

  const handleSave = async () => {
    if (!razaoSocial.trim()) {
      setError('Razão Social é obrigatória')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updateData: any = {
        id: cert.id,
        razao_social: razaoSocial.trim(),
        cnpj: cnpj.trim(),
        sinc_automatica: sincAut
      }

      if (newPfxPath) {
        updateData.caminho_pfx = newPfxPath
      }

      if (newSenha.trim()) {
        const info = await window.api.extractCertInfo(newPfxPath || cert.caminho_pfx, newSenha.trim())
        if (info.error) {
          setError('Senha incorreta para o certificado selecionado')
          setLoading(false)
          return
        }
        updateData.senha = newSenha.trim()
        updateData.razao_social = info.razao_social || razaoSocial.trim()
        updateData.cnpj = info.cnpj || cnpj.trim()
      }

      await window.api.updateCertificate(updateData)
      setSuccess(true)
      onComplete()
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-bg absolute inset-0 bg-black/38 flex items-center justify-center rounded-xl z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal bg-white border border-gray-200 rounded-xl p-5 w-[440px]">
        <div className="modal-title text-[15px] font-medium mb-3.5 flex items-center justify-between">
          Editar Certificado
          <button onClick={onClose} className="bg-none border-none cursor-pointer text-gray-400 text-lg p-0.5 leading-none hover:text-gray-900">
            <IconX size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <IconCheck size={32} className="mx-auto mb-2 text-green" />
            <div className="text-[13px] font-medium mb-1">Salvo com sucesso</div>
            <div className="modal-footer flex justify-end mt-4 pt-3.5 border-t border-gray-200">
              <button onClick={onClose} className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer">
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-[12px] text-gray-600 mb-1">Razão Social</label>
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[12px] text-gray-600 mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
              />
            </div>

            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="sincAut"
                checked={sincAut}
                onChange={(e) => setSincAut(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="sincAut" className="text-[12px] text-gray-600 cursor-pointer">Sincronização automática</label>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-1 mb-3">
              <div className="text-[12px] text-gray-600 mb-2 font-medium">Atualizar certificado (opcional)</div>

              <div
                onClick={handleSelectFile}
                className={`border border-dashed rounded-md p-3 text-center text-[12px] cursor-pointer transition-colors mb-2 ${
                  newPfxPath ? 'border-green bg-green-light/30 text-green-dark' : 'border-gray-300 text-gray-400 hover:border-blue hover:text-blue'
                }`}
              >
                {newPfxPath ? (
                  <div className="flex items-center justify-center gap-2">
                    <IconFileCertificate size={16} />
                    <span className="font-medium">{newPfxName}</span>
                  </div>
                ) : (
                  <div>Clique para selecionar novo arquivo <strong>.pfx</strong></div>
                )}
              </div>

              {newPfxPath && (
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Nova senha</label>
                  <input
                    type="password"
                    placeholder="Digite a senha do novo certificado"
                    value={newSenha}
                    onChange={(e) => { setNewSenha(e.target.value); setError('') }}
                    className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
                  />
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-400 mb-3">
              Validade atual: {new Date(cert.validade_cert).toLocaleDateString('pt-BR')}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-[12px] text-red bg-red-light/30 py-1.5 px-2.5 rounded-md mb-3">
                <IconAlertTriangle size={14} />
                {error}
              </div>
            )}

            <div className="modal-footer flex justify-end gap-2 pt-3.5 border-t border-gray-200">
              <button onClick={onClose} className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
