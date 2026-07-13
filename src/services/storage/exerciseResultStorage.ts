import { getDb } from './db';
import { generateId } from '../id';
import type { ExerciseExposureRecord } from '../../data/exerciseSelector';
import type { ExerciseAccuracyRecord, ExerciseCategory, ExerciseType } from '../../types/exercise';

export async function recordExerciseResult(
  type: ExerciseType,
  category: ExerciseCategory,
  isCorrect: boolean
): Promise<void> {
  const db = await getDb();
  const now = new Date();
  await db.runAsync(
    `INSERT INTO exercise_results (id, type, category, date, isCorrect, recordedAt)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      generateId(),
      type,
      category,
      now.toISOString().slice(0, 10),
      isCorrect ? 1 : 0,
      now.toISOString(),
    ]
  );
}

/** 최근 N일 동안 어떤 유형이 노출됐는지 — exerciseSelector의 "최근 제외" 규칙에 쓰인다. */
export async function getRecentExposures(days = 3): Promise<ExerciseExposureRecord[]> {
  const db = await getDb();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await db.getAllAsync<{ date: string; type: ExerciseType }>(
    `SELECT DISTINCT date, type FROM exercise_results WHERE date >= ? ORDER BY date ASC;`,
    [since.toISOString().slice(0, 10)]
  );

  const byDate = new Map<string, ExerciseType[]>();
  for (const row of rows) {
    const list = byDate.get(row.date) ?? [];
    list.push(row.type);
    byDate.set(row.date, list);
  }
  return Array.from(byDate.entries()).map(([date, types]) => ({ date, types }));
}

/** 오늘 카테고리별로 몇 문제 풀었는지 — Home 화면의 오늘 진행 상황 요약에 쓰인다. */
export async function getTodayResultCounts(): Promise<Record<ExerciseCategory, number>> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db.getAllAsync<{ category: ExerciseCategory; count: number }>(
    `SELECT category, COUNT(*) AS count FROM exercise_results WHERE date = ? GROUP BY category;`,
    [today]
  );
  const counts: Record<ExerciseCategory, number> = { cognitive: 0, memory: 0 };
  rows.forEach((row) => {
    counts[row.category] = row.count;
  });
  return counts;
}

/** 유형별 누적 정답률 — exerciseSelector의 가중치 규칙에 쓰인다. */
export async function getAccuracyRecords(): Promise<ExerciseAccuracyRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    type: ExerciseType;
    correctCount: number;
    totalCount: number;
  }>(
    `SELECT type, SUM(isCorrect) AS correctCount, COUNT(*) AS totalCount
     FROM exercise_results GROUP BY type;`
  );
  return rows.map((row) => ({
    type: row.type,
    correctCount: row.correctCount,
    totalCount: row.totalCount,
  }));
}
