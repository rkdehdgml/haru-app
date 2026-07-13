export interface HandExerciseDefinition {
  id: string;
  name: string;
  description: string;
  defaultTargetReps: number;
  icon: string;
  /** 안내 영상 URL. 아직 촬영된 영상이 없으면 null — 화면은 "준비 중" 상태로 표시한다. */
  videoUri: string | null;
}

export interface HandExerciseSetting {
  id: string;
  name: string;
  description: string;
  icon: string;
  videoUri: string | null;
  /** 담당 치료사가 보호자 대시보드에서 조정하는 목표 횟수 */
  targetReps: number;
  /** 이 운동을 오늘 세션에 포함할지 여부 (보호자 대시보드에서 조정) */
  enabled: boolean;
  sortOrder: number;
}

export interface HandExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  completedReps: number;
  targetReps: number;
  /** YYYY-MM-DD */
  date: string;
  /** ISO 8601 */
  recordedAt: string;
}
