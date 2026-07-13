import type { MedicationSchedule } from '../types/medication';

// 실제 복약 스케줄 등록/조정은 보호자 대시보드(추후 단계)에서 다룰 예정.
// 지금은 화면·저장·알림 배선을 검증하기 위한 샘플 스케줄 하나만 둔다.
export const MEDICATION_SCHEDULES: MedicationSchedule[] = [
  { id: 'sample-morning', name: '혈압약', scheduledTime: '08:00' },
];

export interface NextMedicationOccurrence {
  schedule: MedicationSchedule;
  /** 오늘 중 남은 시간인지, 아니면 다음날로 넘어간 것인지 */
  isToday: boolean;
}

/** 여러 스케줄 중 지금 시각 기준으로 가장 가까운 다음 복약 시간을 찾는다. */
export function getNextMedicationOccurrence(
  schedules: MedicationSchedule[],
  now: Date
): NextMedicationOccurrence | null {
  if (schedules.length === 0) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const withMinutes = schedules.map((schedule) => {
    const [hour, minute] = schedule.scheduledTime.split(':').map(Number);
    return { schedule, minutesOfDay: hour * 60 + minute };
  });

  const upcomingToday = withMinutes
    .filter((item) => item.minutesOfDay >= nowMinutes)
    .sort((a, b) => a.minutesOfDay - b.minutesOfDay)[0];
  if (upcomingToday) {
    return { schedule: upcomingToday.schedule, isToday: true };
  }

  const earliestTomorrow = [...withMinutes].sort((a, b) => a.minutesOfDay - b.minutesOfDay)[0];
  return { schedule: earliestTomorrow.schedule, isToday: false };
}
