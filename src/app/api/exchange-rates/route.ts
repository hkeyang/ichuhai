import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";

interface ExchangeRateRow {
  currency: string;
  rate: string;
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
      .prepare('SELECT currency, rate, updated_at FROM exchange_rates ORDER BY currency')
      .all<ExchangeRateRow>();

    const rates: Record<string, string> = {};
    let updatedAt: string | null = null;

    for (const row of results) {
      rates[row.currency] = row.rate;
      if (!updatedAt || row.updated_at > updatedAt) {
        updatedAt = row.updated_at;
      }
    }

    const data = {
      base: 'USDT',
      rates,
      updatedAt: updatedAt ?? new Date().toISOString(),
    };

    return jsonResponse(data, 200, request, env as CloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, env as CloudflareEnv);
    }
    return jsonResponse({ error: 'internal server error' }, 500, request, env as CloudflareEnv);
  }
}
