import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(__dirname, '..', 'tasks.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    price        REAL    NOT NULL,
    owner        TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'created',
    completed_by TEXT
  )
`)

export default db
