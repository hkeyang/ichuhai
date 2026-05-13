// src/app/api/orders/[id]/txhash/route.ts
// POST /api/orders/:id/txhash — 提交交易哈希，将订单状态从 pending_payment 改为 payment_confirming

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/api/audit";
import { formatOrder } from "@/lib/api/formatters";
import type { OrderRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  const db = cloudflareEnv.DB;
  await ensureDatabaseReady(db);

  try {
    const { id } = await params;

    // 解析请求体
    const body = await parseBody<{ txHash?: unknown }>(request);
    const rawTxHash = String(body.txHash ?? "").trim();

    // 校验 txHash 格式：长度 ≥ 12，不含 `<>`
    if (rawTxHash.length < 12) {
      throw new HttpError(422, "txHash is invalid");
    }
    if (/[<>]/.test(rawTxHash)) {
      throw new HttpError(422, "txHash must not contain html");
    }

    // 查询订单（支持 id 或 orderNo）
    const order = await db
      .prepare(
        `SELECT * FROM orders WHERE id = ? OR order_no = ? LIMIT 1`
      )
      .bind(id, id)
      .first<OrderRow>();

    if (!order) {
      throw new HttpError(404, "order not found");
    }

    // 校验订单状态必须为 pending_payment
    if (order.status !== "pending_payment") {
      throw new HttpError(409, "order is not in pending_payment status");
    }

    // 检查 txHash 是否已被其他订单使用
    const existing = await db
      .prepare(
        `SELECT id FROM orders WHERE tx_hash = ? AND id != ? LIMIT 1`
      )
      .bind(rawTxHash, order.id)
      .first<{ id: string }>();

    if (existing) {
      throw new HttpError(409, "txHash already used by another order");
    }

    // 更新 tx_hash 并将状态改为 payment_confirming
    await db
      .prepare(
        `UPDATE orders
         SET tx_hash = ?, status = 'payment_confirming', updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(rawTxHash, order.id)
      .run();

    // 写入审计日志
    await writeAuditLog(
      db,
      request,
      { actorId: order.telegram_username || "anonymous", role: "user" },
      "order.submit_txhash",
      "order",
      order.id,
      { txHash: rawTxHash, previousStatus: order.status }
    );

    // 查询更新后的订单
    const updated = await db
      .prepare(`SELECT * FROM orders WHERE id = ? LIMIT 1`)
      .bind(order.id)
      .first<OrderRow>();

    return jsonResponse(updated ? formatOrder(updated) : null, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
