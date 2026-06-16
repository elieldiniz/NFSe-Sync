import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'database.sqlite')
  db = new Database(dbPath)

  // RN012: Sincronização Serial - better-sqlite3 is synchronous
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('foreign_keys = ON')

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
