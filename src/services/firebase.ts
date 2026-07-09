import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

// 2단계: Firebase 연동.
// 설정 값은 코드에 직접 넣지 않고 .env(EXPO_PUBLIC_*)에서 읽는다.
// .env.example을 복사해 .env를 만들고 Firebase 콘솔(프로젝트 설정 > 일반 > 웹 앱) 값으로 채워야 한다.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function isConfigured(): boolean {
  return Object.values(firebaseConfig).every((value) => Boolean(value));
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isConfigured()) {
    throw new Error(
      'Firebase 설정이 비어 있습니다. .env.example을 복사해 .env를 만들고 Firebase 콘솔 값을 채워주세요.'
    );
  }
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * React Native 환경은 Firestore의 기본 gRPC 스트리밍을 지원하지 않으므로
 * long polling으로 강제해서 병원 와이파이처럼 불안정한 네트워크에서도 동작하게 한다.
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    db = initializeFirestore(getFirebaseApp(), { experimentalForceLongPolling: true });
  }
  return db;
}
