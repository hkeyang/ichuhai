import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/body-parser";
import { verifyCode } from "@/lib/api/email-verification";
import { createUserSessionToken } from "@/lib/api/user-session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VERIFY_ERRORS: Record<string, string> = {
  not_found: "验证码不存在或已使用，请重新获取",
  expired: "验证码已过期，请重新获取",
  too_many_attempts: "尝试次数过多，请重新获取验证码",
  mismatch: "验证码错误",
};

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<{ email?: string; code?: string }>(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();

    if (!EMAIL_RE.test(email)) throw new HttpError(400, "请输入有效邮箱");
    if (!/^\d{6}$/.test(code)) throw new HttpError(400, "请输入 6 位验证码");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const result = await verifyCode(db, email, code);
    if (!result.ok) {
      throw new HttpError(400, VERIFY_ERRORS[result.reason] ?? "验证失败");
    }

    const user = await db
      .prepare("SELECT id, email, nickname, default_currency FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; email: string; nickname: string | null; default_currency: string }>();
    if (!user) throw new HttpError(404, "用户不存在");

    await db
      .prepare("UPDATE users SET email_verified = 1, last_login_at = datetime('now') WHERE id = ?")
      .bind(user.id)
      .run();

    const token = await createUserSessionToken(user.id, cloudflareEnv);

    return jsonResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          authType: "email",
          defaultCurrency: user.default_currency,
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
