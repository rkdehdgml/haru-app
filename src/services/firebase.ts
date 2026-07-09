// 2단계에서 구현 예정: Firebase 연동 (Firestore + Cloud Messaging).
//
// 설계 방향(단계 2에서 확정):
// - 설정 키는 .env로 분리해서 코드에 노출되지 않게 한다.
// - 환자의 개별 훈련 기록(문제 풀이 등)은 로컬(SQLite)에 우선 저장하고,
//   보호자가 봐야 하는 요약 데이터만 Firestore로 동기화한다.
// - 도움 요청(HelpRequest)은 Firestore 기록 + FCM 푸시로 보호자에게 즉시 전달한다.
//
// 1단계에서는 다른 모듈이 참조할 수 있도록 자리만 잡아둔다.

export {};
