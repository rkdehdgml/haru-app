import { getDb } from './db';
import type { CarePreferences } from '../../types/carePreferences';

const PROFILE_ID = 'profile';

export async function getCarePreferences(): Promise<CarePreferences> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ hospitalName: string | null; doctorName: string | null }>(
    `SELECT hospitalName, doctorName FROM care_preferences WHERE id = ?;`,
    [PROFILE_ID]
  );
  return { hospitalName: row?.hospitalName ?? '', doctorName: row?.doctorName ?? '' };
}

export async function saveCarePreferences(prefs: CarePreferences): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO care_preferences (id, hospitalName, doctorName) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET hospitalName = excluded.hospitalName, doctorName = excluded.doctorName;`,
    [PROFILE_ID, prefs.hospitalName, prefs.doctorName]
  );
}
