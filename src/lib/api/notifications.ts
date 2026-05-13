export interface NotificationInput {
  orderId?: string | null;
  channel: string;
  type: string;
  provider: string;
  status: 'sent' | 'failed' | 'pending';
  messageId?: string | null;
  error?: string | null;
}

export async function writeNotification(
  db: D1Database,
  input: NotificationInput
): Promise<void> {
  await db.prepare(
    `INSERT INTO notifications (id, order_id, channel, type, provider, status, message_id, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    crypto.randomUUID(),
    input.orderId ?? null,
    input.channel,
    input.type,
    input.provider,
    input.status,
    input.messageId ?? null,
    input.error ?? null
  ).run();
}
