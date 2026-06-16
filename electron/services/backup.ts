import { ipcMain, dialog, app } from 'electron'
import { join } from 'path'
import { getDb, closeDb } from '../db/connection'
import fs from 'fs'
import Database from 'better-sqlite3'

export function registerBackupHandlers(): void {
  ipcMain.handle('backup:export', async () => {
    const result = await dialog.showSaveDialog({
      defaultPath: 'nfse-backup.sqlite',
      filters: [{ name: 'SQLite Database', extensions: ['sqlite'] }]
    })
    if (result.canceled || !result.filePath) return false

    try {
      const db = getDb()
      db.backup(result.filePath)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('backup:import', async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'SQLite Database', extensions: ['sqlite'] }]
    })
    if (result.canceled || !result.filePath) return false

    let tempDb: Database.Database | null = null
    try {
      tempDb = new Database(result.filePath)
      const integrity = tempDb.pragma('integrity_check')
      if (integrity[0]?.integrity_check !== 'ok') {
        tempDb.close()
        return false
      }
      tempDb.close()

      closeDb()

      const dbPath = join(app.getPath('userData'), 'database.sqlite')
      fs.copyFileSync(result.filePath, dbPath)

      getDb()
      return true
    } catch {
      if (tempDb) tempDb.close()
      return false
    }
  })
}
