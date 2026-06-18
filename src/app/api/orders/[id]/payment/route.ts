import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { decryptInventoryValue } from "@/lib/api/inventory-crypto";
import type { DeliveryRow, OrderRow } from "@/lib/api/types";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function deliveryPayload(
  db: D1Database,
  orderId: string,
  env: CloudflareEnv
) {
  const delivery = await db
    .prepare("SELECT * FROM deliveries WHERE order_id = ? ORDER BY created_at DESC LIMIT 1")
    .bind(orderId)
    .first<DeliveryRow>();

  if (!delivery) return null;

  let deliveryContent: string | null = null;
  if (delivery.encrypted_content) {
    try {
      deliveryContent = await decryptInventoryValue(
        delivery.encrypted_content,
        env.INVENTORY_ENCRYPTION_KEY
      );
    } catch {
      deliveryContent = null;
    }
  }

  return {
    id: delivery.id,
    method: delivery.method,
    operator: delivery.operator,
    channel: parseJson<string[]>(delivery.channel, []),
    maskedContent: delivery.masked_content,
    deliveryContent,
    status: delivery.status ?? "sent",
    failureReason: delivery.failure_reason ?? null,
    createdAt: delivery.created_at,
  };
}

async function orderPaymentPayload(
  db: D1Database,
  order: OrderRow,
  statusOverride: string | null,
  env: CloudflareEnv
) {
  return {
    orderId: order.id,
    orderNo: order.order_no,
    status: statusOverride ?? order.status,
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
    paymentProvider: order.payment_provider ?? null,
    providerPaymentId: order.provider_payment_id ?? null,
    providerPaymentStatus: order.provider_payment_status ?? null,
    providerPaymentUrl: order.provider_payment_url ?? null,
    providerPayload: parseJson(order.provider_payload_json ?? "{}", {}),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    productSnapshot: parseJson(order.product_snapshot, {}),
    skuSnapshot: parseJson(order.sku_snapshot, {}),
    delivery: await deliveryPayload(db, order.id, env),
  };
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  try {
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    // 支持通过 id（UUID）或 orderNo 查询
    const order = await db
      .prepare(
        "SELECT * FROM orders WHERE id = ? OR order_no = ? LIMIT 1"
      )
      .bind(id, id)
      .first<OrderRow>();

    if (!order) {
      throw new HttpError(404, "order not found");
    }

    // 惰性过期检测：pending_payment 且已超过 expires_at
    if (
      order.status === "pending_payment" &&
      new Date(order.expires_at) < new Date()
    ) {
      // 异步更新状态为 expired，不阻塞响应
      db.prepare(
        "UPDATE orders SET status = 'expired', updated_at = datetime('now') WHERE id = ? AND status = 'pending_payment'"
      )
        .bind(order.id)
        .run()
        .catch(() => {
          // 忽略更新失败，不影响响应
        });

      // 返回时使用 expired 状态
      return jsonResponse(
        await orderPaymentPayload(db, order, "expired", cloudflareEnv),
        200,
        request,
        cloudflareEnv
      );
    }

    return jsonResponse(
      await orderPaymentPayload(db, order, null, cloudflareEnv),
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        { error: error.message },
        error.status,
        request,
        cloudflareEnv
      );
    }
    return jsonResponse(
      { error: "internal server error" },
      500,
      request,
      cloudflareEnv
    );
  }
}
