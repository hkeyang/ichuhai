import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import type { OrderRow } from "@/lib/api/types";

interface LookupBody {
  orderNo?: unknown;
  contact?: unknown;
  txHash?: unknown;
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  try {
    const db = (env as CloudflareEnv).DB;
    await ensureDatabaseReady(db);
    const body = await parseBody<LookupBody>(request);

    const orderNo = body.orderNo ? String(body.orderNo).trim() : "";
    const contact = body.contact ? String(body.contact).trim() : "";
    const txHash = body.txHash ? String(body.txHash).trim() : "";

    let order: OrderRow | null = null;

    // 优先通过 txHash 查询
    if (txHash) {
      order = await db
        .prepare("SELECT * FROM orders WHERE tx_hash = ? LIMIT 1")
        .bind(txHash)
        .first<OrderRow>();
    }

    // 通过 orderNo + contact 查询（contact 可以是 email 或 telegramUsername）
    if (!order && orderNo && contact) {
      // 处理 telegramUsername 的 @ 前缀变体
      const contactNormalized = contact.startsWith("@")
        ? contact.slice(1)
        : contact;
      const contactWithAt = contact.startsWith("@") ? contact : `@${contact}`;

      order = await db
        .prepare(
          `SELECT * FROM orders
           WHERE order_no = ?
             AND (
               email = ?
               OR telegram_username = ?
               OR telegram_username = ?
             )
           LIMIT 1`
        )
        .bind(orderNo, contact, contactNormalized, contactWithAt)
        .first<OrderRow>();
    }

    if (!order) {
      throw new HttpError(404, "order not found");
    }

    return jsonResponse(
      {
        orderId: order.id,
        orderNo: order.order_no,
        status: order.status,
        productSnapshot: JSON.parse(order.product_snapshot),
        skuSnapshot: JSON.parse(order.sku_snapshot),
        amountUsdt: order.amount_usdt,
        fiatCurrency: order.fiat_currency,
        fiatAmountSnapshot: order.fiat_amount_snapshot,
        paymentNetwork: order.payment_network,
        paymentAddress: order.payment_address,
        txHash: order.tx_hash,
        paidAt: order.paid_at,
        deliveredAt: order.delivered_at,
        expiresAt: order.expires_at,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
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
