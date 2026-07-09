export type MedicationStatus = 'taken' | 'not_given_yet';

export interface MedicationSchedule {
  id: string;
  name: string;
  /** 24시간 "HH:mm" 포맷 */
  scheduledTime: string;
}

export interface MedicationLog {
  id: string;
  scheduleId: string;
  medicationName: string;
  scheduledTime: string;
  status: MedicationStatus;
  /** ISO 8601 */
  recordedAt: string;
  /** 보호자 대시보드(Firestore) 동기화 여부 — 2단계에서 실제 동기화 구현 */
  syncedToFirestore: boolean;
}
