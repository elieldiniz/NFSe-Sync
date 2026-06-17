import { memo } from 'react'
import {
  IconTopologyStar,
  IconFolderOpen,
  IconFileSpreadsheet,
  IconClock,
  IconFolder,
  IconCopy,
  IconCheck
} from '@tabler/icons-react'
import { Card, Button } from '@/shared/components'
import { useHelp } from '../hooks/useHelp'

const glossary = [
  { term: 'PFX / .p12', desc: 'Arquivo do certificado digital A1 contendo chave privada e certificado criptografados por senha.' },
  { term: 'NSU', desc: 'Número Sequencial Único. Identificador incremental da Sefaz para cada evento vinculado ao seu CNPJ.' },
  { term: 'mTLS', desc: 'TLS mútuo. A Sefaz exige autenticação via certificado digital nos dois lados da conexão HTTPS.' },
  { term: 'Retenção', desc: 'Imposto (ISS, IRRF, PIS, COFINS, CSLL, INSS) retido na fonte pelo tomador do serviço.' },
  { term: 'HTTP 429', desc: 'Rate limit da Sefaz. O app aguarda o header Retry-After e exibe mensagem de espera na tela.' }
]

export const HelpPage = memo(function HelpPage(): React.JSX.Element {
  const { copied, handleOpenFolder, handleCopyLogs } = useHelp()

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[15px] font-medium dark:text-gray-100">Ajuda e Guia do Usuário</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="help-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5 dark:text-gray-100">
            <IconTopologyStar size={15} className="text-blue" />
            Como funciona
          </h3>
          <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
            O app consulta a Sefaz pelo NSU mais recente, baixa lotes de até 500 notas, valida, grava no banco local e organiza os arquivos por competência automaticamente.
          </p>
        </div>

        <div className="help-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5 dark:text-gray-100">
            <IconFolderOpen size={15} className="text-blue" />
            Onde ficam os arquivos
          </h3>
          <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
            Todos os XMLs ficam em <code className="font-mono text-[11px]">[Pasta Base]/NFSENacional/[CNPJ]/AAAA-MM/</code>. Subpastas: Emitidas, Recebidas, Eventos, Retenções.
          </p>
          <Button size="sm" onClick={handleOpenFolder} icon={<IconFolder size={14} />} className="mt-2">
            Abrir pasta
          </Button>
        </div>

        <div className="help-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5 dark:text-gray-100">
            <IconFileSpreadsheet size={15} className="text-blue" />
            Relatórios gerados
          </h3>
          <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
            Para cada competência com retenção, são gerados automaticamente <strong>PDF</strong> e <strong>XLSX</strong> na pasta <code className="font-mono text-[11px]">Retencoes/</code>.
          </p>
        </div>

        <div className="help-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3.5">
          <h3 className="text-[13px] font-medium mb-1.5 flex items-center gap-1.5 dark:text-gray-100">
            <IconClock size={15} className="text-blue" />
            Barra de sincronização
          </h3>
          <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
            Mostra a empresa atual, o NSU sendo processado e o total de documentos salvos. Rate limit da Sefaz exibe mensagem de aguardo automático.
          </p>
        </div>
      </div>

      <Card className="mb-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13px] font-medium dark:text-gray-100">Glossário</h3>
        </div>
        {glossary.map((item, i) => (
          <div key={i} className="flex gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700 last:border-0 text-[12px]">
            <span className="term font-mono text-blue min-w-[70px] flex-shrink-0">{item.term}</span>
            <span className="text-gray-600 dark:text-gray-400">{item.desc}</span>
          </div>
        ))}
      </Card>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleCopyLogs}
          icon={copied ? <IconCheck size={14} className="text-green" /> : <IconCopy size={14} />}
        >
          {copied ? 'Copiado!' : 'Copiar log de erros'}
        </Button>
      </div>
    </div>
  )
})
