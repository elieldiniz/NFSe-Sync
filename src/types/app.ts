export type Page = 'dashboard' | 'certs' | 'syncs' | 'help' | 'config'

export interface DashboardStats {
  totalCertificados: number
  totalDocumentos: number
  totalRetido: number
  ultimaSincronizacao: string | null
}

export interface SyncError {
  id: string
  sincronizacao_id: string
  nsu: number
  mensagem: string
  created_at: string
  certificado_id: string
  razao_social: string
  cnpj: string
}
