import { memo, useState } from 'react'
import { IconCheck, IconAlertTriangle, IconFileCertificate } from '@tabler/icons-react'
import { Modal, ModalFooter, Button, Input } from '@/shared/components'
import { electronService } from '@/services/electron.service'
import type { Certificado } from '@/types'

interface ModalCertEditProps {
  cert: Certificado
  onClose: () => void
  onComplete: () => void
}

export const ModalCertEdit = memo(function ModalCertEdit({ cert, onClose, onComplete }: ModalCertEditProps): React.JSX.Element {
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
    const path = await electronService.selectPfxFile()
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
      const updateData: { id: string; razao_social?: string; cnpj?: string; sinc_automatica?: boolean; caminho_pfx?: string; senha?: string } = {
        id: cert.id,
        razao_social: razaoSocial.trim(),
        cnpj: cnpj.trim(),
        sinc_automatica: sincAut
      }

      if (newPfxPath) {
        updateData.caminho_pfx = newPfxPath
      }

      if (newSenha.trim()) {
        const info = await electronService.extractCertInfo(newPfxPath || cert.caminho_pfx, newSenha.trim())
        if (info.error) {
          setError('Senha incorreta para o certificado selecionado')
          setLoading(false)
          return
        }
        updateData.senha = newSenha.trim()
        updateData.razao_social = info.razao_social || razaoSocial.trim()
        updateData.cnpj = info.cnpj || cnpj.trim()
      }

      await electronService.updateCertificate(updateData)
      setSuccess(true)
      onComplete()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Editar Certificado" width="w-[440px]">
      {success ? (
        <div className="text-center py-4">
          <IconCheck size={32} className="mx-auto mb-2 text-green" />
          <div className="text-[13px] font-medium mb-1 dark:text-gray-100">Salvo com sucesso</div>
          <ModalFooter>
            <Button variant="primary" onClick={onClose}>
              Concluir
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Input
              label="Razão Social"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Input
              label="CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
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
            <label htmlFor="sincAut" className="text-[12px] text-gray-600 dark:text-gray-400 cursor-pointer">
              Sincronização automática
            </label>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1 mb-3">
            <div className="text-[12px] text-gray-600 dark:text-gray-400 mb-2 font-medium">Atualizar certificado (opcional)</div>

            <div
              onClick={handleSelectFile}
              className={`border border-dashed rounded-md p-3 text-center text-[12px] cursor-pointer transition-colors mb-2 ${
                newPfxPath
                  ? 'border-green bg-green-light/30 dark:bg-green/10 text-green-dark dark:text-green-light'
                  : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue hover:text-blue'
              }`}
            >
              {newPfxPath ? (
                <div className="flex items-center justify-center gap-2">
                  <IconFileCertificate size={16} />
                  <span className="font-medium dark:text-gray-200">{newPfxName}</span>
                </div>
              ) : (
                <div>Clique para selecionar novo arquivo <strong>.pfx</strong></div>
              )}
            </div>

            {newPfxPath && (
              <Input
                label="Nova senha"
                type="password"
                placeholder="Digite a senha do novo certificado"
                value={newSenha}
                onChange={(e) => { setNewSenha(e.target.value); setError('') }}
              />
            )}
          </div>

          <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">
            Validade atual: {new Date(cert.validade_cert).toLocaleDateString('pt-BR')}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-[12px] text-red bg-red-light/30 dark:bg-red/10 py-1.5 px-2.5 rounded-md mb-3">
              <IconAlertTriangle size={14} />
              {error}
            </div>
          )}

          <ModalFooter>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  )
})
