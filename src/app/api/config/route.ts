import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { normalizeTelegramBotUsername } from "@/lib/api/telegram-auth";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  try {
    const cloudflareEnv = env as CloudflareEnv;
    const envRecord = cloudflareEnv as unknown as Record<string, string | undefined>;
    const botUsername = normalizeTelegramBotUsername(cloudflareEnv.TELEGRAM_BOT_USERNAME);
    let support = {
      title: "客服频道",
      description: "保留订单号、支付截图或收货信息，客服频道可以更快帮你核对。",
      label: envRecord.SUPPORT_TELEGRAM_HANDLE || "@ichuhaikefu",
      url: envRecord.SUPPORT_TELEGRAM_URL || "https://t.me/ichuhaikefu",
    };
    try {
      if (cloudflareEnv.DB) {
        await ensureDatabaseReady(cloudflareEnv.DB);
        const row = await cloudflareEnv.DB.prepare("SELECT value_json FROM content_settings WHERE key = 'support_channel' LIMIT 1").first<{ value_json?: string }>();
        if (row?.value_json) {
          support = { ...support, ...JSON.parse(row.value_json) };
        }
      }
    } catch {
      // Optional content config should not block the storefront.
    }
    const data = {
      telegram: {
        botUsername,
        loginMode: botUsername ? 'widget' : 'mock',
      },
      support,
      admin: {
        authMode: cloudflareEnv.NODE_ENV === 'production' ? 'token' : 'dev-open',
      },
      payments: {
        provider: 'usdt-trc20-direct',
        network: 'TRON',
        token: 'USDT',
        tokenStandard: 'TRC20',
        confirmations: 3,
      },
    };
    return jsonResponse(data, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, env as CloudflareEnv);
    }
    return jsonResponse({ error: 'internal server error' }, 500, request, env as CloudflareEnv);
  }
}
