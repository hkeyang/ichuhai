/**
 * 管理员 HMAC 会话
 *
 * 使用 Web Crypto HMAC-SHA256 签名 session token，12 小时 TTL。
 * token 格式：`<base64url-payload>.<base64url-signature>`
 */

/**
 * 使用 HMAC-SHA256 对 payload 签名，返回 base64url 编码的签名字符串。
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Timing-safe 字符串比较，防止时序攻击。
 * 两个字符串长度不同时直接返回 false（不泄露长度信息以外的内容）。
 */
export function timingSafeEqual(a: string, b: string): boolean {
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

/**
 * 创建管理员 session token。
 * payload 包含 role、nonce（防重放）和 exp（12 小时后过期）。
 */
export async function createAdminSessionToken(
  env: CloudflareEnv
): Promise<string> {
  const payload = btoa(
    JSON.stringify({
      role: "admin",
      nonce: crypto.randomUUID(),
      exp: Date.now() + 12 * 60 * 60 * 1000, // 12h TTL
    })
  );
  const signature = await signPayload(payload, env.ADMIN_SESSION_SECRET);
  return `${payload}.${signature}`;
}

/**
 * 验证管理员 session token。
 * 检查签名完整性（timing-safe）和过期时间。
 * 任何格式错误或验证失败均返回 false。
 */
export async function verifyAdminSessionToken(
  token: string,
  env: CloudflareEnv
): Promise<boolean> {
  const parts = (token || "").split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expected = await signPayload(payload, env.ADMIN_SESSION_SECRET);
  if (!timingSafeEqual(signature, expected)) return false;

  try {
    const session = JSON.parse(atob(payload)) as {
      role?: string;
      exp?: number;
    };
    return session.role === "admin" && Number(session.exp) > Date.now();
  } catch {
    return false;
  }
}
