import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { normalizeTelegramBotUsername } from "@/lib/api/telegram-auth";
import { generateLoginToken } from "@/lib/api/telegram-bot";

// 一次性 token 有效期（秒）。用户有这么久时间点完 Telegram 的 Start 按钮。
const TOKEN_TTL_SECONDS = 600; // 10 分钟

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const botUsername = normalizeTelegramBotUsername(cloudflareEnv.TELEGRAM_BOT_USERNAME);
    if (!botUsername) {
      throw new HttpError(503, "telegram bot not configured");
    }

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const token = generateLoginToken();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();

    await db
      .prepare(
        `INSERT INTO telegram_login_sessions (token, status, issued_at, expires_at)
         VALUES (?, 'pending', datetime('now'), ?)`
      )
      .bind(token, expiresAt)
      .run();

    return jsonResponse(
      {
        token,
        expiresAt,
        ttlSeconds: TOKEN_TTL_SECONDS,
        botUsername,
        // 为前端同时下发两种链接：t.me 对不带协议处理的环境最稳；tg:// 在装了客户端的桌面会优先调起
        deeplink: `https://t.me/${botUsername}?start=${token}`,
        deeplinkNative: `tg://resolve?domain=${botUsername}&start=${token}`,
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
