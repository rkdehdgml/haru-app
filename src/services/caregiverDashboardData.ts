import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import type { HelpRequestHistoryItem, MedicationSummaryData } from '../types/caregiverDashboard';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayMedicationSummary(): Promise<MedicationSummaryData | null> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, 'medicationSummaries', todayKey()));
  if (!snapshot.exists()) return null;
  return snapshot.data() as MedicationSummaryData;
}

export async function getRecentHelpRequestHistory(
  maxItems = 10
): Promise<HelpRequestHistoryItem[]> {
  const db = getFirestoreDb();
  const historyQuery = query(
    collection(db, 'helpRequests'),
    orderBy('requestedAt', 'desc'),
    limit(maxItems)
  );
  const snapshot = await getDocs(historyQuery);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      requestedAt: data.requestedAt as string,
      roomInfo: (data.roomInfo as string | null) ?? null,
    };
  });
}

export async function getLastActiveAt(): Promise<string | null> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, 'appActivity', 'latest'));
  if (!snapshot.exists()) return null;
  return (snapshot.data().recordedAt as string) ?? null;
}

export interface ExerciseAccuracySummaryItem {
  type: string;
  correctCount: number;
  totalCount: number;
}

export async function getExerciseAccuracySummary(): Promise<ExerciseAccuracySummaryItem[]> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, 'exerciseAccuracySummary', 'latest'));
  if (!snapshot.exists()) return [];
  const byType = (snapshot.data().byType ?? {}) as Record<
    string,
    { correctCount: number; totalCount: number }
  >;
  return Object.entries(byType).map(([type, stats]) => ({ type, ...stats }));
}
