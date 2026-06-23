// src/app/api/admin/orders/[id]/confirm-payment/route.ts
// POST /api/admin/orders/[id]/confirm-payment — 人工确认到账（高风险，需 admin token + 审计）
//
// 要求：订单必须存在；不能已完成/退款；txHash 不能重复；金额不一致必须填 reason。
// 必须写入 payment_transactions，且不允许只改订单状态不留交易记录。

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { writeAuditLog } from "@/lib/api/audit";
import { formatOrder, formatPaymentTransaction } from "@/lib/api/formatters";
import { amountToUnits } from "@/lib/api/usdt-trc20";
import type { OrderRow, PaymentTransactionRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const actor = await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const body = await parseBody<{
      txHash?: unknown;
      amount?: unknown;
      fromAddress?: unknown;
      toAddress?: unknown;
      reason?: unknown;
      confirmations?: unknown;
    }>(request);

    const txHash = String(body.txHash ?? "").trim();
    const amount = String(body.amount ?? "").trim();
    const fromAddress = String(body.fromAddress ?? "").trim();
    const toAddress = String(body.toAddress ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    const confirmations = Number(body.confirmations ?? 0) || 0;

    // 1. 订单必须存在
    const order = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();
    if (!order) throw new HttpError(404, "order not found");

    // 2. 终态订单不可再确认
    if (["completed", "refunded", "refunding"].includes(order.status)) {
      throw new HttpError(409, `order in status '${order.status}' cannot be confirmed`);
    }

    // 3. txHash 处理：允许“无 txHash 但必须给原因”的人工确
    if (!txHash && !reason) {
      throw new HttpError(422, "txHash 为空时必须填写确认原因");
    }

    // 4. txHash 不能重复（orders.tx_hash 或已匹配/人工确认的 payment_transactions）
    if (txHash) {
      const dupOrder = await db
        .prepare("SELECT id FROM orders WHERE tx_hash = ? AND id <> ? LIMIT 1")
        .bind(txHash, id)
        .first<{ id: string }>();
      if (dupOrder) throw new HttpError(409, "该 txHash 已绑定其它订单");

      const dupTx = await db
        .prepare(
          "SELECT id, matched_order_id FROM payment_transactions WHERE tx_hash = ? AND match_status IN ('matched','manual_confirm') AND COALESCE(matched_order_id,'') <> ? LIMIT 1"
        )
        .bind(txHash, id)
        .first<{ id: string; matched_order_id: string | null }>();
      if (dupTx) throw new HttpError(409, "该 txHash 已存在到账记录并绑定其它订单");
    }

    // 5. 金额一致性：不一致必须有原因
    const amountForTx = amount || order.amount_usdt;
    if (amount && amountToUnits(Number(amount)) !== amountToUnits(Number(order.amount_usdt)) && !reason) {
      throw new HttpError(422, "到账金额与订单金额不一致，必须填写确认原因");
    }

    const network = order.payment_network || "TRON";
    const toAddr = toAddress || order.payment_address;
    const effectiveTxHash = txHash || `manual-${id}-${Date.now()}`;

    // 6. 写入/更新 payment_transactions（按 tx_hash 唯一 upsert）
    const txId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO payment_transactions
          (id, tx_hash, network, token, from_address, to_address, amount, confirmations,
           matched_order_id, matched_order_no, match_status, detected_at, confirmed_at, note, created_at, updated_at)
         VALUES (?, ?, ?, 'USDT', ?, ?, ?, ?, ?, ?, 'manual_confirm', datetime('now'), datetime('now'), ?, datetime('now'), datetime('now'))
         ON CONFLICT(tx_hash) DO UPDATE SET
           match_status = 'manual_confirm',
           matched_order_id = excluded.matched_order_id,
           matched_order_no = excluded.matched_order_no,
           amount = excluded.amount,
           from_address = COALESCE(NULLIF(excluded.from_address,''), payment_transactions.from_address),
           confirmations = excluded.confirmations,
           confirmed_at = datetime('now'),
           exception_type = NULL,
           note = excluded.note,
           updated_at = datetime('now')`
      )
      .bind(
        txId, effectiveTxHash, network, fromAddress || null, toAddr, amountForTx, confirmations,
        id, order.order_no, reason || "人工确认到账"
      )
      .run();

    // 7. 更新订单：paid + payment_status paid + 记录 txHash
    await db
      .prepare(
        `UPDATE orders SET status = CASE WHEN status IN ('completed','delivering') THEN status ELSE 'paid' END,
           payment_status = 'paid', tx_hash = ?, paid_at = COALESCE(paid_at, datetime('now')),
           admin_note = CASE WHEN ? <> '' THEN ? ELSE admin_note END, updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(effectiveTxHash, reason, reason, id)
      .run();

    const updatedOrder = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();
    const tx = await db
      .prepare("SELECT * FROM payment_transactions WHERE tx_hash = ?")
      .bind(effectiveTxHash)
      .first<PaymentTransactionRow>();

    await writeAuditLog(db, request, actor, "order.confirm_payment", "order", id, {
      orderNo: order.order_no,
      txHash: effectiveTxHash,
      manualTxHash: !txHash,
      amount: amountForTx,
      orderAmount: order.amount_usdt,
      fromAddress: fromAddress || null,
      toAddress: toAddr,
      reason,
    });

    return jsonResponse(
      {
        order: updatedOrder ? formatOrder(updatedOrder) : null,
        transaction: tx ? formatPaymentTransaction(tx) : null,
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/orders/[id]/confirm-payment] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
