import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";

// 支持的货币列表（与 exchange_rates 种子数据保持一致）
const SUPPORTED_CURRENCIES = new Set([
  "USD",
  "CNY",
  "GBP",
  "EUR",
  "AUD",
  "JPY",
  "HKD",
  "KRW",
]);

interface PreferencesBody {
  defaultCurrency?: string;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function PATCH(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const body = await parseBody<PreferencesBody>(request);

    const { defaultCurrency } = body;

    if (!defaultCurrency) {
      throw new HttpError(400, "missing required field: defaultCurrency");
    }

    if (!SUPPORTED_CURRENCIES.has(defaultCurrency)) {
      throw new HttpError(
        400,
        `unsupported currency: ${defaultCurrency}. Supported: ${[...SUPPORTED_CURRENCIES].join(", ")}`
      );
    }

    // 兼容新签名 token 与旧 dev.<base64>.token
    const userId = await resolveUserId(request, cloudflareEnv);

    if (!userId) {
      throw new HttpError(401, "unauthorized");
    }

    const db = cloudflareEnv.DB;

    // 校验用户存在
    const user = await db
      .prepare("SELECT id FROM users WHERE id = ?")
      .bind(userId)
      .first<{ id: string }>();

    if (!user) {
      throw new HttpError(404, "user not found");
    }

    // 更新偏好
    await db
      .prepare("UPDATE users SET default_currency = ? WHERE id = ?")
      .bind(defaultCurrency, userId)
      .run();

    return jsonResponse({ defaultCurrency }, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
