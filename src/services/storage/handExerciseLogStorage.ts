import { getDb } from './db';
import { generateId } from '../id';
import type { HandExerciseLog } from '../../types/handExercise';

export interface RecordHandExerciseCompletionParams {
  exerciseId: string;
  exerciseName: string;
  completedReps: number;
  targetReps: number;
}

export async function recordHandExerciseCompletion(
  params: RecordHandExerciseCompletionParams
): Promise<void> {
  const db = await getDb();
  const now = new Date();
  await db.runAsync(
    `INSERT INTO hand_exercise_logs
       (id, exerciseId, exerciseName, completedReps, targetReps, date, recordedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      generateId(),
      params.exerciseId,
      params.exerciseName,
      params.completedReps,
      params.targetReps,
      now.toISOString().slice(0, 10),
      now.toISOString(),
    ]
  );
}

export async function getTodayHandExerciseLogs(): Promise<HandExerciseLog[]> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  return db.getAllAsync<HandExerciseLog>(
    `SELECT * FROM hand_exercise_logs WHERE date = ? ORDER BY recordedAt ASC;`,
    [today]
  );
}
