// src/app/api/orders/[id]/tickets/route.ts
// POST /api/orders/:id/tickets — 创建售后工单

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { formatSupportTicket } from "@/lib/api/formatters";
import { writeNotification } from "@/lib/api/notifications";
import type { OrderRow, SupportTicketRow } from "@/lib/api/types";

/**
 * 生成工单号：TK + yyyyMMddHHmmss + 3位随机数字
 * 例：TK20240115143022847
 */
function generateTicketNo(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const datetime =
    String(now.getFullYear()) +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const random3 = pad(Math.floor(Math.random() * 1000), 3);
  return `TK${datetime}${random3}`;
}

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
    const body = await parseBody<{ type?: unknown; description?: unknown }>(request);

    // 校验 description：非空，≤1000字符，不含 `<>`
    const rawDescription = String(body.description ?? "").trim();
    if (!rawDescription) {
      throw new HttpError(422, "description is required");
    }
    if (rawDescription.length > 1000) {
      throw new HttpError(422, "description must be 1000 characters or less");
    }
    if (/[<>]/.test(rawDescription)) {
      throw new HttpError(422, "description must not contain html");
    }

    // type 默认为 after_sales
    const ticketType = String(body.type ?? "after_sales").trim() || "after_sales";

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

    // 生成工单号
    const ticketNo = generateTicketNo();
    const ticketId = crypto.randomUUID();

    // 插入工单记录
    await db
      .prepare(
        `INSERT INTO support_tickets (id, ticket_no, order_id, order_no, type, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))`
      )
      .bind(ticketId, ticketNo, order.id, order.order_no, ticketType, rawDescription)
      .run();

    // 写入通知记录
    await writeNotification(db, {
      orderId: order.id,
      channel: "internal",
      type: "support_ticket_created",
      provider: "internal",
      status: "sent",
      messageId: ticketId,
    });

    // 查询刚创建的工单
    const ticket = await db
      .prepare(`SELECT * FROM support_tickets WHERE id = ? LIMIT 1`)
      .bind(ticketId)
      .first<SupportTicketRow>();

    return jsonResponse(ticket ? formatSupportTicket(ticket) : null, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
