// src/app/api/internal/orders/[id]/deliver/route.ts
// POST /api/internal/orders/[id]/deliver — 内部自动发货（需 x-internal-token）

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { timingSafeEqual } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { writeNotification } from "@/lib/api/notifications";
import { sendDeliveryEmail } from "@/lib/api/mailer";
import { decryptInventoryValue } from "@/lib/api/inventory-crypto";
import { formatDelivery, formatOrder } from "@/lib/api/formatters";
import type { OrderRow, DeliveryRow, InventoryItemRow } from "@/lib/api/types";

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
    // 内部 token 验证（生产环境强制）
    const internalToken = request.headers.get("x-internal-token") || "";
    const isProduction = cloudflareEnv.NODE_ENV === "production";
    if (isProduction) {
      if (
        !cloudflareEnv.INTERNAL_API_SECRET ||
        !timingSafeEqual(internalToken, cloudflareEnv.INTERNAL_API_SECRET)
      ) {
        return jsonResponse(
          { error: "internal auth required" },
          401,
          request,
          cloudflareEnv
        );
      }
    }

    const { id } = await params;
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    // 1. 查询订单，验证存在
    const order = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    if (!order) throw new HttpError(404, "order not found");

    // 2. 从 inventory_items 查询 status='available' 的库存项（sku_id 匹配）
    const inventoryItem = await db
      .prepare(
        `SELECT * FROM inventory_items
         WHERE sku_id = ? AND status = 'available'
         LIMIT 1`
      )
      .bind(order.sku_id)
      .first<InventoryItemRow>();

    let decryptedValue: string | null = null;
    let deliveryId: string | null = null;

    if (inventoryItem) {
      // 3. 解密库存值
      decryptedValue = await decryptInventoryValue(
        inventoryItem.encrypted_value,
        cloudflareEnv.INVENTORY_ENCRYPTION_KEY
      );

      // 4. UPDATE inventory_items SET status='delivered', order_id=?
      await db
        .prepare(
          `UPDATE inventory_items
           SET status = 'delivered', order_id = ?
           WHERE id = ?`
        )
        .bind(id, inventoryItem.id)
        .run();
    }

    // 5. UPDATE orders SET status='completed', delivered_at=datetime('now')
    await db
      .prepare(
        `UPDATE orders
         SET status = 'completed', delivered_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(id)
      .run();

    // 6. INSERT INTO deliveries
    deliveryId = crypto.randomUUID();
    const maskedContent = inventoryItem?.masked_value ?? "********";
    await db
      .prepare(
        `INSERT INTO deliveries (id, order_id, method, operator, channel, masked_content, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(
        deliveryId,
        id,
        "auto",
        "internal",
        JSON.stringify(["email"]),
        maskedContent
      )
      .run();

    const delivery = await db
      .prepare("SELECT * FROM deliveries WHERE id = ?")
      .bind(deliveryId)
      .first<DeliveryRow>();

    const updatedOrder = await db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .bind(id)
      .first<OrderRow>();

    // 7. 发送发货邮件（fire-and-forget）+ 写 notification + audit_log
    const notificationId = crypto.randomUUID();

    const afterDeliver = (async () => {
      let mailResult: {
        ok: boolean;
        provider: string;
        messageId: string | null;
        error?: string;
      };
      try {
        mailResult = await sendDeliveryEmail(
          updatedOrder!,
          maskedContent,
          cloudflareEnv
        );
      } catch (err) {
        mailResult = {
          ok: false,
          provider: "mailchannels",
          messageId: null,
          error:
            err instanceof Error
              ? err.message
              : "delivery notification failed",
        };
      }

      // 写 notification
      try {
        await writeNotification(db, {
          orderId: id,
          channel: "email",
          type: "delivery",
          provider: mailResult.provider,
          status: mailResult.ok ? "sent" : "failed",
          messageId: mailResult.messageId,
          error: mailResult.error,
        });
      } catch {
        // 通知写入失败不影响主流程
      }

      // 写 audit_log
      try {
        await writeAuditLog(
          db,
          request,
          { actorId: "internal", role: "internal" },
          "order.deliver",
          "order",
          id,
          {
            deliveryId,
            inventoryItemId: inventoryItem?.id ?? null,
            method: "auto",
          }
        );
      } catch {
        // 审计日志写入失败不影响主流程
      }
    })();

    try {
      const ctx = await getCloudflareContext();
      if (
        ctx.ctx &&
        typeof (ctx.ctx as { waitUntil?: (p: Promise<unknown>) => void })
          .waitUntil === "function"
      ) {
        (
          ctx.ctx as { waitUntil: (p: Promise<unknown>) => void }
        ).waitUntil(afterDeliver);
      }
    } catch {
      // waitUntil 不可用时忽略
    }

    // 8. 返回 { order, delivery, notification }
    return jsonResponse(
      {
        order: updatedOrder ? formatOrder(updatedOrder) : null,
        delivery: delivery ? formatDelivery(delivery) : null,
        notification: {
          id: notificationId,
          orderId: id,
          channel: "email",
          type: "delivery",
        },
      },
      200,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        { error: error.message },
        error.status,
        request,
        cloudflareEnv
      );
    }
    console.error(
      "[POST /api/internal/orders/[id]/deliver] unexpected error:",
      error
    );
    return jsonResponse(
      { error: "internal server error" },
      500,
      request,
      cloudflareEnv
    );
  }
}
