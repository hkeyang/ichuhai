import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";

interface PaymentNetworkRow {
  id: string;
  code: string;
  display_name: string;
  token_standard: string;
  is_enabled: number;
  is_recommended: number;
  address: string;
  confirmations: number;
  warning_text: string | null;
  created_at: string;
  updated_at: string;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  try {
    const db = (env as CloudflareEnv).DB;
    const { results } = await db
      .prepare(
        'SELECT id, code, display_name, token_standard, is_enabled, is_recommended, address, confirmations, warning_text, created_at, updated_at FROM payment_networks WHERE is_enabled = 1 ORDER BY code'
      )
      .all<PaymentNetworkRow>();

    return jsonResponse(results, 200, request, env as CloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, env as CloudflareEnv);
    }
    return jsonResponse({ error: 'internal server error' }, 500, request, env as CloudflareEnv);
  }
}
