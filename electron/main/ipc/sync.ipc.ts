import { ipcMain } from 'electron'
import { SyncService } from '../../services/sync.service'
import { SyncQueueItem } from '../../db/types'

export function registerSyncHandlers(): void {
  ipcMain.handle('start-sync', async (_, certificadoIds: string[]) => {
    for (const id of certificadoIds) {
      SyncService.enqueue(id)
    }
    SyncService.processQueue()
    return { queued: certificadoIds.length }
  })

  ipcMain.handle('start-sync-all', async () => {
    const eligibleCerts = SyncService.getEligibleCertificates()

    if (eligibleCerts.length === 0) {
      return { message: 'No eligible certificates for sync' }
    }

    for (const cert of eligibleCerts) {
      SyncService.enqueue(cert.id)
    }

    SyncService.processQueue()
    return { queued: eligibleCerts.length }
  })

  ipcMain.handle('get-sync-queue', () => {
    return SyncService.getQueue()
  })
}
