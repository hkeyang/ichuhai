import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { parseBody } from "@/lib/api/body-parser";
import { verifyPassword } from "@/lib/api/password";
import { createUserSessionToken, userSessionTtlDays } from "@/lib/api/user-session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<{ email?: string; password?: string; remember?: boolean }>(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const remember = body.remember === true;

    if (!EMAIL_RE.test(email)) throw new HttpError(400, "请输入有效邮箱");
    if (!password) throw new HttpError(400, "请输入密码");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare(
        "SELECT id, email, password_hash, email_verified, nickname, default_currency, balance_usdt FROM users WHERE email = ?"
      )
      .bind(email)
      .first<{
        id: string;
        email: string;
        password_hash: string | null;
        email_verified: number;
        nickname: string | null;
        default_currency: string;
        balance_usdt: string | null;
      }>();

    // 统一报错文案，避免泄露邮箱是否注册
    if (!user || !user.password_hash) throw new HttpError(401, "邮箱或密码错误");

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) throw new HttpError(401, "邮箱或密码错误");

    await db
      .prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?")
      .bind(user.id)
      .run();

    const token = await createUserSessionToken(user.id, cloudflareEnv, { remember });

    return jsonResponse(
      {
        token,
        expiresInDays: userSessionTtlDays(remember),
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          authType: "email",
          defaultCurrency: user.default_currency,
          balanceUsdt: user.balance_usdt ?? "0",
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
