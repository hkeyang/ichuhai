// src/app/api/admin/payment-transactions/[id]/route.ts
// PATCH /api/admin/payment-transactions/[id] — 支付异常处理（人工绑定订单 / 忽略，需 admin token + 审计）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import { formatOrder, formatPaymentTransaction } from "@/lib/api/formatters";
import type { OrderRow, PaymentTransactionRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const body = await parseBody<{ action?: unknown; orderId?: unknown; reason?: unknown }>(request);
    const action = String(body.action ?? "").trim();
    const reason = String(body.reason ?? "").trim();

    const tx = await db
      .prepare("SELECT * FROM payment_transactions WHERE id = ?")
      .bind(id)
      .first<PaymentTransactionRow>();
    if (!tx) throw new HttpError(404, "payment transaction not found");

    if (action === "bind") {
      const orderId = String(body.orderId ?? "").trim();
      if (!orderId) throw new HttpError(422, "orderId is required");
      if (!reason) throw new HttpError(422, "绑定订单必须填写原因");

      // 该交易若已匹配其它订单则不可重复绑定
      if (["matched", "manual_confirm"].includes(tx.match_status) && tx.matched_order_id && tx.matched_order_id !== orderId) {
        throw new HttpError(409, "该交易已绑定其它订单");
      }

      const order = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first<OrderRow>();
      if (!order) throw new HttpError(404, "order not found");

      // txHash 不能重复绑定到多个订单
      const dupOrder = await db
        .prepare("SELECT id FROM orders WHERE tx_hash = ? AND id <> ? LIMIT 1")
        .bind(tx.tx_hash, orderId)
        .first<{ id: string }>();
      if (dupOrder) throw new HttpError(409, "该 txHash 已绑定其它订单");

      await db
        .prepare(
          `UPDATE payment_transactions SET match_status = 'manual_confirm', matched_order_id = ?, matched_order_no = ?,
             exception_type = NULL, confirmed_at = COALESCE(confirmed_at, datetime('now')), note = ?, updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(orderId, order.order_no, reason, id)
        .run();

      await db
        .prepare(
          `UPDATE orders SET status = CASE WHEN status IN ('completed','delivering') THEN status ELSE 'paid' END,
             payment_status = 'paid', tx_hash = COALESCE(tx_hash, ?), paid_at = COALESCE(paid_at, datetime('now')), updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(tx.tx_hash, orderId)
        .run();

      await writeAuditLog(db, request, actor, "payment.bind_order", "payment_transaction", id, {
        txHash: tx.tx_hash,
        orderId,
        orderNo: order.order_no,
        amount: tx.amount,
        reason,
      });

      const updatedOrder = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first<OrderRow>();
      const updatedTx = await db.prepare("SELECT * FROM payment_transactions WHERE id = ?").bind(id).first<PaymentTransactionRow>();
      return jsonResponse(
        { transaction: updatedTx ? formatPaymentTransaction(updatedTx) : null, order: updatedOrder ? formatOrder(updatedOrder) : null },
        200,
        request,
        cloudflareEnv
      );
    }

    if (action === "ignore") {
      if (!reason) throw new HttpError(422, "忽略异常必须填写原因");
      await db
        .prepare("UPDATE payment_transactions SET match_status = 'ignored', note = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(reason, id)
        .run();
      await writeAuditLog(db, request, actor, "payment.ignore", "payment_transaction", id, {
        txHash: tx.tx_hash,
        previousStatus: tx.match_status,
        reason,
      });
      const updatedTx = await db.prepare("SELECT * FROM payment_transactions WHERE id = ?").bind(id).first<PaymentTransactionRow>();
      return jsonResponse({ transaction: updatedTx ? formatPaymentTransaction(updatedTx) : null }, 200, request, cloudflareEnv);
    }

    throw new HttpError(422, "unsupported action");
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[PATCH /api/admin/payment-transactions/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
