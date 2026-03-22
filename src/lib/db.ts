import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.db');

let db: Database.Database;

export function getDb(): Database.Database {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.exec(`
            CREATE TABLE IF NOT EXISTS servers (
                guild_id   TEXT PRIMARY KEY,
                guild_name TEXT NOT NULL,
                guild_icon TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `);
    }
    return db;
}

export type ServerRow = {
    guild_id: string;
    guild_name: string;
    guild_icon: string | null;
    created_at: number;
};
