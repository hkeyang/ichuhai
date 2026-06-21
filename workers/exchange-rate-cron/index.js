const SOURCE_URL = 'https://open.er-api.com/v6/latest/USD';
const TARGET_CURRENCIES = ['CNY', 'GBP', 'EUR', 'AUD', 'JPY', 'HKD', 'KRW'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function isAuthorized(request, env) {
  if (!env.EXCHANGE_RATE_CRON_TOKEN) return false;

  const url = new URL(request.url);
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearer || url.searchParams.get('token');

  return token === env.EXCHANGE_RATE_CRON_TOKEN;
}

async function refreshExchangeRates(env) {
  const response = await fetch(SOURCE_URL, {
    headers: {
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`exchange rate source returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.result !== 'success' || !payload?.rates) {
    throw new Error(`exchange rate source returned ${payload?.result || 'an invalid payload'}`);
  }

  const updatedAt = new Date().toISOString();
  const statements = [];

  for (const currency of TARGET_CURRENCIES) {
    const rate = Number(payload.rates[currency]);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`missing or invalid ${currency} rate`);
    }

    statements.push(
      env.DB
        .prepare(`
          INSERT INTO exchange_rates (currency, rate, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(currency) DO UPDATE SET
            rate = excluded.rate,
            updated_at = excluded.updated_at
        `)
        .bind(currency, String(rate), updatedAt)
    );
  }

  await env.DB.batch(statements);

  return {
    base: 'USD',
    currencies: TARGET_CURRENCIES,
    sourceUpdatedAt: payload.time_last_update_utc || null,
    updatedAt
  };
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      refreshExchangeRates(env).catch((error) => {
        console.error('exchange rate refresh skipped:', error);
      })
    );
  },

  async fetch(request, env) {
    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405);
    }

    if (!env.EXCHANGE_RATE_CRON_TOKEN) {
      return json({ error: 'manual refresh is disabled until EXCHANGE_RATE_CRON_TOKEN is configured' }, 503);
    }

    if (!isAuthorized(request, env)) {
      return json({ error: 'unauthorized' }, 401);
    }

    try {
      const result = await refreshExchangeRates(env);
      return json({ ok: true, ...result });
    } catch (error) {
      console.error('manual exchange rate refresh failed:', error);
      return json({ ok: false, error: 'exchange rate refresh failed; previous rates were kept' }, 502);
    }
  }
};
