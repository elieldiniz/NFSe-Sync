import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { getDb } from '../db/connection'
import { runMigrations } from '../db/migrations/001_initial_schema'
import { createWindow, createTray, getMainWindow } from './window'
import { startCronDaemon, togglePause } from './cron'
import { registerConfigHandlers } from './ipc/config.ipc'
import { registerCertHandlers } from './ipc/cert.ipc'
import { registerSyncHandlers } from './ipc/sync.ipc'
import { registerReportHandlers } from './ipc/reports.ipc'
import { registerBackupHandlers } from './ipc/backup.ipc'
import { registerFolderHandlers } from './ipc/folder.ipc'
import { SyncService } from '../services/sync.service'

function triggerSyncAll(): void {
  const eligibleCerts = SyncService.getEligibleCertificates()
  if (eligibleCerts.length === 0) return

  const mainWindow = getMainWindow()
  mainWindow?.webContents.send('sync:progress', {
    message: `Iniciando sincronizacao automatica de ${eligibleCerts.length} empresas`
  })

  for (const cert of eligibleCerts) {
    SyncService.enqueue(cert.id)
  }
  SyncService.processQueue()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.nfse.sync')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const db = getDb()
  runMigrations(db)

  registerConfigHandlers()
  registerCertHandlers()
  registerSyncHandlers()
  registerReportHandlers()
  registerBackupHandlers()
  registerFolderHandlers()

  createWindow()
  createTray(triggerSyncAll, togglePause)
  startCronDaemon(triggerSyncAll)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else getMainWindow()?.show()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
