import { getDb } from '../connection'
import { Retencao } from '../types'
import crypto from 'crypto'

export const RetencaoRepository = {
  findByDocumentoId(documentoId: string): Retencao | undefined {
    return getDb()
      .prepare('SELECT * FROM retencoes WHERE documento_id = ?')
      .get(documentoId) as Retencao | undefined
  },

  create(retencao: Omit<Retencao, 'id'>): string {
    const id = crypto.randomUUID()
    getDb()
      .prepare(`
        INSERT OR IGNORE INTO retencoes
        (id, documento_id, iss, inss, irrf, pis, cofins, csll, total_retido)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        retencao.documento_id,
        retencao.iss,
        retencao.inss,
        retencao.irrf,
        retencao.pis,
        retencao.cofins,
        retencao.csll,
        retencao.total_retido
      )
    return id
  },

  getTotalRetido(): number {
    return (getDb()
      .prepare('SELECT COALESCE(SUM(total_retido), 0) as total FROM retencoes')
      .get() as { total: number }).total
  }
}
