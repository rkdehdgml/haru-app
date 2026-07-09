export type CognitiveExerciseType =
  | 'date_weekday_season'
  | 'am_pm'
  | 'location'
  | 'card_matching'
  | 'ordered_tap'
  | 'spot_the_difference';

export type MemoryExerciseType =
  | 'today_breakfast_recall'
  | 'yesterday_event_quiz'
  | 'family_photo_naming'
  | 'medical_staff_recall'
  | 'short_term_word_recall'
  | 'photo_sequence_ordering';

export type ExerciseType = CognitiveExerciseType | MemoryExerciseType;
export type ExerciseCategory = 'cognitive' | 'memory';

export interface ExerciseAccuracyRecord {
  type: ExerciseType;
  correctCount: number;
  totalCount: number;
}

export interface DailyExerciseSelection {
  cognitive: CognitiveExerciseType[];
  memory: MemoryExerciseType[];
}
