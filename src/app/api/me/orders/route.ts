import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import type { OrderRow } from "@/lib/api/types";

function userIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "dev" || parts[2] !== "token") return null;
  try {
    return atob(parts[1]);
  } catch {
    return null;
  }
}

function orderPayload(order: OrderRow) {
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
    productSnapshot: JSON.parse(order.product_snapshot),
    skuSnapshot: JSON.parse(order.sku_snapshot),
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
    const userId = userIdFromRequest(request);
    if (!userId) throw new HttpError(401, "unauthorized");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, telegram_username FROM users WHERE id = ?")
      .bind(userId)
      .first<{ id: string; telegram_username: string }>();

    if (!user) throw new HttpError(404, "user not found");

    const username = user.telegram_username.startsWith("@")
      ? user.telegram_username.slice(1)
      : user.telegram_username;
    const usernameWithAt = `@${username}`;

    const result = await db
      .prepare(
        `SELECT * FROM orders
         WHERE telegram_username = ? OR telegram_username = ?
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .bind(username, usernameWithAt)
      .all<OrderRow>();

    return jsonResponse(
      { orders: result.results.map(orderPayload) },
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
