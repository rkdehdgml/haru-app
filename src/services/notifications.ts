import * as Notifications from 'expo-notifications';

// 병실 환경 제약: 소리 나는 알림은 절대 쓰지 않는다. 화면 표시 + 진동만 허용.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export interface ScheduleMedicationReminderParams {
  id: string;
  medicationName: string;
  hour: number;
  minute: number;
}

/** 지정 시간에 매일 반복되는 복약 알림을 예약한다 (소리 없음, 진동만). */
export function scheduleMedicationReminder(
  params: ScheduleMedicationReminderParams
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    identifier: params.id,
    content: {
      title: '복약 시간',
      body: `${params.medicationName} 복용 시간이에요`,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: params.hour,
      minute: params.minute,
    },
  });
}

export function cancelMedicationReminder(id: string): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(id);
}
