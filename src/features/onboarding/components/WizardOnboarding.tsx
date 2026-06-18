import { memo, useState } from 'react'
import {
  IconUpload,
  IconFolder,
  IconShieldCheck,
  IconArrowRight,
  IconLayoutDashboard,
  IconCertificate,
  IconRefresh,
  IconFileText,
  IconCheck
} from '@tabler/icons-react'
import { Button, Input } from '@/shared/components'
import { electronService } from '@/services/electron.service'
import { useOnboarding } from '../hooks/useOnboarding'

interface WizardOnboardingProps {
  onComplete: () => void
}

// ─── Etapas do wizard ──────────────────────────────────────────────────────
type Step = 'welcome' | 'folder' | 'certificate' | 'complete'

const STEPS: { key: Exclude<Step, 'welcome' | 'complete'>; label: string }[] = [
  { key: 'folder', label: 'Pasta base' },
  { key: 'certificate', label: 'Certificado' }
]

// ─── Componente principal ──────────────────────────────────────────────────
export const WizardOnboarding = memo(function WizardOnboarding({
  onComplete
}: WizardOnboardingProps): React.JSX.Element {
  const { step, setStep, baseFolder, handleSelectFolder, handleSaveCertificate } = useOnboarding()

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Tela de boas-vindas */}
      {step === 'welcome' && <WelcomeScreen onStart={() => setStep('folder')} onSkip={onComplete} />}

      {/* Wizard com steps */}
      {(step === 'folder' || step === 'certificate' || step === 'complete') && (
        <div className="w-full max-w-lg mx-auto px-4">
          {/* Cabeçalho do wizard */}
          {step !== 'complete' && (
            <div className="mb-6">
              <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                NFS<span className="text-blue">e</span> Sync · Configuração inicial
              </div>
              {/* Barra de progresso */}
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => {
                  const currentIdx = STEPS.findIndex((x) => x.key === step)
                  const done = i < currentIdx
                  const active = s.key === step
                  return (
                    <div key={s.key} className="flex items-center gap-2 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors ${
                          done
                            ? 'bg-green text-white'
                            : active
                              ? 'bg-blue text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {done ? <IconCheck size={11} /> : i + 1}
                      </div>
                      <span
                        className={`text-[12px] ${active ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        {s.label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-px transition-colors ${done ? 'bg-green' : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Card do step */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-7">
            {step === 'folder' && (
              <FolderStep
                baseFolder={baseFolder}
                onSelectFolder={handleSelectFolder}
                onNext={() => setStep('certificate')}
              />
            )}
            {step === 'certificate' && (
              <CertificateStep onSave={handleSaveCertificate} onBack={() => setStep('folder')} />
            )}
            {step === 'complete' && <CompleteStep onFinish={onComplete} />}
          </div>
        </div>
      )}
    </div>
  )
})

// ─── Tela de boas-vindas ───────────────────────────────────────────────────
const WelcomeScreen = memo(function WelcomeScreen({
  onStart,
  onSkip
}: {
  onStart: () => void
  onSkip: () => void
}) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 text-center">
      {/* Logo / Brand */}
      <div className="inline-flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center">
          <IconRefresh size={20} className="text-white" strokeWidth={2} />
        </div>
        <div className="text-left">
          <div className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 leading-none">
            NFS<span className="text-blue">e</span> Sync
          </div>
          <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500 tracking-wider mt-0.5">
            v2.2 · Desktop
          </div>
        </div>
      </div>

      {/* Título principal */}
      <h1 className="text-[26px] font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-3">
        Bem-vindo ao NFSe Sync Desktop
      </h1>
      <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto mb-10">
        Este app sincroniza automaticamente suas Notas Fiscais de Serviço eletrônicas diretamente
        da Sefaz — sem precisar acessar o portal manualmente. Tudo fica salvo localmente em XML e
        disponível nos relatórios.
      </p>

      {/* Como funciona */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: IconCertificate,
            title: 'Certificado digital',
            desc: 'Usa o seu .pfx para autenticar na Sefaz com segurança'
          },
          {
            icon: IconRefresh,
            title: 'Sincronização automática',
            desc: 'Baixa as NFS-e no intervalo que você definir, em segundo plano'
          },
          {
            icon: IconFileText,
            title: 'XMLs + Relatórios',
            desc: 'Armazena os arquivos e gera relatórios de retenções por competência'
          }
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-light dark:bg-blue/20 flex items-center justify-center mb-3">
              <Icon size={16} className="text-blue" strokeWidth={1.5} />
            </div>
            <div className="text-[13px] font-medium text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark transition-colors text-[13px]"
        >
          Configurar agora
          <IconArrowRight size={15} />
        </button>
        <button
          onClick={onSkip}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-[13px]"
        >
          <IconLayoutDashboard size={15} />
          Ir para o Dashboard
        </button>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
        Você pode configurar o certificado depois em <strong>Certificados</strong>
      </p>
    </div>
  )
})

// ─── Step 1: Pasta base ────────────────────────────────────────────────────
const FolderStep = memo(function FolderStep({
  baseFolder,
  onSelectFolder,
  onNext
}: {
  baseFolder: string | null
  onSelectFolder: () => void
  onNext: () => void
}) {
  return (
    <div>
      {/* Ícone + título */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-light dark:bg-blue/20 flex items-center justify-center flex-shrink-0">
          <IconFolder size={18} className="text-blue" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">
            Pasta base de armazenamento
          </h2>
          <p className="text-[12px] text-gray-400 dark:text-gray-500">Passo 1 de 2</p>
        </div>
      </div>

      {/* Explicação */}
      <div className="bg-blue-light dark:bg-blue/10 rounded-lg p-3 mb-5 text-[12px] text-blue leading-relaxed">
        <strong>O que é isso?</strong> É a pasta no seu computador onde o app vai salvar todos os
        arquivos XML das notas fiscais e os relatórios gerados. Escolha um local de fácil acesso,
        como <span className="font-mono">Documentos/NFSe</span>.
      </div>

      {/* Seleção */}
      <label className="block text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
        Pasta selecionada
      </label>
      <div className="flex gap-2 items-center">
        <span className="text-[11px] font-mono bg-gray-50 dark:bg-gray-900 py-2 px-3 rounded-lg text-gray-600 dark:text-gray-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap border border-gray-200 dark:border-gray-700">
          {baseFolder || 'Nenhuma pasta selecionada'}
        </span>
        <Button size="sm" onClick={onSelectFolder}>
          Alterar
        </Button>
      </div>

      {!baseFolder && (
        <p className="text-[11px] text-amber dark:text-amber mt-2">
          ↑ Selecione uma pasta para continuar
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!baseFolder}
          className="inline-flex items-center gap-2 py-2 px-5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
        >
          Próximo
          <IconArrowRight size={14} />
        </button>
      </div>
    </div>
  )
})

// ─── Step 2: Certificado ───────────────────────────────────────────────────
const CertificateStep = memo(function CertificateStep({
  onSave,
  onBack
}: {
  onSave: (cert: {
    cnpj: string
    razao_social: string
    caminho_pfx: string
    senha: string
    validade_cert: string
  }) => void
  onBack: () => void
}): React.JSX.Element {
  const [pfxPath, setPfxPath] = useState<string | null>(null)
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certInfo, setCertInfo] = useState<{
    cnpj: string
    razao_social: string
    validade_cert: string
  } | null>(null)

  const handleSelectPfx = async () => {
    const path = await electronService.selectPfxFile()
    if (path) {
      setPfxPath(path)
      setCertInfo(null)
      setError(null)
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
    onSave({ cnpj: certInfo.cnpj, razao_social: certInfo.razao_social, caminho_pfx: pfxPath, senha, validade_cert: certInfo.validade_cert })
  }

  return (
    <div>
      {/* Ícone + título */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-light dark:bg-blue/20 flex items-center justify-center flex-shrink-0">
          <IconShieldCheck size={18} className="text-blue" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">
            Certificado digital A1
          </h2>
          <p className="text-[12px] text-gray-400 dark:text-gray-500">Passo 2 de 2</p>
        </div>
      </div>

      {/* Explicação */}
      <div className="bg-blue-light dark:bg-blue/10 rounded-lg p-3 mb-5 text-[12px] text-blue leading-relaxed">
        <strong>O que é isso?</strong> O certificado digital A1 (<span className="font-mono">.pfx</span>)
        é como uma "assinatura eletrônica" da empresa. O app usa ele para se autenticar na Sefaz e
        baixar as notas fiscais com segurança. Sua senha <strong>não é enviada para nenhum servidor</strong>
        — fica salva apenas localmente.
      </div>

      {/* Upload do .pfx */}
      <div
        onClick={handleSelectPfx}
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center cursor-pointer transition-colors hover:border-blue hover:bg-blue-light/30 dark:hover:bg-blue/5 mb-4"
      >
        <IconUpload size={22} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
        {pfxPath ? (
          <div>
            <div className="text-[13px] text-blue font-medium">{pfxPath.split(/[/\\]/).pop()}</div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Clique para trocar</div>
          </div>
        ) : (
          <div>
            <div className="text-[13px] text-gray-600 dark:text-gray-400 font-medium">
              Selecionar arquivo .pfx
            </div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Clique aqui ou arraste o certificado
            </div>
          </div>
        )}
      </div>

      {/* Senha */}
      <Input
        label="Senha do certificado"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="••••••••"
      />
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 mb-4">
        A senha fica salva apenas no banco de dados local — nunca é enviada pela rede.
      </p>

      {/* Botão ler certificado */}
      {pfxPath && senha && !certInfo && (
        <button
          onClick={handleReadCert}
          disabled={loading}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-[13px] mb-3"
        >
          {loading ? 'Lendo certificado...' : 'Ler e validar certificado'}
        </button>
      )}

      {/* Info do certificado lido */}
      {certInfo && (
        <div className="bg-green-light dark:bg-green/10 border border-green/30 rounded-lg p-3 mb-3 flex items-start gap-2">
          <IconCheck size={15} className="text-green flex-shrink-0 mt-0.5" />
          <div className="text-[12px]">
            <div className="font-medium text-gray-900 dark:text-gray-100">{certInfo.razao_social}</div>
            <div className="text-gray-500 dark:text-gray-400 font-mono text-[11px] mt-0.5">
              CNPJ: {certInfo.cnpj} · Válido até:{' '}
              {new Date(certInfo.validade_cert).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-light dark:bg-red/10 border border-red/20 rounded-lg p-3 mb-3 text-[12px] text-red">
          {error}
        </div>
      )}

      {/* Navegação */}
      <div className="flex justify-between mt-4">
        <Button onClick={onBack}>← Voltar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!certInfo}>
          Salvar e concluir
        </Button>
      </div>
    </div>
  )
})

// ─── Tela de conclusão ─────────────────────────────────────────────────────
const CompleteStep = memo(function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-green-light dark:bg-green/20 flex items-center justify-center mx-auto mb-4">
        <IconCheck size={28} className="text-green" />
      </div>
      <h2 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Tudo configurado!
      </h2>
      <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-xs mx-auto">
        O app está pronto. Acesse o Dashboard para iniciar a primeira sincronização e acompanhar as
        notas fiscais.
      </p>
      <button
        onClick={onFinish}
        className="inline-flex items-center gap-2 py-2.5 px-6 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark transition-colors text-[13px]"
      >
        <IconLayoutDashboard size={15} />
        Ir para o Dashboard
      </button>
    </div>
  )
})
