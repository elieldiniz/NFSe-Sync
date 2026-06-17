import { memo, useState } from 'react'
import { IconFileCertificate, IconCheck, IconAlertTriangle } from '@tabler/icons-react'
import { Modal, ModalFooter, Button, Input } from '@/shared/components'
import { electronService } from '@/services/electron.service'

interface ModalCertSingleProps {
  onClose: () => void
  onComplete: () => void
}

export const ModalCertSingle = memo(function ModalCertSingle({ onClose, onComplete }: ModalCertSingleProps): React.JSX.Element {
  const [pfxPath, setPfxPath] = useState<string | null>(null)
  const [pfxName, setPfxName] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [certInfo, setCertInfo] = useState<{ cnpj: string; razao_social: string } | null>(null)

  const handleSelectFile = async () => {
    const path = await electronService.selectPfxFile()
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
      const info = await electronService.extractCertInfo(pfxPath, senha.trim())
      if (info.error) {
        setError(info.error)
        setLoading(false)
        return
      }

      await electronService.saveCertificate({
        cnpj: info.cnpj,
        razao_social: info.razao_social,
        caminho_pfx: pfxPath,
        senha: senha.trim(),
        validade_cert: info.validade_cert
      })

      setCertInfo({ cnpj: info.cnpj, razao_social: info.razao_social })
      setSuccess(true)
      onComplete()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[ModalCertSingle] Error:', err)
      setError(message || 'Erro ao importar certificado. Verifique a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Adicionar Certificado" width="w-[420px]">
      {success ? (
        <div className="text-center py-4">
          <IconCheck size={32} className="mx-auto mb-2 text-green" />
          <div className="text-[13px] font-medium mb-1 dark:text-gray-100">Certificado importado com sucesso</div>
          <div className="text-[12px] text-gray-500 dark:text-gray-400">{certInfo?.razao_social}</div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-1">{certInfo?.cnpj}</div>
          <ModalFooter>
            <Button variant="primary" onClick={onClose}>
              Concluir
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <>
          <div
            onClick={handleSelectFile}
            className={`border border-dashed rounded-md p-5 text-center text-[12px] cursor-pointer transition-colors ${
              pfxPath
                ? 'border-green bg-green-light/30 dark:bg-green/10 text-green-dark dark:text-green-light'
                : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue hover:text-blue'
            }`}
          >
            {pfxPath ? (
              <>
                <IconFileCertificate size={24} className="mx-auto mb-2" />
                <div className="font-medium dark:text-gray-200">{pfxName}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Clique para trocar</div>
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
              <Input
                label="Senha do certificado"
                type="password"
                placeholder="Digite a senha"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
              />
            </div>
          )}

          {error && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-red bg-red-light/30 dark:bg-red/10 py-1.5 px-2.5 rounded-md">
              <IconAlertTriangle size={14} />
              {error}
            </div>
          )}

          <ModalFooter>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!pfxPath || !senha.trim() || loading}
            >
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  )
})
