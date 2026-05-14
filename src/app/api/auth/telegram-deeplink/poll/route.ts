import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { normalizeTelegramUsername } from "@/lib/api/telegram-auth";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

/**
 * GET /api/auth/telegram-deeplink/poll?token=xxx
 *
 * 返回三种状态：
 *   pending   — 用户还没在 Telegram 客户端点 Start
 *   completed — webhook 已写入用户信息；返回登录态（token + user），并立刻把 session 标为 consumed
 *   expired   — token 过期 / 已被消费 / 不存在
 */
export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) throw new HttpError(400, "missing token");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const session = await db
      .prepare(
        `SELECT token, status, telegram_id, telegram_username, telegram_first_name,
                user_id, expires_at
         FROM telegram_login_sessions
         WHERE token = ?`
      )
      .bind(token)
      .first<{
        token: string;
        status: string;
        telegram_id: string | null;
        telegram_username: string | null;
        telegram_first_name: string | null;
        user_id: string | null;
        expires_at: string;
      }>();

    if (!session) {
      return jsonResponse({ status: "expired", reason: "not found" }, 200, request, cloudflareEnv);
    }

    // 先按时间判定过期
    if (new Date(session.expires_at).getTime() < Date.now()) {
      // 惰性标记为 expired，避免堆积 pending 行
      if (session.status === "pending") {
        await db
          .prepare(`UPDATE telegram_login_sessions SET status = 'expired' WHERE token = ?`)
          .bind(token)
          .run();
      }
      return jsonResponse({ status: "expired" }, 200, request, cloudflareEnv);
    }

    if (session.status === "pending") {
      return jsonResponse({ status: "pending" }, 200, request, cloudflareEnv);
    }

    if (session.status === "consumed" || session.status === "expired") {
      return jsonResponse({ status: "expired", reason: session.status }, 200, request, cloudflareEnv);
    }

    // completed：一次性消费，换发登录态
    if (!session.user_id || !session.telegram_id) {
      // 理论上 webhook 已经 UPSERT 完，这里是保险：数据不全视为仍 pending
      return jsonResponse({ status: "pending" }, 200, request, cloudflareEnv);
    }

    await db
      .prepare(
        `UPDATE telegram_login_sessions SET status = 'consumed' WHERE token = ? AND status = 'completed'`
      )
      .bind(token)
      .run();

    const user = await db
      .prepare(
        `SELECT id, telegram_id, telegram_username, default_currency FROM users WHERE id = ?`
      )
      .bind(session.user_id)
      .first<{ id: string; telegram_id: string; telegram_username: string; default_currency: string }>();

    if (!user) {
      throw new HttpError(500, "user missing after completion");
    }

    const telegramUsername = normalizeTelegramUsername(
      user.telegram_username || session.telegram_username || session.telegram_first_name || `user_${user.telegram_id}`
    );
    const authToken = `dev.${btoa(user.id)}.token`;

    return jsonResponse(
      {
        status: "completed",
        token: authToken,
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          telegramUsername,
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
