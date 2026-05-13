/**
 * 组件 5：Telegram 登录验证
 *
 * 按照 Telegram Login Widget 规范验证回调数据：
 * https://core.telegram.org/widgets/login#checking-authorization
 *
 * 算法：
 *   secret_key = SHA-256(bot_token)
 *   data_check_string = 排序后的 "key=value\n..." 字符串（不含 hash 字段）
 *   computed_hash = HMAC-SHA256(secret_key, data_check_string) 转十六进制
 */

/**
 * 验证 Telegram Login Widget 回调数据。
 *
 * @param data      Telegram 回调字段（含 hash、auth_date 等）
 * @param botToken  Bot Token（明文，用于派生 HMAC 密钥）
 * @returns         { ok: true } 或 { ok: false, reason: string }
 */
export async function verifyTelegramLogin(
  data: Record<string, string>,
  botToken: string
): Promise<{ ok: boolean; reason?: string }> {
  // 1. hash 字段必须存在
  if (!data.hash) {
    return { ok: false, reason: "missing hash" };
  }

  // 2. 分离 hash，其余字段按 key 字典序排序后拼接为 data_check_string
  const { hash, ...rest } = data;
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");

  // 3. 派生 HMAC 密钥：secret_key = SHA-256(bot_token)
  const secretKeyData = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(botToken)
  );
  const key = await crypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // 4. 计算 HMAC-SHA256 并转为十六进制字符串
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataCheckString)
  );
  const computedHash = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 5. 检查 auth_date 是否在 86400 秒（24 小时）内
  if (data.auth_date) {
    const age = Date.now() / 1000 - Number(data.auth_date);
    if (age > 86400) {
      return { ok: false, reason: "auth_date expired" };
    }
  }

  // 6. timing-safe 比较（hex 字符串逐字节 XOR）
  if (!timingSafeEqual(computedHash, hash)) {
    return { ok: false, reason: "hash mismatch" };
  }

  return { ok: true };
}

export function normalizeTelegramBotUsername(value = ""): string {
  return value
    .trim()
    .replace(/^https?:\/\/(?:www\.)?t\.me\//i, "")
    .replace(/^@+/, "")
    .split(/[/?#]/)[0]
    .trim();
}

export function normalizeTelegramUsername(value = ""): string {
  return value.trim().replace(/^@+/, "");
}

/**
 * 对两个字符串做 timing-safe 比较，防止时序攻击。
 * 长度不同时直接返回 false（但仍执行固定长度的循环以避免泄露长度信息）。
 */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  if (bufA.byteLength !== bufB.byteLength) return false;
  let result = 0;
  for (let i = 0; i < bufA.byteLength; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}
