import { getNextMedicationOccurrence } from './medicationSchedule';
import type { MedicationSchedule } from '../types/medication';

const SCHEDULES: MedicationSchedule[] = [
  { id: 'morning', name: '혈압약', scheduledTime: '08:00' },
  { id: 'evening', name: '위장약', scheduledTime: '19:00' },
];

describe('getNextMedicationOccurrence', () => {
  it('returns the next schedule later today when one remains', () => {
    const result = getNextMedicationOccurrence(SCHEDULES, new Date(2026, 0, 1, 10, 0));
    expect(result).toEqual({ schedule: SCHEDULES[1], isToday: true });
  });

  it('returns the earliest schedule for tomorrow when all of today have passed', () => {
    const result = getNextMedicationOccurrence(SCHEDULES, new Date(2026, 0, 1, 20, 0));
    expect(result).toEqual({ schedule: SCHEDULES[0], isToday: false });
  });

  it('returns null when there are no schedules', () => {
    expect(getNextMedicationOccurrence([], new Date())).toBeNull();
  });
});
