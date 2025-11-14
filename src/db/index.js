import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'queue.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 1. Jobs Table
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    state TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_retries INTEGER, -- Will be set during insert
    last_error TEXT,
    next_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Settings Table (New)
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Default Config set karna (agar nahi hai toh)
const initConfig = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('max_retries', '3')");
initConfig.run();

export default db;