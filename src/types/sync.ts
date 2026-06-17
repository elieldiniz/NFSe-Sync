export type SyncStatus = 'aguardando' | 'processando' | 'concluido' | 'erro'

export type SyncRecordStatus = 'EM_ANDAMENTO' | 'SUCESSO' | 'ERRO' | 'FALHA_CONEXAO'

export interface QueueItem {
  id: string
  empresa: string
  cnpj: string
  status: SyncStatus
  nsu?: number
  docs?: number
}

export interface SyncRecord {
  id: string
  certificado_id: string
  data_inicio: string
  data_fim: string | null
  status: SyncRecordStatus
  nsu_inicial: number
  nsu_final: number
  documentos_processados: number
  retencoes_encontradas: number
  erro_mensagem: string | null
  razao_social: string
  cnpj: string
}

export interface SyncProgressData {
  certificadoId?: string
  syncId?: string
  empresa?: string
  nsu?: number
  documentosProcessados?: number
  retencoesEncontradas?: number
  queue?: QueueItem[]
  message?: string
}

export interface SyncQueueUpdateData {
  id: string
  status: SyncStatus
}
