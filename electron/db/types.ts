export interface Configuracao {
  id: string
  pasta_base: string
  delay_throttle: number
  sinc_intervalo_horas: number
  created_at: string
}

export interface Certificado {
  id: string
  cnpj: string
  razao_social: string
  caminho_pfx: string
  senha_criptografada: Buffer
  validade_cert: string
  sinc_automatica: boolean
  ultimo_nsu: number
  ultima_sincronizacao: string | null
  created_at: string
}

export interface Documento {
  id: string
  certificado_id: string
  chave_documento: string
  numero_nota: string
  tipo: 'EMITIDA' | 'RECEBIDA' | 'EVENTO'
  status: 'ATIVA' | 'CANCELADA' | 'SUBSTITUIDA'
  data_emissao: string
  competencia: string
  cnpj_prestador: string
  nome_prestador: string
  cnpj_tomador: string
  nome_tomador: string
  caminho_xml: string
  possui_retencao: boolean
  valor_total: number
}

export interface Sincronizacao {
  id: string
  certificado_id: string
  data_inicio: string
  data_fim: string | null
  nsu_inicial: number
  nsu_final: number | null
  documentos_processados: number
  retencoes_encontradas: number
  status: 'EM_ANDAMENTO' | 'SUCESSO' | 'ERRO' | 'FALHA_CONEXAO'
}

export interface Retencao {
  id: string
  documento_id: string
  iss: number
  inss: number
  irrf: number
  pis: number
  cofins: number
  csll: number
  total_retido: number
}

export interface SyncErro {
  id: string
  sincronizacao_id: string
  nsu: number
  mensagem: string
  created_at: string
}

export interface SincronizacaoComEmpresa extends Sincronizacao {
  razao_social: string
  cnpj: string
}

export interface SyncErroComEmpresa extends SyncErro {
  certificado_id: string
  razao_social: string
  cnpj: string
}

export interface Stats {
  totalCertificados: number
  totalDocumentos: number
  totalRetido: number
  ultimaSincronizacao: string | null
}

export interface RetencaoRow {
  numero_nota: string
  data_emissao: string
  nome_prestador: string
  nome_tomador: string
  iss: number
  inss: number
  irrf: number
  pis: number
  cofins: number
  csll: number
  total_retido: number
}

export interface SyncQueueItem {
  certificadoId: string
  status: 'aguardando' | 'processando' | 'concluido' | 'erro'
}

export interface SyncResult {
  status: 'SUCESSO' | 'ERRO' | 'FALHA_CONEXAO'
  documentosProcessados: number
  retencoesEncontradas: number
}

export interface CertificateUpdate {
  id: string
  cnpj?: string
  razao_social?: string
  caminho_pfx?: string
  senha?: string
  sinc_automatica?: boolean
}

export interface CertificateSave {
  cnpj: string
  razao_social: string
  caminho_pfx: string
  senha: string
  validade_cert: string
}

export interface ConfigUpdate {
  delay_throttle?: number
  sinc_intervalo_horas?: number
}

export interface BatchCertResult {
  file: string
  success: boolean
  cnpj?: string
  razao_social?: string
  error?: string
}

export interface BatchCertData {
  files: string[]
  senhas: string[]
}
