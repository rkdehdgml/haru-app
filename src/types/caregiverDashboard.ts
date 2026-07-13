export interface MedicationSummaryData {
  date: string; // YYYY-MM-DD
  takenCount: number;
  notGivenCount: number;
  totalLogged: number;
  lastRecordedAt: string | null;
}

export interface HelpRequestHistoryItem {
  requestedAt: string;
  roomInfo: string | null;
}

export interface HandExerciseSummaryData {
  date: string; // YYYY-MM-DD
  completedExerciseCount: number;
  totalCompletedReps: number;
  lastRecordedAt: string | null;
}
