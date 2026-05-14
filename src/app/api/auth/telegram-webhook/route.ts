import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse } from "@/lib/api/cors";
import { normalizeTelegramUsername } from "@/lib/api/telegram-auth";
import { tgSendMessage } from "@/lib/api/telegram-bot";

/**
 * POST /api/auth/telegram-webhook
 *
 * 由 Telegram Bot API 在 setWebhook 时配置调用。我们用 secret_token 头做反 CSRF：
 *   setWebhook 时传入 secret_token = TELEGRAM_WEBHOOK_SECRET
 *   Telegram 每次回调会带 header X-Telegram-Bot-Api-Secret-Token，必须匹配
 *
 * 只处理 "/start <token>" 消息：
 *   1. 校验 token 存在、pending、未过期
 *   2. UPSERT users 表
 *   3. 把 session 更新为 completed
 *   4. 给用户回一句提示（失败不影响登录）
 *
 * 其他消息一律返回 200 OK，避免 Telegram 重试 / bot 日志告警。
 */

interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number | string };
    from?: {
      id?: number | string;
      username?: string;
      first_name?: string;
      last_name?: string;
      is_bot?: boolean;
    };
  };
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  // 反 CSRF：secret token 必须匹配
  const provided = request.headers.get("x-telegram-bot-api-secret-token") || "";
  const expected = cloudflareEnv.TELEGRAM_WEBHOOK_SECRET || "";
  if (!expected || provided !== expected) {
    return new Response("forbidden", { status: 403 });
  }

  try {
    const update = await parseBody<TelegramUpdate>(request);
    const message = update.message;
    const text = message?.text?.trim() ?? "";
    const from = message?.from;
    const chatId = message?.chat?.id;

    // 不是 /start 或缺关键字段，忽略（仍返回 200，避免 Telegram 重试）
    if (!text.startsWith("/start") || !from || from.is_bot || !chatId) {
      return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
    }

    // 解析 /start <token>
    const parts = text.split(/\s+/);
    const token = parts[1];
    if (!token) {
      await tgSendMessage(
        cloudflareEnv.TELEGRAM_BOT_TOKEN,
        chatId,
        "请从 ichuhai.shop 网站点击 Telegram 登录按钮进入，这样才能完成授权。"
      );
      return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
    }

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const session = await db
      .prepare(
        `SELECT token, status, expires_at FROM telegram_login_sessions WHERE token = ?`
      )
      .bind(token)
      .first<{ token: string; status: string; expires_at: string }>();

    if (!session) {
      await tgSendMessage(
        cloudflareEnv.TELEGRAM_BOT_TOKEN,
        chatId,
        "登录链接无效或已失效，请回到 ichuhai.shop 重新点击 Telegram 登录。"
      );
      return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await db
        .prepare(`UPDATE telegram_login_sessions SET status = 'expired' WHERE token = ?`)
        .bind(token)
        .run();
      await tgSendMessage(
        cloudflareEnv.TELEGRAM_BOT_TOKEN,
        chatId,
        "登录链接已过期（10 分钟有效），请回到 ichuhai.shop 重新获取。"
      );
      return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
    }

    if (session.status !== "pending") {
      await tgSendMessage(
        cloudflareEnv.TELEGRAM_BOT_TOKEN,
        chatId,
        "该登录链接已被使用，请回到 ichuhai.shop 重新获取新的链接。"
      );
      return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
    }

    // UPSERT users
    const telegramId = String(from.id);
    const telegramUsername = normalizeTelegramUsername(
      from.username ?? from.first_name ?? `user_${telegramId}`
    );

    const existingUser = await db
      .prepare(
        `SELECT id, telegram_id, telegram_username, default_currency FROM users WHERE telegram_id = ?`
      )
      .bind(telegramId)
      .first<{ id: string; telegram_id: string; telegram_username: string; default_currency: string }>();

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      await db
        .prepare(
          `UPDATE users SET telegram_username = ?, last_login_at = datetime('now') WHERE id = ?`
        )
        .bind(telegramUsername, userId)
        .run();
    } else {
      userId = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO users (id, telegram_id, telegram_username, default_currency, last_login_at, created_at)
           VALUES (?, ?, ?, 'CNY', datetime('now'), datetime('now'))`
        )
        .bind(userId, telegramId, telegramUsername)
        .run();
    }

    // 完成 session（只从 pending 转 completed，防止并发竞态）
    const updateResult = await db
      .prepare(
        `UPDATE telegram_login_sessions
         SET status = 'completed',
             telegram_id = ?,
             telegram_username = ?,
             telegram_first_name = ?,
             telegram_last_name = ?,
             user_id = ?,
             completed_at = datetime('now')
         WHERE token = ? AND status = 'pending'`
      )
      .bind(
        telegramId,
        telegramUsername,
        from.first_name ?? null,
        from.last_name ?? null,
        userId,
        token
      )
      .run();

    const changed = (updateResult.meta as { changes?: number } | undefined)?.changes ?? 0;
    if (!changed) {
      // 并发下已被其他请求 consume
      await tgSendMessage(
        cloudflareEnv.TELEGRAM_BOT_TOKEN,
        chatId,
        "登录状态已在另一端完成，请回到网页查看。"
      );
      return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
    }

    await tgSendMessage(
      cloudflareEnv.TELEGRAM_BOT_TOKEN,
      chatId,
      `✅ 登录已确认，正在跳回 <b>ichuhai.shop</b>，你可以关闭这个对话窗口。`
    );

    return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
  } catch {
    // 绝不让 Telegram 看到 5xx，否则它会重试 webhook
    return jsonResponse({ ok: true }, 200, request, cloudflareEnv);
  }
}
