import { getDb } from '../connection'
import { Documento, RetencaoRow } from '../types'
import crypto from 'crypto'

export const DocumentoRepository = {
  findById(id: string): Documento | undefined {
    return getDb()
      .prepare('SELECT * FROM documentos WHERE id = ?')
      .get(id) as Documento | undefined
  },

  findByChave(chave: string): Documento | undefined {
    return getDb()
      .prepare('SELECT * FROM documentos WHERE chave_documento = ?')
      .get(chave) as Documento | undefined
  },

  findIdByChave(chave: string): { id: string } | undefined {
    return getDb()
      .prepare('SELECT id FROM documentos WHERE chave_documento = ?')
      .get(chave) as { id: string } | undefined
  },

  create(doc: Omit<Documento, 'id'>): string {
    const id = crypto.randomUUID()
    getDb()
      .prepare(`
        INSERT OR IGNORE INTO documentos
        (id, certificado_id, chave_documento, numero_nota, tipo, status,
         data_emissao, competencia, cnpj_prestador, nome_prestador,
         cnpj_tomador, nome_tomador, caminho_xml, possui_retencao, valor_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        doc.certificado_id,
        doc.chave_documento,
        doc.numero_nota,
        doc.tipo,
        doc.status,
        doc.data_emissao,
        doc.competencia,
        doc.cnpj_prestador,
        doc.nome_prestador,
        doc.cnpj_tomador,
        doc.nome_tomador,
        doc.caminho_xml,
        doc.possui_retencao ? 1 : 0,
        doc.valor_total
      )
    return id
  },

  markCancelled(chave: string): void {
    getDb()
      .prepare('UPDATE documentos SET status = \'CANCELADA\' WHERE chave_documento = ?')
      .run(chave)
  },

  count(): number {
    return (getDb()
      .prepare('SELECT COUNT(*) as count FROM documentos')
      .get() as { count: number }).count
  },

  countByCertificado(certificadoId: string): number {
    return (getDb()
      .prepare('SELECT COUNT(*) as count FROM retencoes r JOIN documentos d ON r.documento_id = d.id WHERE d.certificado_id = ?')
      .get(certificadoId) as { count: number }).count
  },

  getRetencoesByCompetencia(certificadoId: string, competencia: string): RetencaoRow[] {
    return getDb()
      .prepare(`
        SELECT
          d.numero_nota,
          d.data_emissao,
          d.nome_prestador,
          d.nome_tomador,
          r.iss,
          r.inss,
          r.irrf,
          r.pis,
          r.cofins,
          r.csll,
          r.total_retido
        FROM documentos d
        JOIN retencoes r ON r.documento_id = d.id
        WHERE d.status = 'ATIVA'
          AND d.possui_retencao = 1
          AND d.competencia = ?
          AND d.certificado_id = ?
        ORDER BY d.data_emissao
      `)
      .all(competencia, certificadoId) as RetencaoRow[]
  },

  getCompetencias(certificadoId: string): Array<{ competencia: string }> {
    return getDb()
      .prepare(`
        SELECT DISTINCT d.competencia
        FROM documentos d
        WHERE d.certificado_id = ? AND d.competencia IS NOT NULL
      `)
      .all(certificadoId) as Array<{ competencia: string }>
  },

  getStatsByEmpresa(certificadoId: string): {
    totalDocumentos: number
    emitidos: number
    recebidos: number
    comRetencao: number
    valorTotal: number
  } {
    const result = getDb()
      .prepare(`
        SELECT
          COUNT(*) as totalDocumentos,
          SUM(CASE WHEN tipo = 'EMITIDA' THEN 1 ELSE 0 END) as emitidos,
          SUM(CASE WHEN tipo = 'RECEBIDA' THEN 1 ELSE 0 END) as recebidos,
          SUM(CASE WHEN possui_retencao = 1 THEN 1 ELSE 0 END) as comRetencao,
          COALESCE(SUM(valor_total), 0) as valorTotal
        FROM documentos
        WHERE certificado_id = ? AND status = 'ATIVA'
      `)
      .get(certificadoId) as any

    return {
      totalDocumentos: result?.totalDocumentos || 0,
      emitidos: result?.emitidos || 0,
      recebidos: result?.recebidos || 0,
      comRetencao: result?.comRetencao || 0,
      valorTotal: result?.valorTotal || 0
    }
  },

  getRetencoesByEmpresa(certificadoId: string): {
    iss: number
    inss: number
    irrf: number
    pis: number
    cofins: number
    csll: number
    total: number
  } {
    const result = getDb()
      .prepare(`
        SELECT
          COALESCE(SUM(r.iss), 0) as iss,
          COALESCE(SUM(r.inss), 0) as inss,
          COALESCE(SUM(r.irrf), 0) as irrf,
          COALESCE(SUM(r.pis), 0) as pis,
          COALESCE(SUM(r.cofins), 0) as cofins,
          COALESCE(SUM(r.csll), 0) as csll,
          COALESCE(SUM(r.total_retido), 0) as total
        FROM retencoes r
        JOIN documentos d ON r.documento_id = d.id
        WHERE d.certificado_id = ? AND d.status = 'ATIVA'
      `)
      .get(certificadoId) as any

    return {
      iss: result?.iss || 0,
      inss: result?.inss || 0,
      irrf: result?.irrf || 0,
      pis: result?.pis || 0,
      cofins: result?.cofins || 0,
      csll: result?.csll || 0,
      total: result?.total || 0
    }
  }
}
