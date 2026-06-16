import { ipcMain, dialog } from 'electron'
import { getDb } from '../db/connection'
import crypto from 'crypto'

export function registerConfigHandlers(): void {
  ipcMain.handle('check-first-run', () => {
    try {
      const db = getDb()
      const result = db.prepare('SELECT COUNT(*) as count FROM configuracoes').get() as { count: number }
      return result.count === 0
    } catch {
      return true
    }
  })

  ipcMain.handle('select-base-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('save-base-folder', (_, pastaBase: string) => {
    const db = getDb()
    db.prepare('INSERT OR REPLACE INTO configuracoes (id, pasta_base) VALUES (?, ?)').run('default', pastaBase)
  })

  ipcMain.handle('get-config', () => {
    try {
      const db = getDb()
      return db.prepare('SELECT * FROM configuracoes WHERE id = ?').get('default')
    } catch {
      return null
    }
  })

  ipcMain.handle('save-certificate', (_, cert: {
    cnpj: string
    razao_social: string
    caminho_pfx: string
    senha: string
    validade_cert: string
  }) => {
    const db = getDb()
    const id = crypto.randomUUID()
    const encryptedPassword = Buffer.from(cert.senha, 'utf-8')
    db.prepare(`
      INSERT INTO certificados (id, cnpj, razao_social, caminho_pfx, senha_criptografada, validade_cert)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, cert.cnpj, cert.razao_social, cert.caminho_pfx, encryptedPassword, cert.validade_cert)
    return id
  })

  ipcMain.handle('get-certificates', () => {
    try {
      const db = getDb()
      return db.prepare('SELECT * FROM certificados').all()
    } catch {
      return []
    }
  })

  ipcMain.handle('get-stats', () => {
    try {
      const db = getDb()
      const totalCert = (db.prepare('SELECT COUNT(*) as count FROM certificados').get() as { count: number }).count
      const totalDocs = (db.prepare('SELECT COUNT(*) as count FROM documentos').get() as { count: number }).count
      const totalRetido = (db.prepare('SELECT COALESCE(SUM(total_retido), 0) as total FROM retencoes').get() as { total: number }).total
      const ultimaSync = db.prepare('SELECT data_fim FROM sincronizacoes ORDER BY data_fim DESC LIMIT 1').get() as { data_fim: string } | undefined

      return {
        totalCertificados: totalCert,
        totalDocumentos: totalDocs,
        totalRetido,
        ultimaSincronizacao: ultimaSync?.data_fim || null
      }
    } catch {
      return { totalCertificados: 0, totalDocumentos: 0, totalRetido: 0, ultimaSincronizacao: null }
    }
  })

  ipcMain.handle('get-sync-history', () => {
    try {
      const db = getDb()
      return db.prepare(`
        SELECT s.*, c.razao_social, c.cnpj
        FROM sincronizacoes s
        JOIN certificados c ON s.certificado_id = c.id
        ORDER BY s.data_inicio DESC
        LIMIT 50
      `).all()
    } catch {
      return []
    }
  })

  ipcMain.handle('ping-db', () => {
    try {
      getDb().prepare('SELECT 1').get()
      return true
    } catch {
      return false
    }
  })
}
