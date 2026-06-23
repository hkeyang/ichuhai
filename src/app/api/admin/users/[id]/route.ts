// src/app/api/admin/users/[id]/route.ts
// GET /api/admin/users/[id] — 用户详情/风险档案（[id] = email，需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-guard";
import { formatOrder, formatNotification, formatSupportTicket } from "@/lib/api/formatters";
import type { OrderRow, NotificationRow, SupportTicketRow } from "@/lib/api/types";

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
    const email = decodeURIComponent(id).trim().toLowerCase();
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const orderResult = await db
      .prepare("SELECT * FROM orders WHERE LOWER(email) = ? ORDER BY created_at DESC LIMIT 200")
      .bind(email)
      .all<OrderRow>();
    if (!orderResult.results.length) throw new HttpError(404, "user not found");

    const orders = orderResult.results;
    const orderIds = orders.map((o) => o.id);
    const telegramUsername = orders.find((o) => o.telegram_username)?.telegram_username ?? null;

    // 该用户的通知 / 售后工单（按 order_id 关联）
    const placeholders = orderIds.map(() => "?").join(",");
    const [notificationsResult, ticketsResult] = await db.batch<Record<string, unknown>>([
      db.prepare(`SELECT * FROM notifications WHERE order_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 100`).bind(...orderIds),
      db.prepare(`SELECT * FROM support_tickets WHERE order_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 100`).bind(...orderIds),
    ]);

    // 黑名单命中记录（email/telegram/钱包地址）
    const tg = String(telegramUsername ?? "").replace(/^@/, "").trim().toLowerCase();
    const blacklistResult = await db
      .prepare("SELECT id, kind, value, reason, effect, status, created_at FROM blacklists WHERE status = 'active'")
      .all<{ id: string; kind: string; value: string; reason: string; effect: string; status: string; created_at: string }>();
    const blacklistHits = blacklistResult.results.filter((row) => {
      const v = String(row.value ?? "").replace(/^@/, "").trim().toLowerCase();
      if (row.kind === "email") return v === email;
      if (row.kind === "telegram_username" || row.kind === "telegram_id") return tg && v === tg;
      return false;
    });

    const paidAmount = orders
      .filter((o) => ["paid", "delivering", "completed"].includes(o.status) && o.paid_at)
      .reduce((sum, o) => sum + Number(o.amount_usdt || 0), 0);
    const walletAddresses = Array.from(
      new Set(orders.map((o) => o.payment_address).filter(Boolean))
    );

    return jsonResponse(
      {
        profile: {
          id: email,
          email,
          telegramUsername,
          orderCount: orders.length,
          paidAmountUsdt: paidAmount.toFixed(3),
          afterSaleCount: orders.filter((o) => (o.after_sale_status ?? "none") !== "none").length,
          firstOrderAt: orders[orders.length - 1]?.created_at ?? null,
          lastOrderAt: orders[0]?.created_at ?? null,
          riskStatus: blacklistHits.length ? "blacklisted" : "normal",
          walletAddresses,
        },
        orders: orders.map(formatOrder),
        notifications: (notificationsResult.results as unknown as NotificationRow[]).map(formatNotification),
        supportTickets: (ticketsResult.results as unknown as SupportTicketRow[]).map(formatSupportTicket),
        blacklistHits,
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[GET /api/admin/users/[id]] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
