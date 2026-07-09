import type {
  DailyExerciseSelection,
  ExerciseAccuracyRecord,
  ExerciseType,
} from '../types/exercise';

/** 특정 날짜에 노출됐던 문제 유형 이력 (최근 2~3일 제외 규칙에 사용) */
export interface ExerciseExposureRecord {
  date: string; // ISO 날짜 (YYYY-MM-DD)
  types: ExerciseType[];
}

export interface SelectDailyExercisesParams {
  today: string; // ISO 날짜 (YYYY-MM-DD)
  recentExposures: ExerciseExposureRecord[];
  accuracyRecords: ExerciseAccuracyRecord[];
}

export interface ReselectExerciseParams {
  currentSelection: DailyExerciseSelection;
  targetType: ExerciseType; // "다른 문제로 바꿔주세요" 대상 유형
  today: string;
  recentExposures: ExerciseExposureRecord[];
  accuracyRecords: ExerciseAccuracyRecord[];
}

/**
 * 오늘의 인지훈련 2개 + 기억력훈련 2개를 규칙 있는 랜덤으로 선택한다.
 * 실제 규칙(최근 노출 제외, 정답률 가중치, 쉬운 유형 최소 1개 보장)은 4단계에서 구현.
 */
export function selectDailyExercises(
  _params: SelectDailyExercisesParams
): DailyExerciseSelection {
  throw new Error('selectDailyExercises는 4단계에서 구현 예정입니다.');
}

/** "다른 문제로 바꿔주세요" 요청 시 대상 유형 하나만 재선택한다. */
export function reselectExercise(_params: ReselectExerciseParams): ExerciseType {
  throw new Error('reselectExercise는 4단계에서 구현 예정입니다.');
}
