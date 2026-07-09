import * as Notifications from 'expo-notifications';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

/**
 * 보호자가 대시보드에 들어오면 이 기기를 도움 요청 푸시 대상으로 등록한다.
 * 2단계에서 만들어둔 caregiverDevices 컬렉션(그동안 비어 있던 대상)을 채우는 역할.
 * 실제 수신을 받으려면 커스텀 dev client 빌드 + EAS 프로젝트/FCM 자격증명 설정이 필요하다
 * (Expo Go는 SDK 53부터 원격 푸시를 지원하지 않는다) — 이 함수는 그 전제 없이도
 * 조용히 실패하도록 만들어 나머지 대시보드 기능을 막지 않는다.
 */
export async function registerCaregiverDeviceForPush(): Promise<void> {
  try {
    const current = await Notifications.getPermissionsAsync();
    const status =
      current.status === 'granted'
        ? current.status
        : (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
    const db = getFirestoreDb();
    await setDoc(doc(db, 'caregiverDevices', expoPushToken), {
      expoPushToken,
      registeredAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[caregiverPushRegistration] 보호자 기기 등록 실패', error);
  }
}
