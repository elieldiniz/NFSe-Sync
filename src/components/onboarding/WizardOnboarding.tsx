import { useState } from 'react'

interface WizardOnboardingProps {
  onComplete: () => void
}

type Step = 'welcome' | 'folder' | 'certificate' | 'complete'

export function WizardOnboarding({ onComplete }: WizardOnboardingProps): React.JSX.Element {
  const [step, setStep] = useState<Step>('welcome')
  const [baseFolder, setBaseFolder] = useState<string | null>(null)

  const handleSelectFolder = async () => {
    const folder = await window.api.selectBaseFolder()
    if (folder) {
      setBaseFolder(folder)
      await window.api.saveBaseFolder(folder)
      setStep('certificate')
    }
  }

  const handleSaveCertificate = async (cert: {
    cnpj: string
    razao_social: string
    caminho_pfx: string
    senha: string
    validade_cert: string
  }) => {
    await window.api.saveCertificate({
      cnpj: cert.cnpj,
      razao_social: cert.razao_social,
      caminho_pfx: cert.caminho_pfx,
      senha_criptografada: Buffer.from(cert.senha, 'utf-8'),
      validade_cert: cert.validade_cert
    })
    setStep('complete')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-7 bg-white rounded-xl border border-gray-200 shadow">
        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-[17px] font-medium text-gray-900 mb-2">Bem-vindo ao NFSe Sync</h1>
            <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
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
            <h2 className="text-[17px] font-medium text-gray-900 mb-2">Pasta base</h2>
            <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
              Selecione onde os arquivos XML e relatórios serão salvos.
            </p>
            <label className="block text-[12px] text-gray-600 mb-1">Pasta base para armazenar os documentos</label>
            <div className="flex gap-1.5 items-center">
              <span className="text-[11px] font-mono bg-gray-50 py-1.5 px-2.5 rounded-md text-gray-600 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {baseFolder || 'Não selecionada'}
              </span>
              <button
                onClick={handleSelectFolder}
                className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center gap-1 hover:bg-gray-50"
              >
                Alterar
              </button>
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
            <h2 className="text-[17px] font-medium text-gray-900 mb-2">Tudo pronto!</h2>
            <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
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
}

function CertificateStep({ onSave }: { onSave: (cert: any) => void }): React.JSX.Element {
  const [pfxPath, setPfxPath] = useState<string | null>(null)
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certInfo, setCertInfo] = useState<any>(null)

  const handleSelectPfx = async () => {
    const path = await window.api.selectPfxFile()
    if (path) {
      setPfxPath(path)
      setCertInfo(null)
    }
  }

  const handleReadCert = async () => {
    if (!pfxPath || !senha) return
    setLoading(true)
    setError(null)

    const result = await window.api.extractCertInfo(pfxPath, senha)
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
      <h2 className="text-[17px] font-medium text-gray-900 mb-2">Adicionar certificado</h2>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
        Precisamos do arquivo .pfx da empresa para autenticar na Sefaz.
      </p>

      <div
        onClick={handleSelectPfx}
        className="border border-dashed border-gray-300 rounded-md p-4 text-center text-[12px] text-gray-400 cursor-pointer transition-colors hover:border-blue hover:text-blue"
      >
        <IconUpload size={20} className="mx-auto mb-1" />
        {pfxPath ? (
          <span className="text-blue font-medium">{pfxPath.split(/[/\\]/).pop()}</span>
        ) : (
          'Selecionar .pfx'
        )}
      </div>

      <label className="block text-[12px] text-gray-600 mt-3 mb-1">Senha do certificado</label>
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="••••••••"
        className="w-full py-2 px-2.5 border border-gray-300 rounded-md text-[13px] font-sans bg-white text-gray-900 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
      />

      {pfxPath && senha && !certInfo && (
        <button
          onClick={handleReadCert}
          disabled={loading}
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors text-[13px] mt-3"
        >
          {loading ? 'Lendo certificado...' : 'Ler Certificado'}
        </button>
      )}

      {certInfo && (
        <div className="mt-3 bg-gray-50 rounded-md p-2.5 text-[12px]">
          <div className="font-medium">{certInfo.razao_social}</div>
          <div className="text-gray-500 font-mono text-[11px]">
            CNPJ: {certInfo.cnpj} · Validade: {new Date(certInfo.validade_cert).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )}

      {error && <div className="mt-2 text-[12px] text-red">{error}</div>}

      <div className="flex justify-between mt-5">
        <button className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer">
          ← Anterior
        </button>
        <button
          onClick={handleSave}
          disabled={!certInfo}
          className="btn sm primary text-[12px] py-1.5 px-2.5 rounded-md bg-blue text-white border border-blue cursor-pointer disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}

function IconUpload({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
