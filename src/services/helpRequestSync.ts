import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import {
  createPendingHelpRequest,
  getUnsentHelpRequests,
  updateHelpRequestStatus,
} from './storage/helpRequestStorage';
import type { HelpRequestRecord } from '../types/helpRequest';

// 병원 와이파이가 불안정할 수 있어, 실패하면 점점 늘어나는 간격으로 자동 재시도한다.
const RETRY_DELAYS_MS = [1000, 3000, 7000];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeToFirestore(record: HelpRequestRecord): Promise<boolean> {
  const db = getFirestoreDb();
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await addDoc(collection(db, 'helpRequests'), {
        localId: record.id,
        requestedAt: record.requestedAt,
        roomInfo: record.roomInfo,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.warn(`[helpRequestSync] Firestore 전송 실패 (시도 ${attempt + 1})`, error);
      if (attempt < RETRY_DELAYS_MS.length) {
        await delay(RETRY_DELAYS_MS[attempt]);
      }
    }
  }
  return false;
}

/**
 * 3단계 보호자 대시보드에서 보호자가 로그인하면 자신의 Expo 푸시 토큰을
 * `caregiverDevices` 컬렉션에 등록하는 것을 전제로 한다. 아직 등록된 기기가
 * 없으면(3단계 이전) 조용히 건너뛴다 — 푸시는 부가 기능이고 Firestore 기록이
 * 진짜 소스이므로, 실패해도 도움 요청 자체의 성공 여부에는 영향을 주지 않는다.
 */
async function notifyCaregiversByPush(record: HelpRequestRecord): Promise<void> {
  try {
    const db = getFirestoreDb();
    const snapshot = await getDocs(collection(db, 'caregiverDevices'));
    const tokens = snapshot.docs
      .map((docSnap) => docSnap.data().expoPushToken as string | undefined)
      .filter((token): token is string => Boolean(token));
    if (tokens.length === 0) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(
        tokens.map((to) => ({
          to,
          title: '도움 요청',
          body: record.roomInfo
            ? `${record.roomInfo}에서 도움을 요청했어요`
            : '환자가 도움을 요청했어요',
          data: { type: 'help_request', requestedAt: record.requestedAt },
          priority: 'high',
        }))
      ),
    });
  } catch (error) {
    console.warn('[helpRequestSync] 보호자 푸시 전송 실패', error);
  }
}

export interface SubmitHelpRequestResult {
  ok: boolean;
  record: HelpRequestRecord;
}

/** 로컬 기록 → Firestore 전송(자동 재시도 포함) → 보호자 푸시까지 한 번에 처리한다. */
export async function submitHelpRequest(
  roomInfo: string | null
): Promise<SubmitHelpRequestResult> {
  const record = await createPendingHelpRequest(roomInfo);
  const ok = await writeToFirestore(record);
  const finalStatus = ok ? 'sent' : 'failed';
  await updateHelpRequestStatus(record.id, finalStatus, ok ? 0 : RETRY_DELAYS_MS.length + 1);
  if (ok) {
    void notifyCaregiversByPush(record);
  }
  return { ok, record: { ...record, sendStatus: finalStatus } };
}

/**
 * 이전 세션에서 끝내 못 보낸 요청이 남아 있으면 화면 진입 시 조용히 재시도한다.
 * 화면 상태에는 영향을 주지 않는 백그라운드 보정 작업이다.
 */
export async function retryPendingHelpRequests(): Promise<void> {
  const pending = await getUnsentHelpRequests();
  for (const record of pending) {
    const ok = await writeToFirestore(record);
    await updateHelpRequestStatus(
      record.id,
      ok ? 'sent' : 'failed',
      ok ? 0 : record.retryCount + 1
    );
    if (ok) {
      void notifyCaregiversByPush(record);
    }
  }
}
