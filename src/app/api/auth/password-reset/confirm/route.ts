import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/body-parser";
import { verifyCode } from "@/lib/api/email-verification";
import { hashPassword } from "@/lib/api/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.{6,}$)(?=.*[A-Za-z])(?=.*\d).+$/;

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
    const body = await parseBody<{ email?: string; code?: string; password?: string }>(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    const password = String(body.password ?? "");

    if (!EMAIL_RE.test(email)) throw new HttpError(400, "请输入有效邮箱");
    if (!/^\d{6}$/.test(code)) throw new HttpError(400, "请输入 6 位验证码");
    if (!PASSWORD_RE.test(password)) throw new HttpError(400, "密码至少 6 位，需包含字母和数字，可使用符号");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, email_verified FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; email_verified: number }>();
    if (!user || user.email_verified !== 1) throw new HttpError(400, "验证码错误或账号不存在");

    const result = await verifyCode(db, email, code, "reset");
    if (!result.ok) {
      throw new HttpError(400, VERIFY_ERRORS[result.reason] ?? "验证失败");
    }

    const passwordHash = await hashPassword(password);
    await db
      .prepare("UPDATE users SET password_hash = ?, last_login_at = last_login_at WHERE id = ?")
      .bind(passwordHash, user.id)
      .run();

    return jsonResponse({ ok: true, email }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
