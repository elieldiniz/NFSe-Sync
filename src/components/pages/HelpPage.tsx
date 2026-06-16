import { useState } from 'react'
import {
  IconTopologyStar,
  IconFolderOpen,
  IconFileSpreadsheet,
  IconClock,
  IconFolder,
  IconCopy,
  IconCheck
} from '@tabler/icons-react'

const glossary = [
  { term: 'PFX / .p12', desc: 'Arquivo do certificado digital A1 contendo chave privada e certificado criptografados por senha.' },
  { term: 'NSU', desc: 'Número Sequencial Único. Identificador incremental da Sefaz para cada evento vinculado ao seu CNPJ.' },
  { term: 'mTLS', desc: 'TLS mútuo. A Sefaz exige autenticação via certificado digital nos dois lados da conexão HTTPS.' },
  { term: 'Retenção', desc: 'Imposto (ISS, IRRF, PIS, COFINS, CSLL, INSS) retido na fonte pelo tomador do serviço.' },
  { term: 'HTTP 429', desc: 'Rate limit da Sefaz. O app aguarda o header Retry-After e exibe mensagem de espera na tela.' }
]

export function HelpPage(): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleOpenFolder = () => {
    window.api.openBaseFolder()
  }

  const handleCopyLogs = async () => {
    const errors = await window.api.getSyncErrors()
    if (errors.length === 0) {
      await navigator.clipboard.writeText('Nenhum erro registrado.')
    } else {
      const text = errors.map((e: any) =>
        `[${e.created_at}] NSU ${e.nsu} - ${e.razao_social} (${e.cnpj}): ${e.mensagem}`
      ).join('\n')
      await navigator.clipboard.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="content flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium">Ajuda e Guia do Usuário</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="help-card bg-white border border-gray-200 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
            <IconTopologyStar size={15} className="text-blue" />
            Como funciona
          </h3>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            O app consulta a Sefaz pelo NSU mais recente, baixa lotes de até 500 notas, valida, grava no banco local e organiza os arquivos por competência automaticamente.
          </p>
        </div>

        <div className="help-card bg-white border border-gray-200 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
            <IconFolderOpen size={15} className="text-blue" />
            Onde ficam os arquivos
          </h3>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Todos os XMLs ficam em <code className="font-mono text-[11px]">[Pasta Base]/NFSENacional/[CNPJ]/AAAA-MM/</code>. Subpastas: Emitidas, Recebidas, Eventos, Retenções.
          </p>
          <button
            onClick={handleOpenFolder}
            className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center gap-1 mt-2 hover:bg-gray-50"
          >
            <IconFolder size={14} />
            Abrir pasta
          </button>
        </div>

        <div className="help-card bg-white border border-gray-200 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
            <IconFileSpreadsheet size={15} className="text-blue" />
            Relatórios gerados
          </h3>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Para cada competência com retenção, são gerados automaticamente <strong>PDF</strong> e <strong>XLSX</strong> na pasta <code className="font-mono text-[11px]">Retencoes/</code>.
          </p>
        </div>

        <div className="help-card bg-white border border-gray-200 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
            <IconClock size={15} className="text-blue" />
            Barra de sincronização
          </h3>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Mostra a empresa atual, o NSU sendo processado e o total de documentos salvos. Rate limit da Sefaz exibe mensagem de aguardo automático.
          </p>
        </div>
      </div>

      <div className="card bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13px] font-medium">Glossário</h3>
        </div>
        {glossary.map((item, i) => (
          <div key={i} className="flex gap-2 py-1.5 border-b border-gray-200 last:border-0 text-[12px]">
            <span className="term font-mono text-blue min-w-[70px] flex-shrink-0">{item.term}</span>
            <span className="text-gray-600">{item.desc}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCopyLogs}
          className="btn sm text-[12px] py-1.5 px-2.5 rounded-md border border-gray-300 bg-white cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-50"
        >
          {copied ? <IconCheck size={14} className="text-green" /> : <IconCopy size={14} />}
          {copied ? 'Copiado!' : 'Copiar log de erros'}
        </button>
      </div>
    </div>
  )
}
