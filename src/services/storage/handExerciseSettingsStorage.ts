import { getDb } from './db';
import { HAND_EXERCISE_CATALOG } from '../../data/handExerciseCatalog';
import type { HandExerciseSetting } from '../../types/handExercise';

interface HandExerciseSettingRow {
  id: string;
  targetReps: number;
  enabled: number;
  sortOrder: number;
}

/**
 * 운동 카탈로그(정적 데이터)에 로컬에 저장된 목표 횟수/사용 여부 조정값을 얹어서 반환한다.
 * 담당 치료사가 아직 조정하지 않은 항목은 카탈로그의 기본값을 그대로 쓴다.
 */
export async function getHandExerciseSettings(): Promise<HandExerciseSetting[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HandExerciseSettingRow>(`SELECT * FROM hand_exercise_settings;`);
  const overrides = new Map(rows.map((row) => [row.id, row]));

  return HAND_EXERCISE_CATALOG.map((def, index) => {
    const override = overrides.get(def.id);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      videoUri: def.videoUri,
      targetReps: override?.targetReps ?? def.defaultTargetReps,
      enabled: override ? Boolean(override.enabled) : true,
      sortOrder: override?.sortOrder ?? index,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveHandExerciseSetting(
  id: string,
  patch: { targetReps: number; enabled: boolean }
): Promise<void> {
  const db = await getDb();
  const current = await getHandExerciseSettings();
  const sortOrder = current.find((setting) => setting.id === id)?.sortOrder ?? 0;
  await db.runAsync(
    `INSERT INTO hand_exercise_settings (id, targetReps, enabled, sortOrder) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET targetReps = excluded.targetReps, enabled = excluded.enabled;`,
    [id, patch.targetReps, patch.enabled ? 1 : 0, sortOrder]
  );
}
