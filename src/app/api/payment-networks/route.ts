import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { formatPaymentNetwork } from "@/lib/api/formatters";
import type { PaymentNetworkRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  try {
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    const { results } = await db
      .prepare(
        "SELECT id, code, display_name, token_standard, is_enabled, is_recommended, address, confirmations, warning_text, created_at, updated_at FROM payment_networks WHERE is_enabled = 1 AND code = 'TRON' ORDER BY code"
      )
      .all<PaymentNetworkRow>();

    return jsonResponse(results.map(formatPaymentNetwork), 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: 'internal server error' }, 500, request, cloudflareEnv);
  }
}
