import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import type { MemoryPromptInput } from '../types/memoryPrompt';

/**
 * 보호자가 입력한 "오늘 아침 식사 / 어제 있었던 일"을 날짜별로 저장한다.
 * 5단계 기억력훈련 화면이 이 데이터를 읽어서 회상 퀴즈를 만든다.
 */
export async function saveMemoryPrompt(input: MemoryPromptInput): Promise<void> {
  const db = getFirestoreDb();
  await setDoc(doc(db, 'memoryPrompts', input.date), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function getMemoryPrompt(date: string): Promise<MemoryPromptInput | null> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, 'memoryPrompts', date));
  if (!snapshot.exists()) return null;
  return snapshot.data() as MemoryPromptInput;
}
