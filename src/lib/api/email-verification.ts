// src/lib/api/email-verification.ts
// 注册邮箱验证码：生成 / 存储（哈希）/ 节流 / 校验。

import { sendVerificationEmail } from "./mailer";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 分钟
const RESEND_THROTTLE_MS = 60 * 1000; // 60 秒重发节流
const MAX_ATTEMPTS = 5; // 单条验证码最多尝试次数

/** 6 位数字验证码哈希（混入 email，避免彩虹表）。 */
async function hashCode(email: string, code: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function generateCode(): string {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
}

interface VerificationRow {
  id: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
}

/**
 * 签发验证码并发信。返回 { ok } 或在节流时抛错。
 * dev 模式（无 Resend 且 MailChannels 失败）会把验证码记到日志。
 */
export async function issueVerificationCode(
  db: D1Database,
  email: string,
  env: CloudflareEnv
): Promise<{ ok: boolean; throttledSeconds?: number }> {
  const normalized = email.toLowerCase();

  // 节流：60 秒内不可重复发送
  const recent = await db
    .prepare(
      "SELECT created_at FROM email_verifications WHERE email = ? AND purpose = 'register' ORDER BY created_at DESC LIMIT 1"
    )
    .bind(normalized)
    .first<{ created_at: string }>();
  if (recent) {
    const elapsed = Date.now() - new Date(`${recent.created_at.replace(" ", "T")}Z`).getTime();
    if (elapsed >= 0 && elapsed < RESEND_THROTTLE_MS) {
      return { ok: false, throttledSeconds: Math.ceil((RESEND_THROTTLE_MS - elapsed) / 1000) };
    }
  }

  const code = generateCode();
  const codeHash = await hashCode(normalized, code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  // 作废该邮箱此前未消费的验证码，避免多码并存
  await db
    .prepare(
      "UPDATE email_verifications SET consumed_at = datetime('now') WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL"
    )
    .bind(normalized)
    .run();

  await db
    .prepare(
      `INSERT INTO email_verifications (id, email, code_hash, purpose, attempts, expires_at, created_at)
       VALUES (?, ?, ?, 'register', 0, ?, datetime('now'))`
    )
    .bind(crypto.randomUUID(), normalized, codeHash, expiresAt)
    .run();

  await sendVerificationEmail(normalized, code, env);
  return { ok: true };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "mismatch" };

/** 校验验证码。成功后标记 consumed。 */
export async function verifyCode(
  db: D1Database,
  email: string,
  code: string
): Promise<VerifyResult> {
  const normalized = email.toLowerCase();
  const row = await db
    .prepare(
      `SELECT id, code_hash, attempts, expires_at, consumed_at, created_at
       FROM email_verifications
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`
    )
    .bind(normalized)
    .first<VerificationRow>();

  if (!row) return { ok: false, reason: "not_found" };
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  const codeHash = await hashCode(normalized, code);
  if (codeHash !== row.code_hash) {
    await db
      .prepare("UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?")
      .bind(row.id)
      .run();
    return { ok: false, reason: "mismatch" };
  }

  await db
    .prepare("UPDATE email_verifications SET consumed_at = datetime('now') WHERE id = ?")
    .bind(row.id)
    .run();
  return { ok: true };
}
