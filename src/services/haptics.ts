import * as Haptics from 'expo-haptics';

// 병실에서 소리 나는 알림을 쓸 수 없어, 모든 알림/피드백은 진동으로만 전달한다.

/** 버튼 탭 등 가벼운 동작에 대한 즉각 피드백 */
export function vibrateTap(): Promise<void> {
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** 복약 알림 등 "확인이 필요한" 이벤트에 대한 피드백 */
export function vibrateNotification(): Promise<void> {
  return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
