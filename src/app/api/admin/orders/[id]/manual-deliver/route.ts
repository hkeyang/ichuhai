// src/app/api/admin/orders/[id]/manual-deliver/route.ts
// POST /api/admin/orders/[id]/manual-deliver — 手动发货（需 admin token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { writeNotification } from "@/lib/api/notifications";
import { sendDeliveryEmail } from "@/lib/api/mailer";
import { encryptInventoryValue } from "@/lib/api/inventory-crypto";
import { formatDelivery, formatOrder } from "@/lib/api/formatters";
import type { OrderRow, DeliveryRow } from "@/lib/api/types";

function maskValue(value: string): string {
  const normalized = value.trim();
  if (normalized.length <= 6) return "***";
  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
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

  try {
    const token = request.headers.get("x-admin-token") || "";
    const isProduction = cloudflareEnv.NODE_ENV === "production";
    if (isProduction) {
      const valid = await verifyAdminSessionToken(token, cloudflareEnv);
      if (!valid) return jsonResponse({ error: "admin auth required" }, 401, request, cloudflareEnv);
    }

    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const body = await parseBody<{
      method?: unknown;
      operator?: unknown;
      channel?: unknown;
      maskedContent?: unknown;
      deliveryContent?: unknown;
    }>(request);

    const method = String(body.method ?? "manual").trim();
    const operator = String(body.operator ?? "admin").trim();
    const channel = Array.isArray(body.channel) ? body.channel : ["email"];
    const deliveryContent = String(body.deliveryContent ?? body.maskedContent ?? "").trim();
    if (!deliveryContent) throw new HttpError(422, "deliveryContent is required");
    if (deliveryContent.length > 4000) throw new HttpError(422, "deliveryContent is too long");
    const maskedContent = maskValue(deliveryContent);
    const encryptedDeliveryContent = await encryptInventoryValue(
      deliveryContent,
      cloudflareEnv.INVENTORY_ENCRYPTION_KEY
    );

    // 1. 查询订单，验证存在
    const order = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    if (!order) throw new HttpError(404, "order not found");

    // 2. UPDATE orders SET status='completed', delivered_at=datetime('now')
    await db
      .prepare(
        "UPDATE orders SET status = 'completed', delivery_status = 'delivered', delivered_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
      )
      .bind(id)
      .run();

    // 3. INSERT INTO deliveries
    const deliveryId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO deliveries (id, order_id, method, operator, channel, masked_content, encrypted_content, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', datetime('now'))`
      )
      .bind(
        deliveryId,
        id,
        method,
        operator,
        JSON.stringify(channel),
        maskedContent,
        encryptedDeliveryContent
      )
      .run();

    const delivery = await db
      .prepare("SELECT * FROM deliveries WHERE id = ?")
      .bind(deliveryId)
      .first<DeliveryRow>();

    // 4. 发送发货邮件（fire-and-forget）
    const updatedOrder = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    const notificationId = crypto.randomUUID();

    const afterDeliver = (async () => {
      let mailResult: { ok: boolean; provider: string; messageId: string | null; error?: string };
      try {
        mailResult = await sendDeliveryEmail(
          updatedOrder!,
          deliveryContent,
          cloudflareEnv
        );
      } catch (err) {
        mailResult = {
          ok: false,
          provider: "mailchannels",
          messageId: null,
          error: err instanceof Error ? err.message : "delivery notification failed",
        };
      }

      // 5. 写 notification
      try {
        await db
          .prepare(
            `INSERT INTO notifications (id, order_id, channel, type, provider, status, message_id, error, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(
            notificationId,
            id,
            "email",
            "delivery",
            mailResult.provider,
            mailResult.ok ? "sent" : "failed",
            mailResult.messageId ?? null,
            mailResult.error ?? null
          )
          .run();
      } catch {
        // 通知写入失败不影响主流程
      }

      // 6. 写 audit_log
      try {
        await writeAuditLog(
          db,
          request,
          { actorId: "admin", role: "admin" },
          "order.manual_deliver",
          "order",
          id,
          { deliveryId, method, operator, channel }
        );
      } catch {
        // 审计日志写入失败不影响主流程
      }
    })();

    try {
      const ctx = await getCloudflareContext();
      if (ctx.ctx && typeof (ctx.ctx as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil === "function") {
        (ctx.ctx as { waitUntil: (p: Promise<unknown>) => void }).waitUntil(afterDeliver);
      }
    } catch {
      // waitUntil 不可用时忽略
    }

    // 7. 返回 { order, delivery, notification }
    return jsonResponse(
      {
        order: updatedOrder ? formatOrder(updatedOrder) : null,
        delivery: delivery ? formatDelivery(delivery) : null,
        notification: { id: notificationId, orderId: id, channel: "email", type: "delivery" },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/admin/orders/[id]/manual-deliver] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
