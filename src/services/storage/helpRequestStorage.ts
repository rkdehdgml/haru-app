import { getDb } from './db';
import { generateId } from '../id';
import type { HelpRequestRecord, HelpRequestSendStatus } from '../../types/helpRequest';

interface HelpRequestRow {
  id: string;
  requestedAt: string;
  roomInfo: string | null;
  sendStatus: HelpRequestSendStatus;
  retryCount: number;
}

export async function createPendingHelpRequest(
  roomInfo: string | null
): Promise<HelpRequestRecord> {
  const db = await getDb();
  const record: HelpRequestRecord = {
    id: generateId(),
    requestedAt: new Date().toISOString(),
    roomInfo,
    sendStatus: 'pending',
    retryCount: 0,
  };
  await db.runAsync(
    `INSERT INTO help_requests (id, requestedAt, roomInfo, sendStatus, retryCount)
     VALUES (?, ?, ?, ?, ?);`,
    [record.id, record.requestedAt, record.roomInfo, record.sendStatus, record.retryCount]
  );
  return record;
}

export async function updateHelpRequestStatus(
  id: string,
  sendStatus: HelpRequestSendStatus,
  retryCount: number
): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE help_requests SET sendStatus = ?, retryCount = ? WHERE id = ?;`, [
    sendStatus,
    retryCount,
    id,
  ]);
}

/** 3단계 보호자 대시보드에서 최근 도움 요청 이력(시각, 상태)을 보여줄 때 사용한다. */
export async function getRecentHelpRequests(limit = 20): Promise<HelpRequestRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HelpRequestRow>(
    `SELECT * FROM help_requests ORDER BY requestedAt DESC LIMIT ?;`,
    [limit]
  );
  return rows;
}

/** 앱을 다시 열었을 때 아직 못 보낸(pending/failed) 요청을 재시도 대상으로 가져온다. */
export async function getUnsentHelpRequests(): Promise<HelpRequestRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HelpRequestRow>(
    `SELECT * FROM help_requests WHERE sendStatus IN ('pending', 'failed') ORDER BY requestedAt ASC;`
  );
  return rows;
}
