/**
 * Simple SQLite wrapper with web fallback (localforage)
 * העתק קובץ זה ל: src/integrations/sqliteClient.ts
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import localforage from 'localforage';

const DB_NAME = 'lingua_flow_db';
let db: SQLiteDBConnection | null = null;

export async function initLocalDB() {
  if (Capacitor.getPlatform() === 'web') {
    await localforage.ready();
    return;
  }
  try {
    const sqlite = CapacitorSQLite;
    const ret = await sqlite.createConnection({ database: DB_NAME, version: 1, encrypted: false, mode: 'no-encryption' });
    db = ret;
    await db.open();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vocabulary_words (
        id TEXT PRIMARY KEY,
        en TEXT,
        he TEXT,
        category TEXT,
        updated_at TEXT
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS learned_words (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        word_id TEXT,
        learned_at TEXT,
        updated_at TEXT,
        sync_status INTEGER DEFAULT 0
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT,
        action TEXT,
        payload TEXT,
        created_at TEXT
      );
    `);
  } catch (e) {
    console.error('initLocalDB error', e);
  }
}

export async function saveVocabularyRows(rows: any[]) {
  if (Capacitor.getPlatform() === 'web') {
    await localforage.setItem('vocabulary_words', rows);
    return;
  }
  if (!db) return;
  const stmts = rows.map(r =>
    `REPLACE INTO vocabulary_words (id, en, he, category, updated_at) VALUES ('${r.id}','${(r.en||'').replace(/'/g, "''")}','${(r.he||'').replace(/'/g, "''")}','${(r.category||'').replace(/'/g, "''")}','${r.updated_at || new Date().toISOString()}')`
  ).join(';');
  try {
    await db.execute(`BEGIN; ${stmts}; COMMIT;`);
  } catch (e) {
    console.error('saveVocabularyRows error', e);
  }
}

export async function getVocabularyRows() {
  if (Capacitor.getPlatform() === 'web') {
    return (await localforage.getItem('vocabulary_words')) || [];
  }
  if (!db) return [];
  try {
    const res = await db.query(`SELECT * FROM vocabulary_words ORDER BY category, en`);
    return res.values || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function queueLocalChange(table_name: string, action: 'insert' | 'update' | 'delete', payload: any) {
  const created_at = new Date().toISOString();
  if (Capacitor.getPlatform() === 'web') {
    const q = (await localforage.getItem('sync_queue')) || [];
    q.push({ table_name, action, payload, created_at });
    await localforage.setItem('sync_queue', q);
    return;
  }
  if (!db) return;
  const payloadStr = JSON.stringify(payload).replace(/'/g, "''");
  await db.execute(`INSERT INTO sync_queue (table_name, action, payload, created_at) VALUES ('${table_name}','${action}','${payloadStr}','${created_at}')`);
}

export async function popSyncQueue(): Promise<any[]> {
  if (Capacitor.getPlatform() === 'web') {
    const q = (await localforage.getItem('sync_queue')) || [];
    await localforage.setItem('sync_queue', []);
    return q;
  }
  if (!db) return [];
  try {
    const res = await db.query(`SELECT id, table_name, action, payload, created_at FROM sync_queue ORDER BY id ASC`);
    await db.execute(`DELETE FROM sync_queue`);
    return (res.values || []).map((r: any) => ({ ...r, payload: JSON.parse(r.payload) }));
  } catch (e) {
    console.error(e);
    return [];
  }
}