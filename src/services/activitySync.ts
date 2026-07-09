import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

/** 환자가 앱을 열었을 때 "마지막 활동 시각"을 보호자 대시보드용으로 기록한다. */
export async function recordAppOpened(): Promise<void> {
  try {
    const db = getFirestoreDb();
    await setDoc(doc(db, 'appActivity', 'latest'), {
      recordedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[activitySync] 활동 시각 기록 실패', error);
  }
}
