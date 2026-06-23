// src/app/api/admin/orders/[id]/route.ts
// GET /api/admin/orders/[id] — 订单详情聚合（需 admin token）
// 复盘支付与发货链路：订单 + 发货记录 + 通知 + 到账交易 + 工单 + 审计日志

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import {
  formatOrder,
  formatDelivery,
  formatNotification,
  formatSupportTicket,
  formatAuditLog,
  formatPaymentTransaction,
} from "@/lib/api/formatters";
import type {
  OrderRow,
  DeliveryRow,
  NotificationRow,
  SupportTicketRow,
  AuditLogRow,
  PaymentTransactionRow,
} from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    await requireAdmin(request, cloudflareEnv);
    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const order = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();
    if (!order) throw new HttpError(404, "order not found");

    const [deliveries, notifications, tickets, audits, transactions] = await db.batch<Record<string, unknown>>([
      db.prepare("SELECT * FROM deliveries WHERE order_id = ? ORDER BY created_at ASC").bind(id),
      db.prepare("SELECT * FROM notifications WHERE order_id = ? ORDER BY created_at ASC").bind(id),
      db.prepare("SELECT * FROM support_tickets WHERE order_id = ? ORDER BY created_at DESC").bind(id),
      db.prepare("SELECT * FROM audit_logs WHERE target = 'order' AND target_id = ? ORDER BY created_at DESC LIMIT 100").bind(id),
      db.prepare(
        "SELECT * FROM payment_transactions WHERE matched_order_id = ? OR matched_order_no = ? ORDER BY detected_at DESC"
      ).bind(id, order.order_no),
    ]);

    return jsonResponse(
      {
        order: formatOrder(order),
        deliveries: (deliveries.results as unknown as DeliveryRow[]).map(formatDelivery),
        notifications: (notifications.results as unknown as NotificationRow[]).map(formatNotification),
        supportTickets: (tickets.results as unknown as SupportTicketRow[]).map(formatSupportTicket),
        auditLogs: (audits.results as unknown as AuditLogRow[]).map(formatAuditLog),
        transactions: (transactions.results as unknown as PaymentTransactionRow[]).map(formatPaymentTransaction),
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/orders/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
