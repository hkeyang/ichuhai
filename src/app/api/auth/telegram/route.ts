import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { normalizeTelegramUsername, verifyTelegramLogin } from "@/lib/api/telegram-auth";

interface TelegramCallbackBody {
  id?: string | number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  auth_date?: string | number;
  hash?: string;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<TelegramCallbackBody>(request);

    // 将所有字段转为字符串（Telegram Widget 有时传数字类型）
    const telegramData: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null) {
        telegramData[k] = String(v);
      }
    }

    // 必填字段校验
    if (!telegramData.id) {
      throw new HttpError(400, "missing required field: id");
    }
    if (!telegramData.auth_date) {
      throw new HttpError(400, "missing required field: auth_date");
    }
    if (!telegramData.hash) {
      throw new HttpError(400, "missing required field: hash");
    }

    const isProduction = cloudflareEnv.NODE_ENV === "production";
    let verified = false;

    if (isProduction) {
      // 生产环境：严格验证
      const result = await verifyTelegramLogin(telegramData, cloudflareEnv.TELEGRAM_BOT_TOKEN);
      if (!result.ok) {
        return jsonResponse(
          { error: result.reason ?? "telegram verification failed" },
          401,
          request,
          cloudflareEnv
        );
      }
      verified = true;
    } else {
      // 开发环境：跳过验证，但仍尝试验证以设置 verified 标志
      const result = await verifyTelegramLogin(telegramData, cloudflareEnv.TELEGRAM_BOT_TOKEN || "dev-token");
      verified = result.ok;
    }

    // UPSERT users 表（通过 telegram_id 匹配）
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    const telegramId = telegramData.id;
    const telegramUsername = normalizeTelegramUsername(
      telegramData.username ?? telegramData.first_name ?? `user_${telegramId}`
    );

    const existingUser = await db
      .prepare("SELECT id, telegram_id, telegram_username, default_currency FROM users WHERE telegram_id = ?")
      .bind(telegramId)
      .first<{ id: string; telegram_id: string; telegram_username: string; default_currency: string }>();

    let userId: string;
    let defaultCurrency: string;

    if (existingUser) {
      // 更新已有用户
      userId = existingUser.id;
      defaultCurrency = existingUser.default_currency;
      await db
        .prepare(
          "UPDATE users SET telegram_username = ?, last_login_at = datetime('now') WHERE id = ?"
        )
        .bind(telegramUsername, userId)
        .run();
    } else {
      // 创建新用户
      userId = crypto.randomUUID();
      defaultCurrency = "CNY";
      await db
        .prepare(
          `INSERT INTO users (id, telegram_id, telegram_username, default_currency, last_login_at, created_at)
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
        )
        .bind(userId, telegramId, telegramUsername, defaultCurrency)
        .run();
    }

    // Phase 1 简单 token 格式：dev.${btoa(userId)}.token
    const token = `dev.${btoa(userId)}.token`;

    return jsonResponse(
      {
        token,
        user: {
          id: userId,
          telegramId,
          telegramUsername,
          defaultCurrency,
        },
        verified,
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
