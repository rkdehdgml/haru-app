export type HelpRequestSendStatus = 'pending' | 'sending' | 'sent' | 'failed';

export interface HelpRequestRecord {
  id: string;
  /** ISO 8601 */
  requestedAt: string;
  roomInfo: string | null;
  sendStatus: HelpRequestSendStatus;
  retryCount: number;
}
