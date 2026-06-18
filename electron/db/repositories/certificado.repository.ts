import { getDb } from '../connection'
import { Certificado, CertificateUpdate, CertificateSave } from '../types'
import crypto from 'crypto'

export const CertificadoRepository = {
  findById(id: string): Certificado | undefined {
    return getDb()
      .prepare('SELECT * FROM certificados WHERE id = ?')
      .get(id) as Certificado | undefined
  },

  findAll(): Certificado[] {
    return getDb()
      .prepare('SELECT * FROM certificados')
      .all() as Certificado[]
  },

  findEligibleForSync(): Array<{ id: string }> {
    return getDb()
      .prepare(`
        SELECT id FROM certificados
        WHERE sinc_automatica = 1
          AND validade_cert >= datetime('now')
      `)
      .all() as Array<{ id: string }>
  },

  create(cert: CertificateSave): string {
    const id = crypto.randomUUID()
    const encryptedPassword = Buffer.from(cert.senha, 'utf-8')
    getDb()
      .prepare(`
        INSERT INTO certificados (id, cnpj, razao_social, caminho_pfx, senha_criptografada, validade_cert)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(id, cert.cnpj, cert.razao_social, cert.caminho_pfx, encryptedPassword, cert.validade_cert)
    return id
  },

  createBatch(id: string, cnpj: string, razaoSocial: string, caminhoPfx: string, senha: string, validadeCert: string): void {
    const encryptedPassword = Buffer.from(senha, 'utf-8')
    getDb()
      .prepare(`
        INSERT OR IGNORE INTO certificados (id, cnpj, razao_social, caminho_pfx, senha_criptografada, validade_cert)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(id, cnpj, razaoSocial, caminhoPfx, encryptedPassword, validadeCert)
  },

  update(cert: CertificateUpdate): void {
    const updates: string[] = []
    const values: (string | number | Buffer | boolean)[] = []

    if (cert.cnpj !== undefined) {
      updates.push('cnpj = ?')
      values.push(cert.cnpj)
    }
    if (cert.razao_social !== undefined) {
      updates.push('razao_social = ?')
      values.push(cert.razao_social)
    }
    if (cert.caminho_pfx !== undefined) {
      updates.push('caminho_pfx = ?')
      values.push(cert.caminho_pfx)
    }
    if (cert.senha !== undefined) {
      updates.push('senha_criptografada = ?')
      values.push(Buffer.from(cert.senha, 'utf-8'))
    }
    if (cert.sinc_automatica !== undefined) {
      updates.push('sinc_automatica = ?')
      values.push(cert.sinc_automatica ? 1 : 0)
    }

    if (updates.length === 0) return

    values.push(cert.id)
    getDb()
      .prepare(`UPDATE certificados SET ${updates.join(', ')} WHERE id = ?`)
      .run(...values)
  },

  updateNsu(id: string, nsu: number): void {
    getDb()
      .prepare('UPDATE certificados SET ultimo_nsu = ? WHERE id = ?')
      .run(nsu, id)
  },

  delete(id: string): void {
    getDb().transaction(() => {
      getDb().prepare('DELETE FROM retencoes WHERE documento_id IN (SELECT id FROM documentos WHERE certificado_id = ?)').run(id)
      getDb().prepare('DELETE FROM documentos WHERE certificado_id = ?').run(id)
      getDb().prepare('DELETE FROM sincronizacoes WHERE certificado_id = ?').run(id)
      getDb().prepare('DELETE FROM certificados WHERE id = ?').run(id)
    })()
  },

  reset(id: string): void {
    getDb().prepare('DELETE FROM documentos WHERE certificado_id = ?').run(id)
    getDb().prepare('UPDATE certificados SET ultimo_nsu = 0 WHERE id = ?').run(id)
  },

  count(): number {
    return (getDb()
      .prepare('SELECT COUNT(*) as count FROM certificados')
      .get() as { count: number }).count
  }
}
