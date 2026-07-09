import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { getAccuracyRecords } from './storage/exerciseResultStorage';

/** 로컬에 쌓인 유형별 정답률을 보호자 대시보드용으로 요약해서 Firestore에 올린다. */
export async function syncExerciseAccuracySummary(): Promise<void> {
  try {
    const records = await getAccuracyRecords();
    const byType: Record<string, { correctCount: number; totalCount: number }> = {};
    records.forEach((record) => {
      byType[record.type] = { correctCount: record.correctCount, totalCount: record.totalCount };
    });

    const db = getFirestoreDb();
    await setDoc(doc(db, 'exerciseAccuracySummary', 'latest'), {
      byType,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[exerciseAccuracySync] 정답률 동기화 실패', error);
  }
}
