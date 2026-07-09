import { getDb } from './db';
import { generateId } from '../id';
import type { MedicationLog, MedicationStatus } from '../../types/medication';

interface MedicationLogRow {
  id: string;
  scheduleId: string;
  medicationName: string;
  scheduledTime: string;
  status: MedicationStatus;
  recordedAt: string;
  syncedToFirestore: number;
}

function rowToLog(row: MedicationLogRow): MedicationLog {
  return { ...row, syncedToFirestore: Boolean(row.syncedToFirestore) };
}

export interface RecordMedicationStatusParams {
  scheduleId: string;
  medicationName: string;
  scheduledTime: string;
  status: MedicationStatus;
}

/** 버튼 탭 즉시 로컬에 기록한다 (복약 확인은 위험 동작이 아니라 카운트다운 없이 즉시 처리). */
export async function recordMedicationStatus(
  params: RecordMedicationStatusParams
): Promise<MedicationLog> {
  const db = await getDb();
  const log: MedicationLog = {
    id: generateId(),
    ...params,
    recordedAt: new Date().toISOString(),
    syncedToFirestore: false,
  };
  await db.runAsync(
    `INSERT INTO medication_logs
       (id, scheduleId, medicationName, scheduledTime, status, recordedAt, syncedToFirestore)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      log.id,
      log.scheduleId,
      log.medicationName,
      log.scheduledTime,
      log.status,
      log.recordedAt,
      log.syncedToFirestore ? 1 : 0,
    ]
  );
  return log;
}

export async function getMedicationLogs(limit = 50): Promise<MedicationLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MedicationLogRow>(
    `SELECT * FROM medication_logs ORDER BY recordedAt DESC LIMIT ?;`,
    [limit]
  );
  return rows.map(rowToLog);
}

/** 2단계에서 Firestore 동기화 로직이 이 함수로 "아직 안 올라간" 기록만 골라 올린다. */
export async function getUnsyncedMedicationLogs(): Promise<MedicationLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MedicationLogRow>(
    `SELECT * FROM medication_logs WHERE syncedToFirestore = 0 ORDER BY recordedAt ASC;`
  );
  return rows.map(rowToLog);
}

export async function markMedicationLogsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(', ');
  await db.runAsync(
    `UPDATE medication_logs SET syncedToFirestore = 1 WHERE id IN (${placeholders});`,
    ids
  );
}
