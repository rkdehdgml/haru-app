import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import {
  getMedicationLogs,
  markMedicationLogsSynced,
} from './storage/medicationStorage';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 오늘 로컬에 기록된 복약 로그를 집계해서 보호자 대시보드용 요약만 Firestore에 올린다.
 * 개별 기록 전체를 서버로 올리지 않고, "오늘 몇 번 중 몇 번 먹었는지" 요약만 동기화하는
 * 설계(로컬 우선 저장 + 요약만 클라우드로) 원칙을 따른다. 실패해도 다음 기록 때 다시
 * 시도되므로 별도 재시도 큐 없이 best-effort로 둔다.
 */
export async function syncTodayMedicationSummary(): Promise<void> {
  try {
    const today = todayKey();
    const logs = await getMedicationLogs(100);
    const todayLogs = logs.filter((log) => log.recordedAt.slice(0, 10) === today);

    const takenCount = todayLogs.filter((log) => log.status === 'taken').length;
    const notGivenCount = todayLogs.filter((log) => log.status === 'not_given_yet').length;
    const lastRecordedAt = todayLogs[0]?.recordedAt ?? null;

    const db = getFirestoreDb();
    await setDoc(doc(db, 'medicationSummaries', today), {
      date: today,
      takenCount,
      notGivenCount,
      totalLogged: todayLogs.length,
      lastRecordedAt,
      updatedAt: serverTimestamp(),
    });

    const syncedIds = todayLogs.map((log) => log.id);
    if (syncedIds.length > 0) {
      await markMedicationLogsSynced(syncedIds);
    }
  } catch (error) {
    console.warn('[medicationSync] 복약 요약 동기화 실패', error);
  }
}
