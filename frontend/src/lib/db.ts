import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'island-habits.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_number INTEGER UNIQUE,
      status TEXT CHECK(status IN ('locked', 'active', 'completed', 'missed')) DEFAULT 'locked',
      log_text TEXT,
      photo_url TEXT,
      completion_date TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT UNIQUE
    );
  `);

  // Initialize settings if they don't exist
  await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', ['shells', '0']);
  await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', ['streak', '0']);

  // Initialize habits if they don't exist
  const count = await db.get('SELECT COUNT(*) as count FROM habits');
  if (count.count === 0) {
    for (let i = 1; i <= 30; i++) {
        const status = i === 1 ? 'active' : 'locked';
        await db.run('INSERT INTO habits (day_number, status) VALUES (?, ?)', [i, status]);
    }
  }

  return db;
}
