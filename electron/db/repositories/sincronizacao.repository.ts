import { getDb } from '../connection'
import { Sincronizacao, SincronizacaoComEmpresa } from '../types'

export const SincronizacaoRepository = {
  findById(id: string): Sincronizacao | undefined {
    return getDb()
      .prepare('SELECT * FROM sincronizacoes WHERE id = ?')
      .get(id) as Sincronizacao | undefined
  },

  create(id: string, certificadoId: string, nsuInicial: number): void {
    getDb()
      .prepare(`
        INSERT INTO sincronizacoes (id, certificado_id, data_inicio, nsu_inicial, status)
        VALUES (?, ?, datetime('now'), ?, 'EM_ANDAMENTO')
      `)
      .run(id, certificadoId, nsuInicial)
  },

  markSuccess(id: string, nsuFinal: number, documentosProcessados: number, retencoesEncontradas: number): void {
    getDb()
      .prepare(`
        UPDATE sincronizacoes
        SET status = 'SUCESSO', data_fim = datetime('now'),
            nsu_final = ?, documentos_processados = ?, retencoes_encontradas = ?
        WHERE id = ?
      `)
      .run(nsuFinal, documentosProcessados, retencoesEncontradas, id)
  },

  markError(id: string, status: 'ERRO' | 'FALHA_CONEXAO', nsuFinal: number, documentosProcessados: number): void {
    getDb()
      .prepare(`
        UPDATE sincronizacoes
        SET status = ?, data_fim = datetime('now'),
            nsu_final = ?, documentos_processados = ?
        WHERE id = ?
      `)
      .run(status, nsuFinal, documentosProcessados, id)
  },

  findLastSync(): { data_fim: string } | undefined {
    return getDb()
      .prepare('SELECT data_fim FROM sincronizacoes ORDER BY data_fim DESC LIMIT 1')
      .get() as { data_fim: string } | undefined
  },

  findHistory(limit: number = 50): SincronizacaoComEmpresa[] {
    return getDb()
      .prepare(`
        SELECT s.*, c.razao_social, c.cnpj
        FROM sincronizacoes s
        JOIN certificados c ON s.certificado_id = c.id
        ORDER BY s.data_inicio DESC
        LIMIT ?
      `)
      .all(limit) as SincronizacaoComEmpresa[]
  }
}
