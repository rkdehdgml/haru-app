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
        CREATE TABLE IF NOT EXISTS help_requests (
          id TEXT PRIMARY KEY NOT NULL,
          requestedAt TEXT NOT NULL,
          roomInfo TEXT,
          sendStatus TEXT NOT NULL,
          retryCount INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS exercise_results (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          isCorrect INTEGER NOT NULL,
          recordedAt TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS family_members (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          photoUri TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS care_preferences (
          id TEXT PRIMARY KEY NOT NULL,
          hospitalName TEXT,
          doctorName TEXT
        );
      `);
      return db;
    });
  }
  return dbPromise;
}
