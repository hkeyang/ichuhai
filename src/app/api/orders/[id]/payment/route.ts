import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import type { OrderRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  try {
    const { id } = await params;
    const db = (env as CloudflareEnv).DB;
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
        {
          orderId: order.id,
          orderNo: order.order_no,
          status: "expired",
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
        },
        200,
        request,
        env as CloudflareEnv
      );
    }

    return jsonResponse(
      {
        orderId: order.id,
        orderNo: order.order_no,
        status: order.status,
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
      },
      200,
      request,
      env as CloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        { error: error.message },
        error.status,
        request,
        env as CloudflareEnv
      );
    }
    return jsonResponse(
      { error: "internal server error" },
      500,
      request,
      env as CloudflareEnv
    );
  }
}
