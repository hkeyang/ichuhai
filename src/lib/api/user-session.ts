// src/lib/api/user-session.ts
// 用户会话 token：Web Crypto HMAC-SHA256 签名，格式 `<base64url-payload>.<base64url-signature>`。
// 兼容旧的占位 token 格式 `dev.<base64(userId)>.token`（Telegram 登录沿用）。

import { timingSafeEqual } from "./admin-session";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_USER_TTL_DAYS = 7;
const REMEMBER_USER_TTL_DAYS = 30;

function sessionSecret(env: CloudflareEnv): string {
  // 优先用独立的用户会话密钥，否则复用 admin 会话密钥，避免新增必填配置。
  return env.USER_SESSION_SECRET || env.ADMIN_SESSION_SECRET || "dev-user-session-secret";
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64url(new Uint8Array(sig));
}

/** 为用户签发带签名和过期时间的会话 token。 */
export async function createUserSessionToken(
  userId: string,
  env: CloudflareEnv,
  options: { remember?: boolean } = {}
): Promise<string> {
  const ttlDays = options.remember ? REMEMBER_USER_TTL_DAYS : DEFAULT_USER_TTL_DAYS;
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      nonce: crypto.randomUUID(),
      exp: Date.now() + ttlDays * DAY_MS,
    })
  );
  const signature = await signPayload(payload, sessionSecret(env));
  return `${payload}.${signature}`;
}

export function userSessionTtlDays(remember = false): number {
  return remember ? REMEMBER_USER_TTL_DAYS : DEFAULT_USER_TTL_DAYS;
}

/** 校验签名 token，返回 userId；失败返回 null。 */
async function verifyUserSessionToken(token: string, env: CloudflareEnv): Promise<string | null> {
  const parts = (token || "").split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = await signPayload(payload, sessionSecret(env));
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(atob(payload)) as { sub?: string; exp?: number };
    if (!session.sub || Number(session.exp) <= Date.now()) return null;
    return session.sub;
  } catch {
    return null;
  }
}

/** 解析旧占位 token：`dev.<base64(userId)>.token`。 */
function parseLegacyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "dev" || parts[2] !== "token") return null;
  try {
    return atob(parts[1]);
  } catch {
    return null;
  }
}

/**
 * 从请求中解析当前用户 ID。
 * 先校验新的签名 token，回退到旧的 Telegram 占位 token，保持向后兼容。
 */
export async function resolveUserId(request: Request, env: CloudflareEnv): Promise<string | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!token) return null;
  return (await verifyUserSessionToken(token, env)) ?? parseLegacyToken(token);
}
