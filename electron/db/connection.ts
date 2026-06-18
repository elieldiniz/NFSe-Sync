import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import { existsSync, unlinkSync } from 'fs'

let db: Database.Database | null = null

function openDatabase(dbPath: string): Database.Database {
  const instance = new Database(dbPath)
  // RN012: Sincronização Serial - better-sqlite3 is synchronous
  instance.pragma('journal_mode = WAL')
  instance.pragma('synchronous = NORMAL')
  instance.pragma('foreign_keys = ON')
  return instance
}

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'database.sqlite')

  try {
    db = openDatabase(dbPath)
  } catch (err: unknown) {
    // Recover from disk I/O errors caused by orphaned WAL/SHM files
    // (happens when the app is force-killed while the DB is open)
    const isIoError =
      err instanceof Error && err.message.toLowerCase().includes('disk i/o error')

    if (isIoError) {
      console.warn('[DB] disk I/O error detected — removing stale WAL files and retrying...')
      for (const suffix of ['', '-shm', '-wal']) {
        const file = `${dbPath}${suffix}`
        if (existsSync(file)) {
          try { unlinkSync(file) } catch { /* ignore */ }
        }
      }
      // Second attempt — if this throws, let it propagate
      db = openDatabase(dbPath)
    } else {
      throw err
    }
  }

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
