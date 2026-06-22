import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/body-parser";
import { hashPassword } from "@/lib/api/password";
import { issueVerificationCode } from "@/lib/api/email-verification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<{ email?: string; password?: string }>(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!EMAIL_RE.test(email)) throw new HttpError(400, "请输入有效邮箱");
    if (!PASSWORD_RE.test(password)) throw new HttpError(400, "密码需要至少字母和数字的 6 位组合");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const existing = await db
      .prepare("SELECT id, email_verified FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; email_verified: number }>();

    if (existing && existing.email_verified === 1) {
      throw new HttpError(409, "该邮箱已注册，请直接登录");
    }

    const passwordHash = await hashPassword(password);

    if (existing) {
      // 邮箱存在但未验证：更新密码，重新发码
      await db
        .prepare("UPDATE users SET password_hash = ?, last_login_at = last_login_at WHERE id = ?")
        .bind(passwordHash, existing.id)
        .run();
    } else {
      const userId = crypto.randomUUID();
      const nickname = `用户${email.split("@")[0].slice(0, 12)}`;
      await db
        .prepare(
          `INSERT INTO users (id, email, password_hash, email_verified, nickname, default_currency, last_login_at, created_at)
           VALUES (?, ?, ?, 0, ?, 'CNY', datetime('now'), datetime('now'))`
        )
        .bind(userId, email, passwordHash, nickname)
        .run();
    }

    const result = await issueVerificationCode(db, email, cloudflareEnv);
    if (!result.ok) {
      if (result.throttledSeconds) {
        throw new HttpError(429, `请求过于频繁，请 ${result.throttledSeconds} 秒后重试`);
      }
      throw new HttpError(502, "验证码发送失败，请稍后重试");
    }

    return jsonResponse({ ok: true, email, next: "verify" }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
