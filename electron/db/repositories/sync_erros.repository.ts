import { getDb } from '../connection'
import { SyncErro, SyncErroComEmpresa } from '../types'
import crypto from 'crypto'

export const SyncErroRepository = {
  create(sincronizacaoId: string, nsu: number, mensagem: string): string {
    const id = crypto.randomUUID()
    getDb()
      .prepare(`
        INSERT INTO sync_erros (id, sincronizacao_id, nsu, mensagem)
        VALUES (?, ?, ?, ?)
      `)
      .run(id, sincronizacaoId, nsu, mensagem)
    return id
  },

  findBySincronizacao(sincronizacaoId: string): SyncErro[] {
    return getDb()
      .prepare('SELECT * FROM sync_erros WHERE sincronizacao_id = ?')
      .all(sincronizacaoId) as SyncErro[]
  },

  findRecent(limit: number = 100): SyncErroComEmpresa[] {
    return getDb()
      .prepare(`
        SELECT se.*, s.certificado_id, c.razao_social, c.cnpj
        FROM sync_erros se
        JOIN sincronizacoes s ON se.sincronizacao_id = s.id
        JOIN certificados c ON s.certificado_id = c.id
        ORDER BY se.created_at DESC
        LIMIT ?
      `)
      .all(limit) as SyncErroComEmpresa[]
  }
}
