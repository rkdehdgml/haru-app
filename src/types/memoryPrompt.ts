export interface MemoryPromptInput {
  date: string; // YYYY-MM-DD
  breakfast: string;
  yesterdayEvent: string;
  /** Home 화면에 표시되는 오늘의 재활치료 일정 안내 (예: "오전 10시 물리치료실") */
  rehabSchedule: string;
}
