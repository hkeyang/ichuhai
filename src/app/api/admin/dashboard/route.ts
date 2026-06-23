// src/app/api/admin/dashboard/route.ts
// GET /api/admin/dashboard — 运营看板真实指标 + 待处理队列（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";

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

    // 单次往返聚合所有标量指标。今日口径以服务器（UTC）当天为准：date(col) = date('now')。
    const metricsRow = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM orders WHERE date(created_at) = date('now')) AS todayOrders,
          (SELECT COUNT(*) FROM orders WHERE paid_at IS NOT NULL AND date(paid_at) = date('now')) AS todayPaidOrders,
          (SELECT COALESCE(SUM(CAST(amount_usdt AS REAL)), 0)
             FROM orders
             WHERE paid_at IS NOT NULL AND date(paid_at) = date('now')
               AND status IN ('paid','delivering','completed')) AS todayRevenue,
          (SELECT COUNT(*) FROM orders WHERE status IN ('pending_payment','payment_confirming')) AS pendingPayment,
          (SELECT COUNT(*) FROM orders
             WHERE status IN ('paid','delivering')
               AND COALESCE(delivery_status,'undelivered') NOT IN ('delivered','failed')) AS paidPendingDelivery,
          (SELECT COUNT(*) FROM orders WHERE COALESCE(delivery_status,'undelivered') = 'failed') AS deliveryFailed,
          (SELECT COUNT(*) FROM orders WHERE COALESCE(delivery_status,'undelivered') = 'manual_required') AS manualDeliveryRequired,
          (SELECT COUNT(*) FROM payment_transactions
             WHERE match_status NOT IN ('matched','manual_confirm','ignored','resolved')) AS paymentExceptions,
          (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open','in_progress')) AS supportPending,
          (SELECT COUNT(*) FROM notifications WHERE status = 'failed') AS notificationFailed`
      )
      .first<{
        todayOrders: number;
        todayPaidOrders: number;
        todayRevenue: number;
        pendingPayment: number;
        paidPendingDelivery: number;
        deliveryFailed: number;
        manualDeliveryRequired: number;
        paymentExceptions: number;
        supportPending: number;
        notificationFailed: number;
      }>();

    // 库存预警：按 SKU 聚合真实 available 数量，与 warning_stock 比较。
    const lowStockResult = await db
      .prepare(
        `SELECT s.id AS skuId, s.product_id AS productId, p.name AS productName,
                s.sku_name AS skuName, s.option_values AS optionValues,
                COALESCE(s.warning_stock, 5) AS warningStock, s.delivery_type AS deliveryType,
                COALESCE(inv.available, 0) AS available,
                inv.lastImportAt AS lastImportAt
         FROM skus s
         LEFT JOIN products p ON p.id = s.product_id
         LEFT JOIN (
            SELECT sku_id,
                   SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
                   MAX(created_at) AS lastImportAt
            FROM inventory_items GROUP BY sku_id
         ) inv ON inv.sku_id = s.id
         WHERE s.delivery_type IN ('auto','mixed')
           AND COALESCE(inv.available, 0) <= COALESCE(s.warning_stock, 5)
         ORDER BY available ASC, s.product_id ASC
         LIMIT 50`
      )
      .all<{
        skuId: string;
        productId: string;
        productName: string | null;
        skuName: string | null;
        optionValues: string | null;
        warningStock: number;
        deliveryType: string;
        available: number;
        lastImportAt: string | null;
      }>();

    const lowStockSkus = lowStockResult.results.map((row) => ({
      skuId: row.skuId,
      productId: row.productId,
      productName: row.productName,
      skuName: row.skuName,
      optionValues: parseJsonObject(row.optionValues),
      warningStock: row.warningStock,
      deliveryType: row.deliveryType,
      available: row.available,
      lastImportAt: row.lastImportAt,
      suggestedRestock: Math.max(row.warningStock * 3 - row.available, row.warningStock),
    }));

    // 队列：支付异常、待发货任务、待处理工单
    const [exceptionsResult, deliveryResult, ticketsResult] = await db.batch<Record<string, unknown>>([
      db.prepare(
        `SELECT id, tx_hash, network, amount, to_address, match_status, exception_type, detected_at, matched_order_no
         FROM payment_transactions
         WHERE match_status NOT IN ('matched','manual_confirm','ignored','resolved')
         ORDER BY detected_at DESC LIMIT 20`
      ),
      db.prepare(
        `SELECT id, order_no, telegram_username, email, amount_usdt, status,
                COALESCE(delivery_status,'undelivered') AS delivery_status, sku_snapshot, created_at
         FROM orders
         WHERE (status IN ('paid','delivering') AND COALESCE(delivery_status,'undelivered') NOT IN ('delivered'))
            OR COALESCE(delivery_status,'undelivered') IN ('manual_required','failed')
         ORDER BY created_at ASC LIMIT 20`
      ),
      db.prepare(
        `SELECT id, ticket_no, order_no, type, status, description, created_at
         FROM support_tickets WHERE status IN ('open','in_progress')
         ORDER BY created_at ASC LIMIT 20`
      ),
    ]);

    const metrics = {
      todayOrders: Number(metricsRow?.todayOrders ?? 0),
      todayPaidOrders: Number(metricsRow?.todayPaidOrders ?? 0),
      todayRevenueUsdt: Number(metricsRow?.todayRevenue ?? 0).toFixed(3),
      pendingPayment: Number(metricsRow?.pendingPayment ?? 0),
      paidPendingDelivery: Number(metricsRow?.paidPendingDelivery ?? 0),
      deliveryFailed: Number(metricsRow?.deliveryFailed ?? 0),
      manualDeliveryRequired: Number(metricsRow?.manualDeliveryRequired ?? 0),
      paymentExceptions: Number(metricsRow?.paymentExceptions ?? 0),
      supportPending: Number(metricsRow?.supportPending ?? 0),
      notificationFailed: Number(metricsRow?.notificationFailed ?? 0),
      lowStockSkuCount: lowStockSkus.length,
    };

    return jsonResponse(
      {
        metrics,
        queues: {
          paymentExceptions: exceptionsResult.results.map((r) => ({
            id: r.id,
            txHash: r.tx_hash,
            network: r.network,
            amount: r.amount,
            toAddress: r.to_address,
            matchStatus: r.match_status,
            exceptionType: r.exception_type,
            detectedAt: r.detected_at,
            matchedOrderNo: r.matched_order_no,
          })),
          deliveryTasks: deliveryResult.results.map((r) => ({
            id: r.id,
            orderNo: r.order_no,
            telegramUsername: r.telegram_username,
            email: r.email,
            amountUsdt: r.amount_usdt,
            status: r.status,
            deliveryStatus: r.delivery_status,
            sku: parseJsonObject(r.sku_snapshot as string | null),
            createdAt: r.created_at,
          })),
          supportTickets: ticketsResult.results.map((r) => ({
            id: r.id,
            ticketNo: r.ticket_no,
            orderNo: r.order_no,
            type: r.type,
            status: r.status,
            description: r.description,
            createdAt: r.created_at,
          })),
          lowStockSkus,
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/dashboard] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}

function parseJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
