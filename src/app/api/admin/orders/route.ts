// src/app/api/admin/orders/route.ts
// GET /api/admin/orders — 订单列表（服务端筛选 + 分页，需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin, parsePagination, param, pageEnvelope } from "@/lib/api/admin-guard";
import { formatOrder } from "@/lib/api/formatters";
import type { OrderRow } from "@/lib/api/types";

const ORDER_STATUS = new Set([
  "created", "pending_payment", "payment_confirming", "paid",
  "delivering", "completed", "expired", "failed", "refunding", "refunded",
]);
const PAYMENT_STATUS = new Set(["unpaid", "confirming", "paid", "failed", "exception"]);
const DELIVERY_STATUS = new Set(["undelivered", "manual_required", "delivering", "delivered", "failed"]);
const AFTER_SALE_STATUS = new Set(["none", "open", "in_progress", "resolved", "closed"]);

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const url = new URL(request.url);
    const q = param(url, "q");
    const status = param(url, "status");
    const paymentStatus = param(url, "paymentStatus");
    const deliveryStatus = param(url, "deliveryStatus");
    const afterSaleStatus = param(url, "afterSaleStatus");
    const network = param(url, "network");
    const dateFrom = param(url, "dateFrom");
    const dateTo = param(url, "dateTo");
    const pagination = parsePagination(url);

    const where: string[] = [];
    const binds: unknown[] = [];

    if (status && ORDER_STATUS.has(status)) {
      where.push("status = ?");
      binds.push(status);
    }
    if (paymentStatus && PAYMENT_STATUS.has(paymentStatus)) {
      where.push("COALESCE(payment_status,'unpaid') = ?");
      binds.push(paymentStatus);
    }
    if (deliveryStatus && DELIVERY_STATUS.has(deliveryStatus)) {
      where.push("COALESCE(delivery_status,'undelivered') = ?");
      binds.push(deliveryStatus);
    }
    if (afterSaleStatus && AFTER_SALE_STATUS.has(afterSaleStatus)) {
      where.push("COALESCE(after_sale_status,'none') = ?");
      binds.push(afterSaleStatus);
    }
    if (network) {
      where.push("payment_network = ?");
      binds.push(network.toUpperCase());
    }
    if (dateFrom) {
      where.push("created_at >= ?");
      binds.push(dateFrom.length === 10 ? `${dateFrom} 00:00:00` : dateFrom);
    }
    if (dateTo) {
      where.push("created_at <= ?");
      binds.push(dateTo.length === 10 ? `${dateTo} 23:59:59` : dateTo);
    }
    if (q) {
      where.push("(order_no LIKE ? OR telegram_username LIKE ? OR email LIKE ? OR tx_hash LIKE ?)");
      const like = `%${q}%`;
      binds.push(like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM orders ${whereSql}`)
      .bind(...binds)
      .first<{ total: number }>();

    const listResult = await db
      .prepare(`SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...binds, pagination.pageSize, pagination.offset)
      .all<OrderRow>();

    return jsonResponse(
      pageEnvelope(listResult.results.map(formatOrder), Number(totalRow?.total ?? 0), pagination),
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/orders] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
