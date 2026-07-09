import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * 환자 개인 훈련·복약 기록은 서버에 전부 올리지 않고 로컬(SQLite) 우선 저장한다.
 * 보호자가 봐야 하는 요약만 Firestore로 동기화하는 구조(2단계)의 기반이 되는 로컬 DB.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('haru.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS medication_logs (
          id TEXT PRIMARY KEY NOT NULL,
          scheduleId TEXT NOT NULL,
          medicationName TEXT NOT NULL,
          scheduledTime TEXT NOT NULL,
          status TEXT NOT NULL,
          recordedAt TEXT NOT NULL,
          syncedToFirestore INTEGER NOT NULL DEFAULT 0
        );
      `);
      return db;
    });
  }
  return dbPromise;
}
