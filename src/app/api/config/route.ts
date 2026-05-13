import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { normalizeTelegramBotUsername } from "@/lib/api/telegram-auth";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  try {
    const cloudflareEnv = env as CloudflareEnv;
    const botUsername = normalizeTelegramBotUsername(cloudflareEnv.TELEGRAM_BOT_USERNAME);
    const data = {
      telegram: {
        botUsername,
        loginMode: botUsername ? 'widget' : 'mock',
      },
      admin: {
        authMode: cloudflareEnv.NODE_ENV === 'production' ? 'token' : 'dev-open',
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
