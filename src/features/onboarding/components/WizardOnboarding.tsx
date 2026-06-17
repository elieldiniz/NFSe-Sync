import { memo, useState } from 'react'
import { IconUpload } from '@tabler/icons-react'
import { Button, Input } from '@/shared/components'
import { electronService } from '@/services/electron.service'
import { useOnboarding } from '../hooks/useOnboarding'

interface WizardOnboardingProps {
  onComplete: () => void
}

export const WizardOnboarding = memo(function WizardOnboarding({ onComplete }: WizardOnboardingProps): React.JSX.Element {
  const { step, setStep, baseFolder, handleSelectFolder, handleSaveCertificate } = useOnboarding()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-7 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-800">
        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-[17px] font-medium text-gray-900 dark:text-gray-100 mb-2">Bem-vindo ao NFSe Sync</h1>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              Configure em 3 passos e comece a baixar suas notas automaticamente.
            </p>
            <button
              onClick={() => setStep('folder')}
              className="w-full py-2.5 px-4 bg-blue text-white font-medium rounded-md hover:bg-blue-dark transition-colors text-[13px]"
            >
              Começar Configuração
            </button>
          </div>
        )}

        {step === 'folder' && (
          <div>
            <h2 className="text-[17px] font-medium text-gray-900 dark:text-gray-100 mb-2">Pasta base</h2>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Selecione onde os arquivos XML e relatórios serão salvos.
            </p>
            <label className="block text-[12px] text-gray-600 dark:text-gray-400 mb-1">
              Pasta base para armazenar os documentos
            </label>
            <div className="flex gap-1.5 items-center">
              <span className="text-[11px] font-mono bg-gray-50 dark:bg-gray-800 py-1.5 px-2.5 rounded-md text-gray-600 dark:text-gray-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {baseFolder || 'Não selecionada'}
              </span>
              <Button size="sm" onClick={handleSelectFolder}>
                Alterar
              </Button>
            </div>
            {baseFolder && (
              <button
                onClick={() => setStep('certificate')}
                className="w-full py-2.5 px-4 bg-blue text-white font-medium rounded-md hover:bg-blue-dark transition-colors text-[13px] mt-4"
              >
                Próximo →
              </button>
            )}
          </div>
        )}

        {step === 'certificate' && (
          <CertificateStep onSave={handleSaveCertificate} />
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="text-[36px] mb-3">✓</div>
            <h2 className="text-[17px] font-medium text-gray-900 dark:text-gray-100 mb-2">Tudo pronto!</h2>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              Configuração concluída. O app irá sincronizar automaticamente no intervalo definido.
            </p>
            <button
              onClick={onComplete}
              className="w-full py-2.5 px-4 bg-blue text-white font-medium rounded-md hover:bg-blue-dark transition-colors text-[13px]"
            >
              Ir para o Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

const CertificateStep = memo(function CertificateStep({
  onSave
}: {
  onSave: (cert: {
    cnpj: string
    razao_social: string
    caminho_pfx: string
    senha: string
    validade_cert: string
  }) => void
}): React.JSX.Element {
  const [pfxPath, setPfxPath] = useState<string | null>(null)
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certInfo, setCertInfo] = useState<{ cnpj: string; razao_social: string; validade_cert: string } | null>(null)

  const handleSelectPfx = async () => {
    const path = await electronService.selectPfxFile()
    if (path) {
      setPfxPath(path)
      setCertInfo(null)
    }
  }

  const handleReadCert = async () => {
    if (!pfxPath || !senha) return
    setLoading(true)
    setError(null)

    const result = await electronService.extractCertInfo(pfxPath, senha)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setCertInfo(result)
    setLoading(false)
  }

  const handleSave = () => {
    if (!pfxPath || !certInfo) return
    onSave({
      cnpj: certInfo.cnpj,
      razao_social: certInfo.razao_social,
      caminho_pfx: pfxPath,
      senha,
      validade_cert: certInfo.validade_cert
    })
  }

  return (
    <div>
      <h2 className="text-[17px] font-medium text-gray-900 dark:text-gray-100 mb-2">Adicionar certificado</h2>
      <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
        Precisamos do arquivo .pfx da empresa para autenticar na Sefaz.
      </p>

      <div
        onClick={handleSelectPfx}
        className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center text-[12px] text-gray-400 dark:text-gray-500 cursor-pointer transition-colors hover:border-blue hover:text-blue"
      >
        <IconUpload size={20} className="mx-auto mb-1" />
        {pfxPath ? (
          <span className="text-blue font-medium">{pfxPath.split(/[/\\]/).pop()}</span>
        ) : (
          'Selecionar .pfx'
        )}
      </div>

      <div className="mt-3">
        <Input
          label="Senha do certificado"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {pfxPath && senha && !certInfo && (
        <button
          onClick={handleReadCert}
          disabled={loading}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-[13px] mt-3"
        >
          {loading ? 'Lendo certificado...' : 'Ler Certificado'}
        </button>
      )}

      {certInfo && (
        <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-md p-2.5 text-[12px]">
          <div className="font-medium dark:text-gray-200">{certInfo.razao_social}</div>
          <div className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">
            CNPJ: {certInfo.cnpj} · Validade: {new Date(certInfo.validade_cert).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )}

      {error && <div className="mt-2 text-[12px] text-red">{error}</div>}

      <div className="flex justify-between mt-5">
        <Button>← Anterior</Button>
        <Button variant="primary" onClick={handleSave} disabled={!certInfo}>
          Salvar
        </Button>
      </div>
    </div>
  )
})
