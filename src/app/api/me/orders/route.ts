import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";
import type { DeliveryRow, OrderRow } from "@/lib/api/types";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function orderPayload(order: OrderRow, delivery?: DeliveryRow) {
  return {
    orderId: order.id,
    orderNo: order.order_no,
    status: order.status,
    telegramUsername: order.telegram_username,
    email: order.email,
    amountUsdt: order.amount_usdt,
    fiatCurrency: order.fiat_currency,
    fiatAmountSnapshot: order.fiat_amount_snapshot,
    exchangeRateSnapshot: order.exchange_rate_snapshot,
    paymentCurrency: order.payment_currency,
    paymentNetwork: order.payment_network,
    paymentAddress: order.payment_address,
    txHash: order.tx_hash,
    paidAt: order.paid_at,
    deliveredAt: order.delivered_at,
    expiresAt: order.expires_at,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    productSnapshot: parseJson(order.product_snapshot, {}),
    skuSnapshot: parseJson(order.sku_snapshot, {}),
    delivery: delivery ? {
      id: delivery.id,
      method: delivery.method,
      channel: parseJson<string[]>(delivery.channel, []),
      maskedContent: delivery.masked_content,
      status: delivery.status ?? "sent",
      createdAt: delivery.created_at,
    } : null,
  };
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, telegram_username, email FROM users WHERE id = ?")
      .bind(userId)
      .first<{ id: string; telegram_username: string | null; email: string | null }>();

    if (!user) throw new HttpError(404, "user not found");

    // 订单可能按 telegram_username（Telegram 用户）或 email（邮箱用户）关联
    const matchValues: string[] = [];
    if (user.telegram_username) {
      const username = user.telegram_username.startsWith("@")
        ? user.telegram_username.slice(1)
        : user.telegram_username;
      matchValues.push(username, `@${username}`);
    }
    const conditions: string[] = [];
    if (matchValues.length) {
      conditions.push(`telegram_username IN (${matchValues.map(() => "?").join(",")})`);
    }
    if (user.email) conditions.push("email = ?");

    if (!conditions.length) {
      return jsonResponse({ orders: [] }, 200, request, cloudflareEnv);
    }

    const bindValues = [...matchValues, ...(user.email ? [user.email] : [])];
    const result = await db
      .prepare(
        `SELECT * FROM orders
         WHERE ${conditions.join(" OR ")}
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .bind(...bindValues)
      .all<OrderRow>();

    const deliveries = result.results.length
      ? await db
          .prepare(
            `SELECT * FROM deliveries
             WHERE order_id IN (${result.results.map(() => "?").join(",")})
             ORDER BY created_at DESC`
          )
          .bind(...result.results.map((order) => order.id))
          .all<DeliveryRow>()
      : { results: [] as DeliveryRow[] };
    const deliveryByOrder = new Map<string, DeliveryRow>();
    for (const delivery of deliveries.results) {
      if (!deliveryByOrder.has(delivery.order_id)) deliveryByOrder.set(delivery.order_id, delivery);
    }

    return jsonResponse(
      { orders: result.results.map((order) => orderPayload(order, deliveryByOrder.get(order.id))) },
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
