import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { getTodayHandExerciseLogs } from './storage/handExerciseLogStorage';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 오늘 완료한 손 힘 훈련 요약만 보호자 대시보드용으로 Firestore에 올린다. */
export async function syncTodayHandExerciseSummary(): Promise<void> {
  try {
    const today = todayKey();
    const logs = await getTodayHandExerciseLogs();
    const completedExerciseCount = logs.length;
    const totalCompletedReps = logs.reduce((sum, log) => sum + log.completedReps, 0);
    const lastRecordedAt = logs[logs.length - 1]?.recordedAt ?? null;

    const db = getFirestoreDb();
    await setDoc(doc(db, 'handExerciseSummaries', today), {
      date: today,
      completedExerciseCount,
      totalCompletedReps,
      lastRecordedAt,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[handExerciseSync] 손 힘 훈련 요약 동기화 실패', error);
  }
}
