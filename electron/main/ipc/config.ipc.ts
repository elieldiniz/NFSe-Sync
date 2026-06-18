import { ipcMain, dialog } from 'electron'
import { ConfigRepository } from '../../db/repositories/config.repository'
import { CertificadoRepository } from '../../db/repositories/certificado.repository'
import { SincronizacaoRepository } from '../../db/repositories/sincronizacao.repository'
import { DocumentoRepository } from '../../db/repositories/documento.repository'
import { RetencaoRepository } from '../../db/repositories/retencoes.repository'
import { getDb } from '../../db/connection'
import { ConfigUpdate, Stats, SincronizacaoComEmpresa } from '../../db/types'

export function registerConfigHandlers(): void {
  ipcMain.handle('check-first-run', () => {
    try {
      return ConfigRepository.count() === 0
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
    ConfigRepository.upsert('default', pastaBase)
  })

  ipcMain.handle('get-config', () => {
    try {
      return ConfigRepository.findById('default')
    } catch {
      return null
    }
  })

  ipcMain.handle('update-config', (_, config: ConfigUpdate) => {
    if (config.delay_throttle !== undefined) {
      ConfigRepository.updateThrottle('default', config.delay_throttle)
    }
    if (config.sinc_intervalo_horas !== undefined) {
      ConfigRepository.updateInterval('default', config.sinc_intervalo_horas)
    }
  })

  ipcMain.handle('get-certificates', () => {
    try {
      return CertificadoRepository.findAll()
    } catch {
      return []
    }
  })

  ipcMain.handle('get-stats', () => {
    try {
      const totalCert = CertificadoRepository.count()
      const totalDocs = DocumentoRepository.count()
      const totalRetido = RetencaoRepository.getTotalRetido()
      const ultimaSync = SincronizacaoRepository.findLastSync()

      return {
        totalCertificados: totalCert,
        totalDocumentos: totalDocs,
        totalRetido,
        ultimaSincronizacao: ultimaSync?.data_fim || null
      } as Stats
    } catch {
      return { totalCertificados: 0, totalDocumentos: 0, totalRetido: 0, ultimaSincronizacao: null }
    }
  })

  ipcMain.handle('get-sync-history', () => {
    try {
      return SincronizacaoRepository.findHistory(50)
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
